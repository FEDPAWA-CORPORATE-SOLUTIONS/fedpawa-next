// ==========================================================
// FEDPAWA — Boîte de réception admin (CONTRAT-MAIL.md §3) :
// liste antichronologique paginée (expéditeur, sujet, date,
// lu/non lu), filtre « non lus », recherche, badge de non-lus
// (GET /api/v1/admin/mails/count), vue détail avec corps HTML
// ASSAINI (scripts/iframes/gestionnaires d'événements/liens
// javascript: retirés — lib/sanitize-mail-html) et pièces
// jointes listées (nom/type/taille, téléchargement via URL
// temporaire uniquement, jamais insérées en direct), actions
// « tout marquer comme lu ».
//
// NOUVEAU (vague E) :
// - Envoi de nouveaux mails depuis l'admin (POST /api/v1/admin/mails)
// - Réponse à un mail reçu (POST /api/v1/admin/mails/{id}/replier)
// - Vue des mails envoyés (GET /api/v1/admin/mails/envoyes)
// Repli sur données de démonstration EXPLICITEMENT signalées
// si l'API répond 404 (endpoints non déployés). Rôle admin requis (Guarded).
// ==========================================================

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import { sanitizeMailHtml } from "@/lib/sanitize-mail-html";
import {
  MAILS_PAR_PAGE,
  adminFetchMail,
  adminFetchMails,
  adminFetchMailsCount,
  adminFetchEnvoyes,
  adminMarquerMailLu,
  adminMarquerToutLu,
  adminSendMail,
  adminReplyMail,
  type MailDetail,
  type MailEnvoye,
  type MailsCount,
  type MailsPage,
  type MailsEnvoyesPage,
  type MailSummary,
  type AdminSendMailPayload,
} from "@/lib/mails";

export interface AdminMailsProps {
  locale?: Locale;
}

function fmtDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function fmtTaille(octets: number | null | undefined): string {
  if (octets === null || octets === undefined) return "";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(2)} Mo`;
}

export default function AdminMails({ locale = "fr" }: AdminMailsProps) {
  const t = getPageDictionary(locale, "admin_mails");
  const routes = routesFor(locale);

  const [resp, setResp] = useState<MailsPage<MailSummary> | null>(null);
  const [count, setCount] = useState<MailsCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtre, setFiltre] = useState<"" | "non_lus">("");
  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<MailDetail | null>(null);
  const [detailDemo, setDetailDemo] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // ---------- Nouveaux états : envoi / réponse / mails envoyés ----------
  const [view, setView] = useState<
    "liste" | "detail" | "envoyes" | "nouveau" | "repondre"
  >("liste");
  const [envoyes, setEnvoyes] = useState<MailsEnvoyesPage | null>(null);
  const [envoyesLoading, setEnvoyesLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState<{ sujet: string; corps: string }>({
    sujet: "",
    corps: "",
  });

  // États du formulaire "nouveau mail"
  const [formDest, setFormDest] = useState("");
  const [formCopie, setFormCopie] = useState<string[]>([]);
  const [formSujet, setFormSujet] = useState("");
  const [formTexte, setFormTexte] = useState("");

  const loadEnvoyes = useCallback(() => {
    setEnvoyesLoading(true);
    adminFetchEnvoyes({ page: 1, par_page: MAILS_PAR_PAGE })
      .then(setEnvoyes)
      .catch(() => setEnvoyes(null))
      .finally(() => setEnvoyesLoading(false));
  }, []);

  useEffect(() => {
    loadEnvoyes();
  }, [loadEnvoyes]);

  const ouvrirNouveau = () => {
    setView("nouveau");
    setSendError("");
    setSendSuccess("");
    setFormDest("");
    setFormCopie([]);
    setFormSujet("");
    setFormTexte("");
  };

  const annulerNouveau = () => {
    setView("liste");
  };

  const envoyerMail = async () => {
    const payload: AdminSendMailPayload = {
      destinataire: formDest,
      copie: formCopie.length > 0 ? formCopie : undefined,
      sujet: formSujet,
      corps_html: formTexte,
      corps_texte: formTexte,
    };
    setBusy(true);
    setSendError("");
    setSendSuccess("");
    try {
      const r = await adminSendMail(payload);
      setSendSuccess(r.message);
      setView("envoyes");
      loadEnvoyes();
    } catch (e) {
      setSendError(
        e instanceof Error ? e.message : "Échec de l'envoi de l'e-mail.",
      );
    } finally {
      setBusy(false);
    }
  };

  const ouvrirReponse = (id: number, sujetOriginal: string) => {
    setReplyingTo(id);
    setReplyDraft({ sujet: "Re: " + sujetOriginal, corps: "" });
    setView("repondre");
  };

  const annulerReponse = () => {
    setReplyingTo(null);
    setView("detail");
  };

  const repondre = async () => {
    if (!replyingTo) return;
    setBusy(true);
    setSendError("");
    setSendSuccess("");
    try {
      const r = await adminReplyMail(replyingTo, {
        sujet: replyDraft.sujet || undefined,
        corps_html: replyDraft.corps || undefined,
        corps_texte: replyDraft.corps || undefined,
      });
      setSendSuccess(r.message);
      setView("detail");
      if (detail) ouvrir(detail.id);
      loadEnvoyes();
    } catch (e) {
      setSendError(
        e instanceof Error ? e.message : "Échec de l'envoi de la réponse.",
      );
    } finally {
      setBusy(false);
    }
  };

  // Recherche avec debounce 400 ms.
  useEffect(() => {
    const h = setTimeout(() => {
      setRechercheAppliquee(recherche.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(h);
  }, [recherche]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    adminFetchMails({
      lu: filtre,
      recherche: rechercheAppliquee,
      page,
      par_page: MAILS_PAR_PAGE,
    })
      .then((r) => setResp(r))
      .catch(() => setError(t.loadError))
      .finally(() => setLoading(false));
    adminFetchMailsCount()
      .then(setCount)
      .catch(() => setCount(null));
  }, [filtre, rechercheAppliquee, page, t.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  const ouvrir = (id: number) => {
    setDetailLoading(true);
    setDetail(null);
    adminFetchMail(id)
      .then((d) => {
        setDetail(d);
        setDetailDemo(Boolean((d as { demo?: boolean }).demo));
      })
      .catch(() => setError(t.loadError))
      .finally(() => setDetailLoading(false));
  };

  const fermerDetail = () => {
    setDetail(null);
    setDetailDemo(false);
  };

  // Mise à jour locale optimiste (fonctionne en réel comme en démo).
  const appliquerLuLocal = (id: number) => {
    setResp((r) =>
      r
        ? {
            ...r,
            data: r.data.map((m) =>
              m.id === id ? { ...m, lu: true } : m
            ),
          }
        : r,
    );
    setDetail((d) => (d && d.id === id ? { ...d, lu: true } : d));
    setCount((c) =>
      c ? { ...c, non_lus: Math.max(0, c.non_lus - 1) } : c,
    );
  };

  const marquerLu = (id: number) => {
    setBusy(true);
    setMessage("");
    adminMarquerMailLu(id)
      .then(() => {
        appliquerLuLocal(id);
        setMessage(t.luOk);
      })
      .catch(() => setMessage(t.errorGeneric))
      .finally(() => setBusy(false));
  };

  const marquerToutLu = () => {
    setBusy(true);
    setMessage("");
    adminMarquerToutLu()
      .then(() => {
        setResp((r) =>
          r ? { ...r, data: r.data.map((m) => ({ ...m, lu: true })) } : r,
        );
        setDetail((d) => (d ? { ...d, lu: true } : d));
        setCount((c) => (c ? { ...c, non_lus: 0 } : c));
        setMessage(t.toutLuOk);
      })
      .catch(() => setMessage(t.errorGeneric))
      .finally(() => setBusy(false));
  };

  // Corps HTML assaini mémorisé (DOMParser, client-only).
  const corpsAssaini = useMemo(
    () => (detail ? sanitizeMailHtml(detail.corps_html) : ""),
    [detail],
  );

  return (
    <div className="db-main apub-main amail-main">
      {/* ============== VUE : NOUVEAU MAIL ============== */}
      {view === "nouveau" && (
        <section className="db-section">
          <div className="db-welcome">
            <div>
              <button
                type="button"
                className="btn btn-outline apub-btn-sm"
                onClick={annulerNouveau}
              >
                ← {t.retourListe}
              </button>
              <h1>{t.nouveauTitre}</h1>
              <p>{t.nouveauSubtitle}</p>
            </div>
          </div>
          {sendError && <p className="apub-message" role="alert">{sendError}</p>}
          {sendSuccess && (
            <p className="apub-message" role="status">{sendSuccess}</p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              envoyerMail();
            }}
          >
            <label className="amail-form-label">{t.champDestinataire}</label>
            <input
              type="email"
              className="amail-form-input"
              value={formDest}
              onChange={(e) => setFormDest(e.target.value)}
              placeholder="exemple@domaine.com"
              required
            />
            <label className="amail-form-label">{t.champCopie}</label>
            <input
              type="text"
              className="amail-form-input"
              value={formCopie.join(", ")}
              onChange={(e) =>
                setFormCopie(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder="copie1@domaine.com, copie2@domaine.com"
            />
            <label className="amail-form-label">{t.champSujet}</label>
            <input
              type="text"
              className="amail-form-input"
              value={formSujet}
              onChange={(e) => setFormSujet(e.target.value)}
              required
            />
            <label className="amail-form-label">{t.champCorps}</label>
            <textarea
              className="amail-form-textarea"
              value={formTexte}
              onChange={(e) => setFormTexte(e.target.value)}
              rows={8}
              required
            ></textarea>
            <div className="amail-form-actions">
              <button type="button" className="btn btn-cancel" onClick={annulerNouveau}>
                {t.annuler}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy || !formDest || !formSujet || !formTexte}
              >
                {busy ? t.envoiEnCours : t.envoyer}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ============== VUE : RÉPONDRE ============== */}
      {view === "repondre" && replyingTo !== null && (
        <section className="db-section">
          <div className="db-welcome">
            <div>
              <button
                type="button"
                className="btn btn-outline apub-btn-sm"
                onClick={annulerReponse}
              >
                ← {t.retourListe}
              </button>
              <h1>{t.repondreTitre}</h1>
              <p>{t.repondreSubtitle}</p>
            </div>
          </div>
          {sendError && <p className="apub-message" role="alert">{sendError}</p>}
          {sendSuccess && (
            <p className="apub-message" role="status">{sendSuccess}</p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              repondre();
            }}
          >
            <label className="amail-form-label">{t.champSujet}</label>
            <input
              type="text"
              className="amail-form-input"
              value={replyDraft.sujet}
              onChange={(e) => setReplyDraft({ ...replyDraft, sujet: e.target.value })}
              required
            />
            <label className="amail-form-label">{t.champCorps}</label>
            <textarea
              className="amail-form-textarea"
              value={replyDraft.corps}
              onChange={(e) => setReplyDraft({ ...replyDraft, corps: e.target.value })}
              rows={10}
              required
            ></textarea>
            <div className="amail-form-actions">
              <button type="button" className="btn btn-cancel" onClick={annulerReponse}>
                {t.annuler}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy || !replyDraft.sujet || !replyDraft.corps}
              >
                {busy ? t.envoiEnCours : t.envoyerReponse}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ============== VUE : MAILS ENVOYÉS ============== */}
      {view === "envoyes" && (
        <section className="db-section">
          <div className="db-welcome">
            <div>
              <button
                type="button"
                className="btn btn-outline apub-btn-sm"
                onClick={() => setView("liste")}
              >
                ← {t.retourListe}
              </button>
              <h1>{t.envoyesTitre}</h1>
              <p>{t.envoyesSubtitle}</p>
            </div>
          </div>
          {envoyesLoading && <p>{t.loading}</p>}
          {!envoyesLoading && envoyes && envoyes.data.length === 0 && (
            <p>{t.envoyesEmpty}</p>
          )}
          {!envoyesLoading && envoyes && envoyes.data.length > 0 && (
            <table className="apub-table">
              <thead>
                <tr>
                  <th>{t.colExpediteur}</th>
                  <th>{t.colDestinataire}</th>
                  <th>{t.colSujet}</th>
                  <th>{t.colDate}</th>
                  <th>{t.colEtat}</th>
                </tr>
              </thead>
              <tbody>
                {envoyes.data.map((m) => (
                  <tr key={m.id} className={m.est_echec ? "amail-row-echec" : undefined}>
                    <td>{m.expediteur}</td>
                    <td>{m.destinataire}</td>
                    <td>{m.sujet}</td>
                    <td>{fmtDate(m.envoye_le, locale)}</td>
                    <td>
                      <span
                        className={`badge ${
                          m.est_envoye ? "badge-muted" : m.est_echec ? "badge-warning" : "badge-muted"
                        }`}
                      >
                        {m.est_envoye ? t.etatEnvoye : m.est_echec ? t.etatEchec : t.etatEnAttente}
                      </span>
                      {m.est_echec && m.erreur && (
                        <span className="amail-att-meta"> — {m.erreur}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ============== CONTENU EXISTANT (liste + détail) — affiché seulement en vue liste/détail ============== */}
      {(view === "liste" || view === "detail") && (
        <>
          <div className="db-welcome">
            <div>
              <h1>
                {t.title}{" "}
                {count && count.non_lus > 0 && (
                  <span className="amail-badge" title={t.nonLus}>
                    {count.non_lus} {t.nonLus}
                  </span>
                )}
              </h1>
              <p>{t.subtitle}</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-outline" href={routes.adminDashboard}>
                {t.backDashboard}
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={marquerToutLu}
                disabled={busy || !count || count.non_lus === 0}
              >
                {t.markAllRead}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={ouvrirNouveau}
                disabled={busy}
              >
                {t.nouveauMail}
              </button>
            </div>
          </div>

          {(resp?.demo || detailDemo || count?.demo) && (
            <p className="amail-demo-banner" role="alert">
              {t.demoBanner}
            </p>
          )}

          {message && (
            <p className="apub-message" role="status">{message}</p>
          )}

          {/* ============== DÉTAIL ============== */}
          {detail && (
            <section className="db-section amail-detail">
              <div className="amail-detail-head">
                <button
                  type="button"
                  className="btn btn-outline apub-btn-sm"
                  onClick={fermerDetail}
                >
                  {t.retourListe}
                </button>
                {!detail.lu && (
                  <button
                    type="button"
                    className="btn btn-primary apub-btn-sm"
                    onClick={() => marquerLu(detail.id)}
                    disabled={busy}
                  >
                    {t.marquerLu}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline apub-btn-sm"
                  onClick={() => ouvrirReponse(detail.id, detail.sujet)}
                  disabled={busy || replyingTo !== null}
                >
                  {t.repondre}
                </button>
              </div>
              <h2>{detail.sujet}</h2>
              <dl className="amail-meta">
                <div>
                  <dt>{t.colExpediteur}</dt>
                  <dd>{detail.expediteur}</dd>
                </div>
                <div>
                  <dt>{t.detailDestinataires}</dt>
                  <dd>{(detail.destinataires ?? []).join(", ") || "—"}</dd>
                </div>
                {detail.copie && detail.copie.length > 0 && (
                  <div>
                    <dt>{t.detailCopie}</dt>
                    <dd>{detail.copie.join(", ")}</dd>
                  </div>
                )}
                <div>
                  <dt>{t.detailRecuLe}</dt>
                  <dd>{fmtDate(detail.recu_le, locale)}</dd>
                </div>
                <div>
                  <dt>{t.colEtat}</dt>
                  <dd>
                    <span
                      className={`badge ${detail.lu ? "badge-muted" : "badge-warning"}`}>
                      {detail.lu ? t.etatLu : t.etatNonLu}
                    </span>
                  </dd>
                </div>
              </dl>

              <h3>{t.piecesJointes}</h3>
              {detail.pieces_jointes && detail.pieces_jointes.length > 0 ? (
                <ul className="amail-attachments">
                  {detail.pieces_jointes.map((pj, i) => (
                    <li key={`${pj.nom}-${i}`}>
                      <span className="amail-att-nom">{pj.nom}</span>
                      <span className="amail-att-meta">
                        {pj.type ?? "—"} · {fmtTaille(pj.taille)}
                      </span>
                      {pj.url && (
                        <a
                          className="btn btn-outline apub-btn-sm"
                          href={pj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.telecharger}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t.aucunePieceJointe}</p>
              )}

              <h3>{t.corpsHtml}</h3>
              {corpsAssaini ? (
                <div className="amail-body" dangerouslySetInnerHTML={{ __html: corpsAssaini }} />
              ) : (
                <p>{detail.corps_texte ?? "—"}</p>
              )}
            </section>
          )}

          {/* ============== LISTE ============== */}
          {!detail && (
            <section className="db-section">
              <div className="apub-toolbar amail-toolbar">
                <label>
                  <input
                    type="search"
                    className="amail-search"
                    placeholder={t.searchPlaceholder}
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                  />
                </label>
                <label>
                  <select
                    value={filtre}
                    onChange={(e) => {
                      setFiltre(e.target.value as "" | "non_lus");
                      setPage(1);
                    }}
                  >
                    <option value="">{t.filterAll}</option>
                    <option value="non_lus">{t.filterNonLus}</option>
                  </select>
                </label>
              </div>

              {loading && !resp && <p>{t.loading}</p>}
              {error && <p className="apub-message">{error}</p>}
              {!loading && resp && resp.data.length === 0 && <p>{t.empty}</p>}

              {resp && resp.data.length > 0 && (
                <table className="apub-table">
                  <thead>
                    <tr>
                      <th>{t.colExpediteur}</th>
                      <th>{t.colSujet}</th>
                      <th>{t.colDate}</th>
                      <th>{t.colEtat}</th>
                      <th>{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resp.data.map((m) => (
                      <tr key={m.id} className={m.lu ? undefined : "amail-row-unread"}>
                        <td>{m.expediteur}</td>
                        <td>{m.sujet}</td>
                        <td>{fmtDate(m.recu_le, locale)}</td>
                        <td>
                          <span className={`badge ${m.lu ? "badge-muted" : "badge-warning"}`}>
                            {m.lu ? t.etatLu : t.etatNonLu}
                          </span>
                        </td>
                        <td className="apub-row-actions">
                          <button
                            type="button"
                            className="btn btn-outline apub-btn-sm"
                            onClick={() => ouvrir(m.id)}
                          >
                            {t.ouvrir}
                          </button>
                          {!m.lu && (
                            <button
                              type="button"
                              className="btn btn-primary apub-btn-sm"
                              onClick={() => marquerLu(m.id)}
                              disabled={busy}
                            >
                              {t.marquerLu}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {resp && resp.meta.derniere_page > 1 && (
                <div className="apub-pagination">
                  <button
                    type="button"
                    className="btn btn-outline apub-btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ←
                  </button>
                  <span>
                    {t.pageSur} {page} {t.sur} {resp.meta.derniere_page}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline apub-btn-sm"
                    disabled={page >= resp.meta.derniere_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </section>
          )}

          {detailLoading && <p>{t.loading}</p>}
        </>
      )}
    </div>
  );
}

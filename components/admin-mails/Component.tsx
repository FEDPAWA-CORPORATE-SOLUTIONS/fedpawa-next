"use client";

// ==========================================================
// FEDPAWA — Boîte de réception admin (look Gmail)
// Barre latérale, recherche centrale, onglets catégories,
// liste de mails en 2 lignes, vue détail style Gmail,
// envoi / réponse / suppression / favori.
// Données : repli sur DEMO_MAILS si l'API répond 404.
// ==========================================================

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import { sanitizeMailHtml } from "@/lib/sanitize-mail-html";
import { apiAuthGetBlob, getToken } from "@/lib/auth";
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
  DEMO_MAILS,
} from "@/lib/mails";

export interface AdminMailsProps {
  locale?: Locale;
}

type Folder = "inbox" | "favoris" | "envoyes" | "brouillons" | "corbeille";

type Tab = "inscrits" | "actifs" | "favoris" | "nouvelle-categorie";

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

  // ---------- États de navigation ----------
  const [view, setView] = useState<"liste" | "detail" | "nouveau" | "repondre">("liste");
  const [folder, setFolder] = useState<Folder>("inbox");
  const [tab, setTab] = useState<Tab>("inscrits");
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MailDetail | null>(null);
  const [detailDemo, setDetailDemo] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ---------- États de liste ----------
  const [filtre, setFiltre] = useState<"" | "non_lus">("");
  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- États d'envoi / réponse ----------
  const [envoyes, setEnvoyes] = useState<MailsEnvoyesPage | null>(null);
  const [envoyesLoading, setEnvoyesLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState<{ sujet: string; corps: string }>({ sujet: "", corps: "" });

  // Formulaire nouveau mail
  const [formDest, setFormDest] = useState("");
  const [formCopie, setFormCopie] = useState<string[]>([]);
  const [formSujet, setFormSujet] = useState("");
  const [formTexte, setFormTexte] = useState("");
  const [formPiecesJointes, setFormPiecesJointes] = useState<File[]>([]);

  // ---------- Chargement des mails ----------
  const [resp, setResp] = useState<MailsPage<MailSummary> | null>(null);
  const [count, setCount] = useState<MailsCount | null>(null);

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

  // ---------- Données affichées (démo ou API) ----------
  const mailsDisplay = useMemo(() => {
    // Si on a de vraies données de l'API, on les utilise.
    // Sinon, repli sur DEMO_MAILS filtrés par dossier.
    const apiMails = resp?.data ?? [];
    if (apiMails.length > 0 && !(resp?.demo)) {
      return apiMails;
    }
    // Repli démo : filtrer selon le dossier sélectionné
    let list = [...DEMO_MAILS];
    switch (folder) {
      case "inbox":
        // Tous les mails reçus (ce sont tous des mails reçus dans la démo)
        break;
      case "favoris":
        list = list.filter((m) => !m.lu); // approximation : non lus = favoris
        break;
      case "envoyes":
        list = []; // pas de mails envoyés dans la démo reçus
        break;
      case "brouillons":
        list = [];
        break;
      case "corbeille":
        list = [];
        break;
    }
    if (filtre === "non_lus") list = list.filter((m) => !m.lu);
    const r = (rechercheAppliquee ?? "").trim().toLowerCase();
    if (r) {
      list = list.filter((m) => m.expediteur.toLowerCase().includes(r) || m.sujet.toLowerCase().includes(r));
    }
    return list.map((m) => ({ ...m, id: m.id, expediteur: m.expediteur, sujet: m.sujet, recu_le: m.recu_le, lu: m.lu }));
  }, [resp, folder, filtre, rechercheAppliquee]);

  // ---------- Actions ----------
  const ouvrirNouveau = () => {
    setView("nouveau");
    setSendError("");
    setSendSuccess("");
    setFormDest("");
    setFormCopie([]);
    setFormSujet("");
    setFormTexte("");
    setFormPiecesJointes([]);
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
      setView("liste");
      loadEnvoyes();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Échec de l'envoi de l'e-mail.");
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
      setSendError(e instanceof Error ? e.message : "Échec de l'envoi de la réponse.");
    } finally {
      setBusy(false);
    }
  };

  const ouvrir = (id: number) => {
    setSelectedMailId(id);
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
    setSelectedMailId(null);
  };

  const appliquerLuLocal = (id: number) => {
    setResp((r) =>
      r
        ? {
            ...r,
            data: r.data.map((m) => (m.id === id ? { ...m, lu: true } : m)),
          }
        : r,
    );
    setDetail((d) => (d && d.id === id ? { ...d, lu: true } : d));
    setCount((c) => (c ? { ...c, non_lus: Math.max(0, c.non_lus - 1) } : c));
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
        setResp((r) => (r ? { ...r, data: r.data.map((m) => ({ ...m, lu: true })) } : r));
        setDetail((d) => (d ? { ...d, lu: true } : d));
        setCount((c) => (c ? { ...c, non_lus: 0 } : c));
        setMessage(t.toutLuOk);
      })
      .catch(() => setMessage(t.errorGeneric))
      .finally(() => setBusy(false));
  };

  const supprimerMail = (id: number) => {
    // Simulation : on retire de la liste affichée
    setResp((r) =>
      r ? { ...r, data: r.data.filter((m) => m.id !== id) } : r,
    );
    if (selectedMailId === id) {
      fermerDetail();
    }
  };

  const basculerFavori = (id: number) => {
    // Simulation : marque comme lu/non lu pour l'exemple
    appliquerLuLocal(id);
  };

  // ---------- Corps HTML assaini ----------
  const corpsAssaini = useMemo(
    () => (detail ? sanitizeMailHtml(detail.corps_html) : ""),
    [detail],
  );

  const downloadMailAttachment = async (url: string, filename: string) => {
    try {
      const blob = await apiAuthGetBlob(url);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Téléchargement impossible.", "error");
    }
  };

  // ---------- Rendu ----------
  return (
    <div className="gmail-container">
      {/* ============== BARRE LATÉRALE GAUCHE ============== */}
      <aside className="gmail-sidebar">
        <div className="gmail-sidebar-top">
          <button
            type="button"
            className="gmail-compose-btn"
            onClick={ouvrirNouveau}
            disabled={busy}
          >
            Compose +{" "}
          </button>
        </div>
        <nav className="gmail-nav">
          <div
            className={`gmail-nav-item ${folder === "inbox" ? "active" : ""}`}
            onClick={() => setFolder("inbox")}
          >
            📥 Inbox
            {count && count.non_lus > 0 && folder === "inbox" && (
              <span className="gmail-badge">{count.non_lus}</span>
            )}
          </div>
          <div
            className={`gmail-nav-item ${folder === "favoris" ? "active" : ""}`}
            onClick={() => setFolder("favoris")}
          >
            ⭐ Favoris
          </div>
          <div
            className={`gmail-nav-item ${folder === "envoyes" ? "active" : ""}`}
            onClick={() => setFolder("envoyes")}
          >
            📤 Envoyés
          </div>
          <div
            className={`gmail-nav-item ${folder === "brouillons" ? "active" : ""}`}
            onClick={() => setFolder("brouillons")}
          >
            📝 Brouillons
          </div>
          <div
            className={`gmail-nav-item ${folder === "corbeille" ? "active" : ""}`}
            onClick={() => setFolder("corbeille")}
          >
            🗑️ Corbeille
          </div>
        </nav>
        <div className="gmail-sidebar-bottom">
          <Link className="gmail-back-link" href={routes.adminDashboard}>
            ← {t.backDashboard || "Retour dashboard"}
          </Link>
        </div>
      </aside>

      {/* ============== CONTENU PRINCIPAL ============== */}
      <main className="gmail-main">
        {/* Barre de recherche centrale */}
        <div className="gmail-search-bar">
          <div className="gmail-search-logo">FEDPAWA</div>
          <input
            type="search"
            className="gmail-search-input"
            placeholder="Search in mail"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <button className="gmail-search-filters" title="Filtres">
            ⋮
          </button>
        </div>

        {/* Onglets catégories */}
        <div className="gmail-tabs">
          <button
            className={`gmail-tab ${tab === "inscrits" ? "active" : ""}`}
            onClick={() => setTab("inscrits")}
          >
            Utilisateurs inscrits
          </button>
          <button
            className={`gmail-tab ${tab === "actifs" ? "active" : ""}`}
            onClick={() => setTab("actifs")}
          >
            Utilisateurs actifs
          </button>
          <button
            className={`gmail-tab ${tab === "favoris" ? "active" : ""}`}
            onClick={() => setTab("favoris")}
          >
            Utilisateurs favoris
          </button>
          <button
            className="gmail-tab gmail-tab-add"
            onClick={() => setTab("nouvelle-categorie")}
          >
            + Créer une catégorie
          </button>
        </div>

        {/* Filtres rapides */}
        {view === "liste" && (
          <div className="gmail-filters">
            <label>
              <input
                type="checkbox"
                checked={filtre === "non_lus"}
                onChange={(e) => setFiltre(e.target.checked ? "non_lus" : "")}
              />
              Non lus uniquement
            </label>
            <select
              className="gmail-filter-select"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  Page {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ============== VUE : LISTE DE MAILS ============== */}
        {view === "liste" && !detail && (
          <section className="gmail-list-section">
            <div className="gmail-toolbar">
              <input type="checkbox" className="gmail-select-all" />
              <span className="gmail-count">
                {mailsDisplay.length} mail{mailsDisplay.length > 1 ? "s" : ""}
              </span>
              {sendSuccess && <span className="gmail-success">{sendSuccess}</span>}
              {sendError && <span className="gmail-error">{sendError}</span>}
            </div>

            {(loading && !resp) || (error && <p className="gmail-error">{error}</p>)}

            {!loading && resp && mailsDisplay.length === 0 && (
              <p className="gmail-empty">Aucun mail dans ce dossier.</p>
            )}

            {!loading && mailsDisplay.length > 0 && (
              <table className="gmail-mail-table">
                <thead>
                  <tr>
                    <th className="gmail-th-checkbox"><input type="checkbox" /></th>
                    <th className="gmail-th-star">★</th>
                    <th className="gmail-th-from">De</th>
                    <th className="gmail-th-subject">Sujet</th>
                    <th className="gmail-th-preview">Contenu</th>
                    <th className="gmail-th-date">Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {mailsDisplay.map((m) => (
                    <tr
                      key={m.id}
                      className={`gmail-mail-row ${!m.lu ? "gmail-unread" : ""} ${selectedMailId === m.id ? "gmail-selected" : ""}`}
                      onClick={() => ouvrir(m.id)}
                    >
                      <td className="gmail-td-checkbox">
                        <input type="checkbox" />
                      </td>
                      <td className="gmail-td-star">☆</td>
                      <td className="gmail-td-from">{m.expediteur}</td>
                      <td className="gmail-td-subject">{m.sujet}</td>
                      <td className="gmail-td-preview">
                        {m.corps_texte ? m.corps_texte.slice(0, 60) : "—"}
                      </td>
                      <td className="gmail-td-date">{fmtDate(m.recu_le, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {resp && resp.meta && resp.meta.derniere_page > 1 && (
              <div className="gmail-pagination">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ←
                </button>
                <span>{page} / {resp.meta.derniere_page}</span>
                <button
                  disabled={page >= resp.meta.derniere_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  →
                </button>
              </div>
            )}
          </section>
        )}

        {/* ============== VUE : DÉTAIL D'UN MAIL ============== */}
        {view === "detail" && detail && (
          <section className="gmail-detail-section">
            <div className="gmail-detail-header">
              <button
                type="button"
                className="gmail-btn gmail-btn-outline"
                onClick={fermerDetail}
              >
                ← Retour
              </button>
              {!detail.lu && (
                <button
                  type="button"
                  className="gmail-btn gmail-btn-outline"
                  onClick={() => marquerLu(detail.id)}
                >
                  Marquer comme lu
                </button>
              )}
              <button
                type="button"
                className="gmail-btn gmail-btn-outline"
                onClick={() => basculerFavori(detail.id)}
              >
                {detail.lu ? "⭐" : "☆"} Favori
              </button>
              <button
                type="button"
                className="gmail-btn gmail-btn-outline"
                onClick={() => ouvrirReponse(detail.id, detail.sujet)}
                disabled={busy || replyingTo !== null}
              >
                ↩ Répondre
              </button>
              <button
                type="button"
                className="gmail-btn gmail-btn-outline gmail-btn-delete"
                onClick={() => supprimerMail(detail.id)}
              >
                🗑️ Supprimer
              </button>
            </div>

            <h1 className="gmail-detail-title">{detail.sujet}</h1>

            <div className="gmail-detail-meta">
              <span className="gmail-meta-item">
                <strong>De:</strong> {detail.expediteur}
              </span>
              <span className="gmail-meta-item">
                <strong>À:</strong>
                {(detail.destinataires ?? []).join(", ") || "—"}
              </span>
              {detail.copie && detail.copie.length > 0 && (
                <span className="gmail-meta-item">
                  <strong>CC:</strong> {detail.copie.join(", ")}
                </span>
              )}
              <span className="gmail-meta-item">
                <strong>Reçu le:</strong> {fmtDate(detail.recu_le, locale)}
              </span>
            </div>

            <div className="gmail-detail-body">
              {detail.pieces_jointes && detail.pieces_jointes.length > 0 && (
                <div className="gmail-attachments">
                  <strong>Pièces jointes:</strong>
                  <ul>
                    {detail.pieces_jointes.map((pj, i) => (
                      <li key={`${pj.nom}-${i}`}>
                        {pj.nom} ({pj.type || "—"}, {fmtTaille(pj.taille)})
                        {pj.url && (
                          <button
                            type="button"
                            className="gmail-btn gmail-btn-outline gmail-btn-sm"
                            onClick={() => downloadMailAttachment(pj.url, pj.nom)}
                          >
                            Télécharger
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {corpsAssaini ? (
                <div className="gmail-detail-content" dangerouslySetInnerHTML={{ __html: corpsAssaini }} />
              ) : (
                <p>{detail.corps_texte || "—"}</p>
              )}
            </div>
          </section>
        )}

        {/* ============== VUE : RÉPONDRE ============== */}
        {view === "repondre" && replyingTo !== null && (
          <section className="gmail-compose-section">
            <div className="gmail-compose-header">
              <button type="button" className="gmail-btn gmail-btn-outline" onClick={annulerReponse}>
                ← Retour
              </button>
              <h1 className="gmail-compose-title">Répondre</h1>
            </div>
            {sendError && <p className="gmail-error">{sendError}</p>}
            {sendSuccess && <p className="gmail-success">{sendSuccess}</p>}
            <form onSubmit={(e) => { e.preventDefault(); repondre(); }}>
              <div className="gmail-compose-field">
                <label>Sujet</label>
                <input
                  type="text"
                  className="gmail-compose-input"
                  value={replyDraft.sujet}
                  onChange={(e) => setReplyDraft({ ...replyDraft, sujet: e.target.value })}
                  required
                />
              </div>
              <div className="gmail-compose-field">
                <label>Corps</label>
                <textarea
                  className="gmail-compose-textarea"
                  value={replyDraft.corps}
                  onChange={(e) => setReplyDraft({ ...replyDraft, corps: e.target.value })}
                  rows={10}
                  required
                ></textarea>
              </div>
              <div className="gmail-compose-actions">
                <button type="button" className="gmail-btn gmail-btn-outline" onClick={annulerReponse}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className="gmail-btn gmail-btn-primary"
                  disabled={busy || !replyDraft.sujet || !replyDraft.corps}
                >
                  {busy ? "Envoi en cours..." : "Envoyer la réponse"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ============== VUE : NOUVEAU MAIL ============== */}
        {view === "nouveau" && (
          <section className="gmail-compose-section">
            <div className="gmail-compose-header">
              <button type="button" className="gmail-btn gmail-btn-outline" onClick={annulerNouveau}>
                ← Retour
              </button>
              <h1 className="gmail-compose-title">Nouveau Message</h1>
            </div>
            {sendError && <p className="gmail-error">{sendError}</p>}
            {sendSuccess && <p className="gmail-success">{sendSuccess}</p>}
            <form onSubmit={(e) => { e.preventDefault(); envoyerMail(); }}>
              <div className="gmail-compose-field">
                <label>Recipients</label>
                <input
                  type="email"
                  className="gmail-compose-input"
                  value={formDest}
                  onChange={(e) => setFormDest(e.target.value)}
                  placeholder="exemple@domaine.com"
                  required
                />
              </div>
              <div className="gmail-compose-field">
                <label>Copie (CC)</label>
                <input
                  type="text"
                  className="gmail-compose-input"
                  value={formCopie.join(", ")}
                  onChange={(e) => {
                    const emails = e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    setFormCopie(emails.filter((email) => emailRegex.test(email) || email === ""));
                  }}
                  placeholder="copie1@domaine.com, copie2@domaine.com"
                />
              </div>
              <div className="gmail-compose-field">
                <label>Subject</label>
                <input
                  type="text"
                  className="gmail-compose-input"
                  value={formSujet}
                  onChange={(e) => setFormSujet(e.target.value)}
                  required
                />
              </div>
              <div className="gmail-compose-field gmail-compose-body-field">
                <label>Body</label>
                <textarea
                  className="gmail-compose-textarea"
                  value={formTexte}
                  onChange={(e) => setFormTexte(e.target.value)}
                  rows={10}
                  required
                ></textarea>
                <div className="gmail-attach-area">
                  <button
                    type="button"
                    className="gmail-btn gmail-btn-outline gmail-btn-sm"
                    onClick={() => document.getElementById("attach-files")?.click()}
                  >
                    📎 Joindre des fichiers
                  </button>
                  <input
                    id="attach-files"
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormPiecesJointes(Array.from(e.target.files));
                      }
                    }}
                  />
                  {formPiecesJointes.length > 0 && (
                    <div className="gmail-attached-list">
                      {formPiecesJointes.map((f, i) => (
                        <div key={i} className="gmail-attached-item">
                          {f.name} ({fmtTaille(f.size)})
                          <button
                            type="button"
                            className="gmail-btn gmail-btn-outline gmail-btn-sm"
                            onClick={() =>
                              setFormPiecesJointes(formPiecesJointes.filter((_, j) => j !== i))
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="gmail-compose-actions">
                <button type="button" className="gmail-btn gmail-btn-outline" onClick={annulerNouveau}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className="gmail-btn gmail-btn-primary"
                  disabled={busy || !formDest || !formSujet || !formTexte}
                >
                  {busy ? "Envoi en cours..." : "Envoyer"}
                </button>
              </div>
            </form>
          </section>
        )}

        {detailLoading && <p className="gmail-loading">Chargement…</p>}
      </main>
    </div>
  );
}

// Helper toast minimal (à remplacer par votre système de toast si existant)
function toast(message: string, type: "error" | "success" = "error") {
  // eslint-disable-next-line no-console
  console.log(`[${type}] ${message}`);
}

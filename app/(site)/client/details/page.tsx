"use client";

// ============================================================
// FEDPAWA — Page de détails complets d'un client (admin uniquement)
// Affiche ABSOLUMENT TOUT ce qui concerne un client : identité,
// abonnements, paiements, factures, contrats, courriers, KYC,
// tickets, messages internes, publications lues, souscriptions
// push, notifications, appareils de connexion, réinitialisations
// de mot de passe, mails reçus, demandes de signature et statut
// de verrou (throttle).
// Utilise ?id= pour identifier le client.
// ============================================================

import { useEffect, useState } from "react";
import { apiAuthGet } from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { fmtDate, fmtFCFA } from "@/lib/dashboard-format";
import { useAuthGuard } from "@/components/dashboard/useAuthGuard";
import type { Locale } from "@/lib/i18n";
import { getPageDictionary } from "@/lib/i18n";

interface ClientDetailsProps {
  searchParams: { id?: string };
  locale: Locale;
}

export default function ClientDetails({ searchParams, locale }: ClientDetailsProps) {
  const guard = useAuthGuard("admin", locale);
  const clientId = searchParams.id ? parseInt(searchParams.id, 10) : NaN;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guard.status === "denied") return;
    if (isNaN(clientId)) {
      setError("ID client invalide.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await apiAuthGet<any>(`/api/v1/admin/clients/${clientId}/details`);
        if (!cancelled) setData(res);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Impossible de charger les détails du client.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guard.status, clientId, locale]);

  if (guard.status === "checking") {
    return <div className="db-section" style={{ textAlign: "center", padding: 40 }}>Chargement…</div>;
  }
  if (guard.status === "denied") {
    return <div className="db-section" style={{ textAlign: "center", padding: 40 }}>Accès administrateur requis.</div>;
  }
  if (error) {
    return <div className="db-section" style={{ textAlign: "center", padding: 40, color: "var(--color-danger)" }}>{error}</div>;
  }
  if (loading || !data) {
    return <div className="db-section" style={{ textAlign: "center", padding: 40 }}>Chargement des détails…</div>;
  }

  const c = data.client || {};
  const formatMoney = (v: any) => (v != null ? fmtFCFA(v) : "—");
  const badge = (statut: string | null | undefined, actif: string, inactif: string = "muted") => {
    const s = (statut || "").toLowerCase();
    return s === actif ? "success" : s === "rejeté" || s === "rejected" ? "danger" : s === "non_lu" || s === "open" || s === "en_cours" ? "warning" : inactif;
  };

  const renderTable = (
    title: string,
    columns: { key: string; label: string; render?: (v: any) => React.ReactNode }[],
    rows: any[],
    emptyMsg = "Aucune donnée"
  ) => {
    if (!rows || rows.length === 0) {
      return (
        <div className="db-section">
          <div className="db-section-header"><h2>{title}</h2></div>
          <p className="db-hint">{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="db-section">
        <div className="db-section-header"><h2>{title}</h2></div>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ maxWidth: 300 }}>
                      {col.render ? col.render(row[col.key]) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="db-tab-content active" id="tab-client-details">
      <div className="db-welcome">
        <div>
          <h1>Détails du client</h1>
          <p>Vue complète de l'activité de {c.nom ?? "ce client"} sur la plateforme FEDPAWA.</p>
        </div>
      </div>

      {/* ============ 1. IDENTITÉ ============ */}
      <div className="db-section">
        <div className="db-section-header"><h2>Identité du client</h2></div>
        <div className="db-grid db-grid-2">
          <div className="db-card">
            <p className="db-label">ID interne</p>
            <p className="db-value">CL-{String(c.id ?? "").padStart(3, "0")}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Civilité</p>
            <p className="db-value">{c.civilité ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Nom / Représentant</p>
            <p className="db-value">{c.nom ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Raison sociale</p>
            <p className="db-value">{c.entreprise ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Forme juridique</p>
            <p className="db-value">{c.forme_juridique ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">RC</p>
            <p className="db-value">{c.rc ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">IFU</p>
            <p className="db-value">{c.ifu ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">E-mail</p>
            <p className="db-value">{c.email ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Téléphone</p>
            <p className="db-value">{c.telephone ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Adresse</p>
            <p className="db-value">{c.adresse ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Pays</p>
            <p className="db-value">{c.pays ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Activité</p>
            <p className="db-value">{c.activite ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Statut</p>
            <p className="db-value">{c.statut ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Rôle</p>
            <p className="db-value">{c.role ?? "—"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Date d'inscription</p>
            <p className="db-value">{fmtDate(c.date_inscription)}</p>
          </div>
          <div className="db-card">
            <p className="db-label">E-mail vérifié</p>
            <p className="db-value">{c.email_verified_at ? "Oui" : "Non"}</p>
          </div>
          <div className="db-card">
            <p className="db-label">Vérification envoyée le</p>
            <p className="db-value">{fmtDate(c.email_verification_sent_at)}</p>
          </div>
        </div>
      </div>

      {/* ============ 2. ABONNEMENTS ============ */}
      {renderTable(
        "Abonnements",
        [
          { key: "pack", label: "Pack" },
          { key: "prix", label: "Prix", render: formatMoney },
          { key: "date_debut", label: "Début", render: fmtDate },
          { key: "date_fin", label: "Fin", render: fmtDate },
          { key: "statut", label: "Statut", render: (v) => <span className={`badge badge-${badge(v, "actif")}`}>{v ?? "—"}</span> },
        ],
        data.abonnements ?? []
      )}

      {/* ============ 3. PAIEMENTS ============ */}
      {renderTable(
        "Paiements & transactions",
        [
          { key: "transaction_id", label: "Référence", render: (v) => v ?? `PAY-${"id" in (v as any) ? v : ""}` },
          { key: "montant", label: "Montant", render: formatMoney },
          { key: "mode_paiement", label: "Mode" },
          { key: "date", label: "Date", render: fmtDate },
          { key: "statut", label: "Statut", render: (v) => <span className={`badge badge-${badge(v, "recu")}`}>{v ?? "—"}</span> },
        ],
        data.paiements ?? []
      )}

      {/* ============ 4. FACTURES ============ */}
      {renderTable(
        "Factures",
        [
          { key: "numero", label: "Numéro" },
          { key: "montant", label: "Montant", render: formatMoney },
          { key: "date", label: "Date", render: fmtDate },
          { key: "lien_pdf", label: "PDF", render: (v) => (v ? (<a href={v} target="_blank" rel="noopener">Voir PDF</a>) : "—") },
        ],
        data.factures ?? []
      )}

      {/* ============ 5. CONTRATS ============ */}
      {renderTable(
        "Contrats",
        [
          { key: "type", label: "Type" },
          { key: "date_signature", label: "Date signature", render: fmtDate },
          { key: "fichier", label: "Fichier" },
        ],
        data.contrats ?? []
      )}

      {/* ============ 6. COURRIERS ============ */}
      {renderTable(
        "Courriers",
        [
          { key: "date_reception", label: "Date réception", render: fmtDate },
          { key: "statut", label: "Statut", render: (v) => <span className={`badge badge-${badge(v, "actif", "warning")}`}>{v ?? "—"}</span> },
          { key: "scan", label: "Scan" },
        ],
        data.courriers ?? []
      )}

      {/* ============ 7. DOSSIERS KYC ============ */}
      {renderTable(
        "Dossiers KYC",
        [
          { key: "statuts", label: "Statut", render: (v) => <span className={`badge badge-${badge(v, "approuvé")}`}>{v ?? "—"}</span> },
          { key: "date_soumission", label: "Date dépôt", render: fmtDate },
          { key: "piece_identite", label: "Pièce identité" },
          { key: "justificatif_domicile", label: "Justificatif domicile" },
          { key: "description_activite", label: "Description activité" },
          { key: "motif_rejet", label: "Motif rejet" },
          { key: "date_decision", label: "Décision le", render: fmtDate },
        ],
        data.kyc ?? []
      )}

      {/* ============ 8. TICKETS SUPPORT ============ */}
      {renderTable(
        "Tickets support",
        [
          { key: "sujet", label: "Sujet" },
          { key: "message", label: "Message", render: (v) => (v ?? "").slice(0, 120) + ((v ?? "").length > 120 ? "…" : "") },
          { key: "created_at", label: "Date", render: fmtDate },
          { key: "statut", label: "Statut", render: (v) => <span className={`badge badge-${badge(v, "open")}`}>{v ?? "—"}</span> },
          { key: "reponse", label: "Réponse", render: (v) => (v ?? "—") },
        ],
        data.tickets ?? []
      )}

      {/* ============ 9. MESSAGES INTERNES ============ */}
      {renderTable(
        "Messages internes",
        [
          { key: "content", label: "Contenu", render: (v) => (v ?? "").slice(0, 150) + ((v ?? "").length > 150 ? "…" : "") },
          { key: "created_at", label: "Date", render: fmtDate },
          { key: "is_read", label: "Lu", render: (v) => v ? "Oui" : "Non" },
        ],
        data.messages ?? []
      )}

      {/* ============ 10. PUBLICATIONS LUES ============ */}
      {renderTable(
        "Publications lues",
        [
          { key: "publication_id", label: "ID publication" },
          { key: "client_id", label: "Client" },
          { key: "lu_le", label: "Lu le", render: fmtDate },
        ],
        data.publication_lectures ?? []
      )}

      {/* ============ 11. SOUSCRIPTIONS PUSH ============ */}
      {renderTable(
        "Souscriptions push (notifications)",
        [
          { key: "endpoint", label: "Endpoint", render: (v) => (v ?? "").slice(0, 80) + "…" },
          { key: "created_at", label: "Créée le", render: fmtDate },
          { key: "updated_at", label: "Maj le", render: fmtDate },
        ],
        data.push_subscriptions ?? []
      )}

      {/* ============ 12. NOTIFICATIONS ============ */}
      {renderTable(
        "Notifications reçues",
        [
          { key: "type", label: "Type" },
          { key: "title", label: "Titre" },
          { key: "body", label: "Message", render: (v) => (v ?? "").slice(0, 150) + ((v ?? "").length > 150 ? "…" : "") },
          { key: "read_at", label: "Lue le", render: (v) => v ? fmtDate(v) : "Non lue" },
          { key: "created_at", label: "Reçue le", render: fmtDate },
        ],
        data.notification_events ?? []
      )}

      {/* ============ 13. APPAREILS DE CONNEXION ============ */}
      {renderTable(
        "Appareils de connexion",
        [
          { key: "ua_hash", label: "Empreinte appareil" },
          { key: "ip", label: "IP" },
          { key: "first_seen_at", label: "Première connexion", render: fmtDate },
          { key: "last_seen_at", label: "Dernière connexion", render: fmtDate },
        ],
        data.login_devices ?? []
      )}

      {/* ============ 14. RÉINITIALISATIONS MOT DE PASSE ============ */}
      {renderTable(
        "Réinitialisations de mot de passe",
        [
          { key: "expires_at", label: "Expire le", render: fmtDate },
          { key: "used", label: "Utilisé", render: (v) => v ? "Oui" : "Non" },
          { key: "created_at", label: "Créée le", render: fmtDate },
        ],
        data.password_resets ?? []
      )}

      {/* ============ 15. MAILS REÇUS ============ */}
      {renderTable(
        "Mails reçus",
        [
          { key: "sujet", label: "Sujet" },
          { key: "contenu", label: "Contenu", render: (v) => (v ?? "").slice(0, 150) + ((v ?? "").length > 150 ? "…" : "") },
          { key: "date_reception", label: "Date réception", render: fmtDate },
        ],
        data.mails_recus ?? []
      )}

      {/* ============ 16. DEMANDES DE SIGNATURE ============ */}
      {renderTable(
        "Demandes de signature électronique",
        [
          { key: "id", label: "ID" },
          { key: "status", label: "Statut" },
          { key: "created_at", label: "Demandé le", render: fmtDate },
        ],
        data.contract_signing_requests ?? []
      )}

      {/* ============ 17. SÉCURITÉ / THROTTLE ============ */}
      <div className="db-section">
        <div className="db-section-header"><h2>Sécurité du compte (tentatives de connexion)</h2></div>
        {data.throttle ? (
          <div className="db-grid db-grid-2">
            <div className="db-card">
              <p className="db-label">Identifiant</p>
              <p className="db-value">{data.throttle.identifier ?? "—"}</p>
            </div>
            <div className="db-card">
              <p className="db-label">Type</p>
              <p className="db-value">{data.throttle.user_type ?? "—"}</p>
            </div>
            <div className="db-card">
              <p className="db-label">Tentatives</p>
              <p className="db-value">{data.throttle.attempts ?? 0}</p>
            </div>
            <div className="db-card">
              <p className="db-label">Verrouillé jusqu'à</p>
              <p className="db-value">{data.throttle.locked_until ?? "—"}</p>
            </div>
            <div className="db-card">
              <p className="db-label">Dernière tentative</p>
              <p className="db-value">{fmtDate(data.throttle.last_attempt_at)}</p>
            </div>
            <div className="db-card">
              <p className="db-label">IP</p>
              <p className="db-value">{data.throttle.ip ?? "—"}</p>
            </div>
          </div>
        ) : (
          <p className="db-hint">Aucun verrou de connexion actif pour ce compte.</p>
        )}
      </div>
    </div>
  );
}

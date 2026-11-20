"use client";

// ============================================================
// FEDPAWA — Onglet KYC (nouveau flux : par document)
// 1. Liste des clients ayant soumis des documents KYC
// 2. Détail par client : 2 documents avec icônes télécharger/ouvrir +
//    3 boutons côte à côte (Valider / Rejeter) par document
// 3. Bouton "À compléter" avec dropdown (document manquant + motif)
//    et bouton Enregistrer pour email groupé
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  apiAuthGet,
  apiAuthPost,
} from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { fmtDate } from "@/lib/dashboard-format";
import { useToast } from "@/components/dashboard/UI";
import ButtonLoader from "@/components/ui/ButtonLoader";
import type {
  ApiKycClient,
  ApiKycDocument,
  ApiKycClientDetails,
} from "@/lib/dashboard-types";
import {
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  ChevronDown,
} from "lucide-react";

const DOC_TYPES: { value: 'piece_identite' | 'justificatif_domicile'; label: string }[] = [
  { value: 'piece_identite', label: 'Pièce d\'identité' },
  { value: 'justificatif_domicile', label: 'Justificatif de domicile' },
];


const ICON = (name: string) => {
  const icons: Record<string, string> = {
    download: '<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>',
    external: '<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6m4 4h4m-4 4v1m-4-4a4 4 0 10-8 0 4 4 0 008 0Zm0 0l12-12m0 0l-12 12"/></svg>',
    check: '<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>',
    x: '<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>',
    alert: '<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.332-2.694-1.332-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3Z"/></svg>',
  };
  return <span dangerouslySetInnerHTML={{ __html: icons[name] || '' }} style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: 'middle' }} />;
};

interface TabKycProps {
  documentViewerPath?: string;
}

export default function TabKyc({
  documentViewerPath = "/admin-document",
}: TabKycProps) {
  const { lists, loading, error, reload } = useAdminData();
  const { toast } = useToast();

  const [view, setView] = useState<'list' | 'detail'>('list');
  const [clients, setClients] = useState<ApiKycClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<ApiKycClient | null>(null);
  const [details, setDetails] = useState<ApiKycClientDetails | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [deciding, setDeciding] = useState<Record<string, boolean>>({});
  const [rejectOpen, setRejectOpen] = useState<{ clientId: number; docType: string } | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeDocType, setCompleteDocType] = useState<'piece_identite' | 'justificatif_domicile' | null>(null);
  const [completeMotif, setCompleteMotif] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      const res = await apiAuthGet<{ clients: ApiKycClient[] }>("/api/v1/admin/kyc/clients");
      setClients(res.clients ?? []);
    } catch {
      setClients([]);
    }
  }, [reload]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openClientDetail = async (client: ApiKycClient) => {
    setSelectedClient(client);
    setView("detail");
    setDocLoading(true);
    setDetails(null);
    try {
      const res = await apiAuthGet<ApiKycClientDetails>(
        `/api/v1/admin/kyc/client/${client.client_id}/documents`
      );
      setDetails(res);
    } catch (err: any) {
      toast(err?.message || getFriendlyErrorMessage(err, "kyc") || "Impossible de charger les documents.", "error");
    } finally {
      setDocLoading(false);
    }
  };

  const goBack = () => {
    setView("list");
    setSelectedClient(null);
    setDetails(null);
    setCompleteOpen(false);
    setCompleteDocType(null);
    setCompleteMotif("");
    setRejectOpen(null);
    setRejectMotif("");
  };

  const decideDocument = async (documentType: 'piece_identite' | 'justificatif_domicile', decision: 'approuvé' | 'rejeté', motif: string) => {
    if (!selectedClient) return;
    const key = `${selectedClient.client_id}-${documentType}`;
    setDeciding({ ...deciding, [key]: true });
    try {
      await apiAuthPost("/api/v1/admin/kyc/document/decision", {
        client_id: selectedClient.client_id,
        document_type: documentType,
        decision,
        motif,
      });
      toast("Décision enregistrée.", "success");
      setRejectOpen(null);
      setRejectMotif("");
      await fetchClientDetails();
    } catch (err: any) {
      toast(err?.message || "Erreur lors de la décision.", "error");
    } finally {
      setDeciding({ ...deciding, [key]: false });
    }
  };

  const fetchClientDetails = async () => {
    if (!selectedClient) return;
    setDocLoading(true);
    try {
      const res = await apiAuthGet<ApiKycClientDetails>(
        `/api/v1/admin/kyc/client/${selectedClient.client_id}/documents`
      );
      setDetails(res);
    } catch {
      // ignore, les données sont déjà rafraîchies côté decideDocument
    } finally {
      setDocLoading(false);
    }
  };

  const confirmCompleteBatch = async () => {
    if (!selectedClient) return;
    if (!completeDocType || !completeMotif.trim()) return;
    setDocLoading(true);
    try {
      await apiAuthPost(`/api/v1/admin/kyc/client/${selectedClient.client_id}/complete-batch`, {
        events: [{ document_type: completeDocType, motif: completeMotif.trim() }],
      });
      toast("Document marqué « à compléter ». Email récapitulatif envoyé.", "success");
      setCompleteOpen(false);
      setCompleteDocType(null);
      setCompleteMotif("");
      await fetchClientDetails();
    } catch (err: any) {
      toast(err?.message || "Erreur lors de l'enregistrement.", "error");
    } finally {
      setDocLoading(false);
    }
  };

  const statutColor = (s: string | null | undefined) => {
    const v = (s || "").toLowerCase();
    if (v === "approuvé") return "success";
    if (v === "rejeté") return "danger";
    if (v === "à_compléter") return "warning";
    return "muted";
  };

  const docLabel = (t: string) => t === "piece_identite" ? "Pièce d'identité" : "Justificatif de domicile";

  // ==================== VUE LISTE : CLIENTS ====================
  if (view === "list") {
    const pending = clients.filter(
      (c) =>
        c.piece_identite_statut === "en_cours" ||
        c.justificatif_domicile_statut === "en_cours" ||
        c.piece_identite_statut === "à_compléter" ||
        c.justificatif_domicile_statut === "à_compléter" ||
        c.statuts === "en_cours",
    );

    return (
      <div className="db-tab-content active" id="tab-kyc">
        <div className="db-welcome">
          <div>
            <h1>Validation KYC (Conformité)</h1>
            <p>
              Sélectionnez un client pour examiner ses documents soumis et prendre une décision.
            </p>
          </div>
        </div>
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <>
            <div className="db-section">
              <div className="db-section-header">
                <h2>Clients avec dossiers KYC en cours</h2>
              </div>
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Entreprise</th>
                      <th>E-mail</th>
                      <th>Pièce identité</th>
                      <th>Justificatif domicile</th>
                      <th>Dépôt</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                          Aucun dossier KYC en attente.
                        </td>
                      </tr>
                    ) : (
                      pending.map((c) => (
                        <tr key={c.client_id}>
                          <td>{c.nom ?? "—"}</td>
                          <td>{c.entreprise ?? "—"}</td>
                          <td>{c.email ?? "—"}</td>
                          <td>
                            <span className={`badge badge-${statutColor(c.piece_identite_statut)}`}>
                              {c.piece_identite_statut ?? "—"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-${statutColor(c.justificatif_domicile_statut)}`}>
                              {c.justificatif_domicile_statut ?? "—"}
                            </span>
                          </td>
                          <td>{fmtDate(c.date_soumission)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                              onClick={() => openClientDetail(c)}
                            >
                              Voir les documents
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==================== VUE DÉTAIL : DOCUMENTS D'UN CLIENT ====================
  const d = details;
  if (!d || !selectedClient) return <div className="db-section" style={{ textAlign: "center", padding: 40 }}>Chargement...</div>;

  const client = d.client;
  const documents: ApiKycDocument[] = d.documents ?? [];

  return (
    <div className="db-tab-content active" id="tab-kyc-detail">
      <div className="db-welcome">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
            onClick={goBack}
          >
            ← Retour à la liste
          </button>
          <div>
            <h1>Détail KYC — {client.nom ?? "Client"}</h1>
            <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
              {client.entreprise ? client.entreprise : ""} &nbsp;·&nbsp; {client.email ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Bouton "À compléter" avec dropdown */}
      {completeOpen && (
        <div className="db-section" style={{ marginBottom: 16 }}>
          <div className="db-section-header"><h2>Marquer un document « À compléter »</h2></div>
          <div className="db-grid db-grid-2">
            <div className="db-card">
              <p className="db-label">Document concerné</p>
              <select
                value={completeDocType ?? ""}
                onChange={(e) => setCompleteDocType(e.target.value as any)}
                className="form-control"
              >
                <option value="">— Sélectionner —</option>
                {DOC_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>
            <div className="db-card">
              <p className="db-label">Motif</p>
              <textarea
                value={completeMotif}
                onChange={(e) => setCompleteMotif(e.target.value)}
                rows={3}
                className="form-control"
                placeholder="Précisez ce qui manque ou est incorrect..."
              />
            </div>
          </div>
          <div className="db-actions" style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCompleteOpen(false)}
              disabled={docLoading}
            >
              Annuler
            </button>
            <ButtonLoader isLoading={docLoading} delayMs={150}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmCompleteBatch}
                disabled={docLoading || !completeDocType || !completeMotif.trim()}
              >
                {docLoading ? "Enregistrement..." : "Enregistrer (email groupé)"}
              </button>
            </ButtonLoader>
          </div>
        </div>
      )}

      {/* Documents du client */}
      <div className="db-section">
        <div className="db-section-header"><h2>Documents soumis</h2></div>
        <div className="db-grid db-grid-2">
          {documents.map((doc) => (
            <div key={doc.type} className="kyc-detail-card">
              <div className="kyc-doc-header">
                <h3>{doc.label}</h3>
                <span className={`badge badge-${statutColor(doc.statut)}`}>{doc.statut ?? "—"}</span>
              </div>
              {doc.chemin ? (
                <div className="kyc-doc-actions" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <a
                    href={`${documentViewerPath}?type=kyc&id=${selectedClient.client_id}&file=${doc.type}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ padding: "6px 10px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <span>{ICON("external")}</span> Ouvrir
                  </a>
                  <a
                    href={`/api/v1/document?type=kyc&id=${selectedClient.client_id}&file=${doc.type}`}
                    download
                    className="btn btn-outline"
                    style={{ padding: "6px 10px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}
                    title="Télécharger"
                  >
                    <span>{ICON("download")}</span> Télécharger
                  </a>
                </div>
              ) : (
                <p className="db-hint" style={{ fontSize: "0.85rem" }}>Aucun fichier soumis.</p>
              )}
              {/* 3 boutons côte à côte : Valider / Rejeter */}
              <div className="kyc-doc-decision" style={{ display: "flex", gap: 8 }}>
                <ButtonLoader
                  isLoading={deciding[`${selectedClient.client_id}-${doc.type}`] || false}
                  delayMs={150}
                >
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem" }}
                    onClick={() => decideDocument(doc.type, "approuvé", "")}
                    disabled={deciding[`${selectedClient.client_id}-${doc.type}`] || doc.statut === "approuvé"}
                  >
                    <span>{ICON("check")}</span> Valider
                  </button>
                </ButtonLoader>
                <ButtonLoader
                  isLoading={deciding[`${selectedClient.client_id}-${doc.type}`] || false}
                  delayMs={150}
                >
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem", borderColor: "var(--color-danger)" }}
                    onClick={() => {
                      setRejectOpen({ clientId: selectedClient.client_id, docType: doc.type });
                      setRejectMotif("");
                    }}
                    disabled={deciding[`${selectedClient.client_id}-${doc.type}`] || doc.statut === "rejeté"}
                  >
                    <span><span>{ICON("x")}</span> Rejeter</span>
                  </button>
                </ButtonLoader>
              </div>
              {doc.motif && (
                <p className="db-hint" style={{ fontSize: "0.8rem", marginTop: 8 }}>
                  Motif : {doc.motif}
                </p>
              )}
              {/* Formulaire rejet inline */}
              {rejectOpen?.clientId === selectedClient.client_id && rejectOpen?.docType === doc.type && (
                <div className="kyc-reject-form" style={{ marginTop: 10, padding: 10, background: "#FBEAE7", border: "1px solid #F5C6C6", borderRadius: 6 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 6, fontWeight: 600 }}>
                    Motif du rejet pour {doc.label} :
                  </label>
                  <textarea
                    value={rejectMotif}
                    onChange={(e) => setRejectMotif(e.target.value)}
                    rows={2}
                    className="form-control"
                    placeholder="Expliquez pourquoi ce document est rejeté..."
                  />
                  <div className="db-actions" style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => { setRejectOpen(null); setRejectMotif(""); }}
                      disabled={docLoading}
                    >
                      Annuler
                    </button>
                  <ButtonLoader isLoading={docLoading} delayMs={150}>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => decideDocument(doc.type, "rejeté", rejectMotif.trim())}
                      disabled={docLoading || !rejectMotif.trim()}
                    >
                      Confirmer le rejet
                    </button>
                  </ButtonLoader>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bouton "À compléter" global */}
      <div className="db-section" style={{ marginTop: 20 }}>
        <div className="db-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: "0.9rem" }}
            onClick={() => setCompleteOpen(true)}
            disabled={docLoading}
          >
            <span>{ICON("alert")}</span> Marquer un document « À compléter »
          </button>
          <span className="db-hint" style={{ fontSize: "0.85rem" }}>
            Sélectionnez le document manquant, précisez le motif, puis cliquez sur
            « Enregistrer » pour envoyer un email récapitulatif au client.
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Helpers partagés (chargement, erreur) — définis dans Component.tsx
// ============================================================

declare function LoadingLine(): JSX.Element;
declare function ErrorLine({ message }: { message: string }): JSX.Element;
declare function useAdminData(): {
  lists: any;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

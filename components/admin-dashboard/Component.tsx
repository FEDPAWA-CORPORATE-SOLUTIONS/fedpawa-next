// ==========================================================
// FEDPAWA — Dashboard Admin (vague D) — conversion de admin_dashboard.html
// Dashboard data-driven : GET /api/v1/admin/lists + /api/v1/admin/overview
// (KPI réels, tables clients/abonnements/paiements/courriers/contrats,
// queue KYC approve/reject, tickets, messagerie interne).
// L012 : modèle de contrat — flux OTP admin + éditeur TinyMCE
// (CDN officiel, pas de vendor converti — voir ContractTemplateEditor).
// Onglets : dashboard, clients, abonnements, paiements, courriers,
// contrats, kyc, tickets (dynamique), messages (dynamique), stats.
// ==========================================================

"use client";

import CloseTag from "./CloseTag";
import { useCallback, useEffect, useState } from "react";
import {
  apiAuthGet,
  apiAuthGetBlob,
  apiAuthPost,
  apiAuthPostForm,
} from "@/lib/auth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import type {
  AdminLists,
  AdminOverview,
  ApiAdminClient,
  ApiAdminContrat,
  ApiAdminCourrier,
  ApiAdminKyc,
  ApiAdminPaiement,
  ApiAdminSubscription,
  ApiMailMessage,
  ApiContactMessage,
  ApiTicket,
  ApiThrottle,
} from "@/lib/dashboard-types";
import TabKyc from "@/components/admin-dashboard/TabKyc";
import {
  fmtDate,
  fmtFCFA,
  statutBadgeVariant,
} from "@/lib/dashboard-format";
import {
  DashboardUIProvider,
  Modal,
  useToast,
} from "@/components/dashboard/UI";
import ButtonLoader from "@/components/ui/ButtonLoader";
import ContractTemplateEditor from "@/components/admin-dashboard/ContractTemplateEditor";

type TabId =
  | "dashboard"
  | "clients"
  | "abonnements"
  | "paiements"
  | "courriers"
  | "contrats"
  | "kyc"
  | "tickets"
  | "messages"
  | "stats"
  | "mails";

interface NavItem {
  tab: TabId;
  label: string;
  svg: React.ReactNode;
  href?: string; // si présent, redirige vers cette URL au lieu de changer l'onglet
}

const NAV_ITEMS: NavItem[] = [
  { tab: "dashboard", label: "Vue d'ensemble", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { tab: "clients", label: "Gestion Clients", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { tab: "abonnements", label: "Abonnements", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg> },
  { tab: "paiements", label: "Paiements", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
  { tab: "courriers", label: "Courriers", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> },
  { tab: "contrats", label: "Contrats", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { tab: "kyc", label: "Validation KYC", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg> },
  { tab: "tickets", label: "Support Client", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
  { tab: "messages", label: "Messagerie", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { tab: "stats", label: "Stats & Paramètres", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
  { tab: "mails", label: "Boîte Mail", href: "/admin/mails", svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: "var(--color-gold)", width: 36, height: 36 }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><polyline points="22,6 12,13 2,6" /></svg> },
];

function StatutBadge({ statut }: { statut: string | null | undefined }) {
  const variant = statutBadgeVariant(statut);
  return <span className={`badge badge-${variant}`}>{statut ?? "inconnu"}</span>;
}

function EmptyRow({ cols, msg }: { cols: number; msg: string }) {
  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 28 }}>
        {msg}
      </td>
    </tr>
  );
}

export default function AdminDashboard({
  documentViewerPath = "/admin-document",
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const { loading: globalLoading } = useAdminData();

  return (
    <DashboardUIProvider>
      <div className="db-layout">
        {globalLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "var(--color-bg-main)",
                padding: 24,
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ fontSize: "0.95rem", color: "var(--color-heading)", fontWeight: 600 }}>
                Chargement…
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 6 }}>
                Les données du dashboard sont en cours de récupération.
              </p>
            </div>
          </div>
        )}
        <aside className="db-sidebar">
          <nav className="db-nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.tab}
                className={`db-nav-item${item.href ? " db-nav-item-external" : ""}${activeTab === item.tab && !item.href ? " active" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (item.href) {
                    window.location.href = item.href;
                  } else {
                    setActiveTab(item.tab);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (item.href) {
                      window.location.href = item.href;
                    } else {
                      setActiveTab(item.tab);
                    }
                  }
                }}
              >
                {item.svg} {item.label}
                {item.tab === "kyc" && <NavKycCount />}
              </div>
            ))}
          </nav>
        </aside>
        {/* W-14 : barre d'onglets mobile (chips scrollables) — visible <991px */}
        <nav className="db-tabs-mobile" aria-label="Navigation du tableau de bord admin">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.tab}
              type="button"
              className={`db-tab-chip${activeTab === item.tab ? " active" : ""}`}
              onClick={() => setActiveTab(item.tab)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="db-main">
          {activeTab === "dashboard" && <TabOverview onSwitch={setActiveTab} />}
          {activeTab === "clients" && <TabClients />}
          {activeTab === "abonnements" && <TabAbonnements />}
          {activeTab === "paiements" && <TabPaiements />}
          {activeTab === "courriers" && <TabCourriers />}
          {activeTab === "contrats" && <TabContrats />}
          {activeTab === "kyc" && <TabKyc />}
          {activeTab === "tickets" && <TabTickets />}
          {activeTab === "messages" && <TabMessages />}
          {activeTab === "stats" && <TabStats />}
        </main>
      </div>
    </DashboardUIProvider>
  );
}

/** Compteur KYC en attente (nav-count) — partagé entre nav et KPI. */
function NavKycCount() {
  const { kycPending } = useAdminData();
  return <span className="nav-count">{kycPending}</span>;
}

// ==========================================================
// Chargement partagé /api/v1/admin/lists + /api/v1/admin/overview
// (contexte léger : un seul fetch pour la page entière, parité
// loadAdminData() admin-dashboard.js qui peuple tous les onglets).
// ==========================================================

import { createContext, useContext } from "react";

interface AdminDataState {
  lists: AdminLists | null;
  overview: AdminOverview | null;
  loading: boolean;
  error: string | null;
  kycPending: number;
  reload: () => void;
}

const AdminDataContext = createContext<AdminDataState>({
  lists: null,
  overview: null,
  loading: false,
  error: null,
  kycPending: 0,
  reload: () => {},
});

function useAdminData(): AdminDataState {
  return useContext(AdminDataContext);
}

function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<AdminLists | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      apiAuthGet<AdminLists>("/api/v1/admin/lists").catch(() => null),
      apiAuthGet<AdminOverview>("/api/v1/admin/overview").catch(() => null),
    ]).then(([l, o]) => {
      if (cancelled) return;
      if (!l && !o) {
        setError(getFriendlyErrorMessage(null as unknown as { status: number }, "dashboard-admin") ?? "Les données n'ont pas pu être chargées pour le moment. Réessayez dans quelques instants.");
      } else {
        setLists(l);
        setOverview(o);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const kycPending =
    overview?.stats?.kyc_en_cours ??
    (lists?.kyc ?? []).filter(
      (k) => k.statuts === "en_cours" || k.statuts === "en_attente",
    ).length;

  return (
    <AdminDataContext.Provider
      value={{
        lists,
        overview,
        loading,
        error,
        kycPending,
        reload: () => setReloadKey((k) => k + 1),
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

// Wrapper pour exposer le provider à l'arbre (NavKycCount en dépend).
export function AdminDashboardWithProviders(props: AdminDashboardProps) {
  return (
    <AdminDataProvider>
      <AdminDashboard {...props} />
    </AdminDataProvider>
  );
}

function LoadingLine() {
  return (
    <div className="db-section" style={{ color: "var(--color-text-muted)", padding: "28px 12px", textAlign: "center" }}>
      Chargement…
    </div>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <div className="db-section" style={{ color: "var(--color-danger)", padding: "28px 12px", textAlign: "center" }}>
      {message}
    </div>
  );
}

// ==========================================================
// Vue d'ensemble : KPI réels + alertes dynamiques
// ==========================================================

function TabOverview({ onSwitch }: { onSwitch: (tab: TabId) => void }) {
  const { lists, overview, loading, error, kycPending } = useAdminData();
  const contactNouveau = (lists?.contact_messages ?? []).filter(
    (m) => m.statut === "nouveau",
  ).length;

  if (loading) return <LoadingLine />;
  if (error) return <ErrorLine message={error} />;

  const k = overview?.stats ?? {};
  const paiementsRecus = (lists?.paiements ?? []).reduce(
    (t, p) => t + (p.statut === "recu" ? Number(p.montant ?? 0) : 0),
    0,
  );
  const ticketsOpen = (lists?.tickets ?? []).filter((t) => t.statut === "open").length;
  const msgsClients = (lists?.messages ?? []).filter((m) => m.sender_type === "client").length;

  return (
    <div className="db-tab-content active" id="tab-dashboard">
      <div className="db-welcome"><div><h1>Vue d'ensemble</h1><p>Bienvenue. Voici la synthétique de l'activité de FEDPAWA Corporate Solutions.</p></div></div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div>
          <div className="kpi-info"><h3>Membres Actifs</h3><div className="kpi-value">{k.clients ?? 0}</div><div className="kpi-sub">Total enregistrés</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
          <div className="kpi-info"><h3>CA Mensuel</h3><div className="kpi-value">{fmtFCFA(paiementsRecus)}</div><div className="kpi-sub">Paiements reçus cumulés</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
          <div className="kpi-info"><h3>Abonnements</h3><div className="kpi-value">{k.abonnements ?? 0}</div><div className="kpi-sub">Toutes souscriptions</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg></div>
          <div className="kpi-info"><h3>KYC en attente</h3><div className="kpi-value">{k.kyc_en_cours ?? kycPending}</div><div className="kpi-sub">Action requise</div></div>
        </div>
      </div>
      <h2 style={{ fontSize: "1.4rem", marginBottom: 20 }}>Actions Requises</h2>
      <div className="alerts-grid">
        {kycPending > 0 && (
          <div className="alert-card danger">
            <div className="alert-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
            <div className="alert-content">
              <h4>{kycPending} dossier(s) KYC à valider</h4>
              <p>Des clients attendent la validation de leurs pièces.</p>
              <button type="button" className="alert-action" onClick={() => onSwitch("kyc")}>Examiner →</button>
            </div>
          </div>
        )}
        {ticketsOpen > 0 && (
          <div className="alert-card info">
            <div className="alert-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
            <div className="alert-content">
              <h4>{ticketsOpen} ticket(s) support ouvert(s)</h4>
              <p>Répondez rapidement aux demandes clients.</p>
              <button type="button" className="alert-action" onClick={() => onSwitch("tickets")}>Consulter →</button>
            </div>
          </div>
        )}
        {msgsClients > 0 && (
          <div className="alert-card">
            <div className="alert-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
            <div className="alert-content">
              <h4>{msgsClients} message(s) client(s) reçu(s)</h4>
              <p>Boîte de réception interne.</p>
              <button type="button" className="alert-action" onClick={() => onSwitch("messages")}>Ouvrir la messagerie →</button>
            </div>
          </div>
        )}
        {contactNouveau > 0 && (
          <div className="alert-card warn">
            <div className="alert-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
            <div className="alert-content">
              <h4>{contactNouveau} message(s) de contact non lu(s)</h4>
              <p>Consultez-les dans l'onglet Support Client.</p>
              <button type="button" className="alert-action" onClick={() => onSwitch("tickets")}>Voir →</button>
            </div>
          </div>
        )}
        {kycPending === 0 && ticketsOpen === 0 && msgsClients === 0 && contactNouveau === 0 && (
          <div className="alert-card">
            <p style={{ color: "var(--color-text-muted)" }}>Aucune action requise. Tout est à jour.</p>
          </div>
        )}
      </div>
      {/* Tendances d'activité (P2 — M25) */}
      <div className="db-section" style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Tendances d'activité</h2>
        <p className="db-hint" style={{ marginBottom: 16 }}>
          Indicateurs d'activité sur les 6 derniers mois (données de démonstration).
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Nouveaux clients", value: 65 },
            { label: "Tickets créés", value: 42 },
            { label: "Paiements reçus", value: 28 },
            { label: "KYC validés", value: 18 },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                flex: 1,
                minWidth: 140,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{item.label}</div>
              <div
                style={{
                  height: 8,
                  background: "var(--color-border)",
                  borderRadius: 4,
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--color-primary)",
                    width: `${Math.min(100, (item.value / 100) * 100)}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// Clients
// ==========================================================

function TabClients() {
  const { lists, loading, error } = useAdminData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const clients: ApiAdminClient[] = lists?.clients ?? [];
  const filtered = search
    ? clients.filter(
        (c) =>
          (c.nom ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.entreprise ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.email ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : clients;

  return (
    <div className="db-tab-content active" id="tab-clients">
      <div className="db-welcome"><div><h1>Gestion des Clients</h1><p>Liste complète des utilisateurs enregistrés sur la plateforme.</p></div></div>
      <div className="db-section">
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <>
            <div className="db-section-header">
              <h2>Annuaire des Clients</h2>
              <p className="db-hint">{filtered.length} client(s) affiché(s) / {clients.length} total</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginLeft: 12, fontSize: "0.85rem" }}
                onClick={() => {
                  const csv = ["ID,Nom,Raison Sociale,Email,Statut"];
                  filtered.forEach(c => {
                    csv.push([
                      c.id,
                      `"${c.nom ?? ""}"`,
                      `"${c.entreprise ?? ""}"`,
                      `"${c.email ?? ""}"`,
                      c.statut ?? "actif"
                    ].join(","));
                  });
                  const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "clients.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export CSV
              </button>
              <div className="search-bar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>ID</th><th>Nom / Représentant</th><th>Raison Sociale</th><th>Email</th><th>Statut</th><th>Détails complets</th><th>Action</th></tr></thead>
                                <tbody>
                                  {filtered.length === 0 ? (
                                    <EmptyRow cols={7} msg="Aucun client enregistré" />
                                  ) : (
                                    filtered.map((c) => (
                                      <tr key={c.id}>
                                        <td>CL-{String(c.id).padStart(3, "0")}</td>
                                        <td>{c.nom ?? "—"}</td>
                                        <td>{c.entreprise || "—"}</td>
                                        <td>{c.email ?? "—"}</td>
                                        <td><StatutBadge statut={c.statut ?? "actif"} /></td>
                                        <td>
                                          <a
                                            href={`/client/details?id=${c.id}`}
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                                          >
                                            Voir les détails
                                          </a>
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                                            onClick={() => toast(`Action ${c.statut === "actif" ? "suspendre" : "activer"} à implémenter (backend).`, "info")}
                                          >
                                            {c.statut === "actif" ? "Suspendre" : "Activer"}
                                          </button>
                                        </td>
                                      </tr>
                                    )))
                                  }
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Abonnements
// ==========================================================

function TabAbonnements() {
  const { lists, loading, error } = useAdminData();
  const { toast } = useToast();
  const abonnements: ApiAdminSubscription[] = lists?.abonnements ?? [];

  return (
    <div className="db-tab-content active" id="tab-abonnements">
      <div className="db-welcome"><div><h1>Gestion des Abonnements</h1><p>Suivi des contrats actifs, résiliés et en attente de renouvellement.</p></div></div>
      <div className="db-section">
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>ID Abonn.</th><th>Client</th><th>Pack</th><th>Date Expiration</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {abonnements.length === 0 ? (
                  <EmptyRow cols={6} msg="Aucun abonnement" />
                ) : (
                  abonnements.map((a) => (
                    <tr key={a.id}>
                      <td>AB-{a.id}</td>
                      <td>{a.client_nom ?? "—"}{a.entreprise ? ` (${a.entreprise})` : ""}</td>
                      <td>{a.pack ?? "—"}</td>
                      <td>{fmtDate(a.date_fin)}</td>
                      <td><StatutBadge statut={a.statut} /></td>
                      <td>
                        {a.statut === "actif" ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                            onClick={() => toast("Résiliation d'abonnement à implémenter (backend).", "info")}
                          >
                            Résilier
                          </button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Paiements
// ==========================================================

function TabPaiements() {
  const { lists, loading, error } = useAdminData();
  const { toast } = useToast();
  const paiements: ApiAdminPaiement[] = lists?.paiements ?? [];
  const [paiementSearch, setPaiementSearch] = useState("");
  const [paiementFilter, setPaiementFilter] = useState("");

  const filteredPaiements = paiements.filter((p) => {
    const matchesSearch = (p.client_nom ?? "").toLowerCase().includes(paiementSearch.toLowerCase()) || (p.statut ?? "").toLowerCase().includes(paiementSearch.toLowerCase());
    const matchesFilter = !paiementFilter || p.statut === paiementFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="db-tab-content active" id="tab-paiements">
      <div className="db-welcome"><div><h1>Paiements & Factures</h1><p>Historique financier et génération de factures.</p></div></div>
      <div className="db-section">
        <div className="db-section-header">
          <h2>Historique des Paiements</h2>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const csv = ["ID,Client,Montant,Mode,Date,Statut"];
              filteredPaiements.forEach((p) => {
                csv.push([
                  p.transaction_id || `PAY-${p.id}`,
                  p.client_nom || "",
                  fmtFCFA(p.montant),
                  p.mode_paiement || "",
                  fmtDate(p.date),
                  p.statut || "",
                ].join(","));
              });
              const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "paiements.csv";
              a.click();
              URL.revokeObjectURL(url);
          }}>
            Export CSV
          </button>
        </div>
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <label>
                <input
                  type="search"
                  placeholder="Rechercher un paiement..."
                  value={paiementSearch}
                  onChange={(e) => setPaiementSearch(e.target.value)}
                  className="form-control"
                  style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                />
              </label>
              <label>
                <select
                  value={paiementFilter}
                  onChange={(e) => setPaiementFilter(e.target.value as any)}
                  className="form-control"
                  style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                >
                  <option value="">Tous les statuts</option>
                  <option value="recu">Reçu</option>
                  <option value="en_attente">En attente</option>
                  <option value="echec">Échec</option>
                </select>
              </label>
              <p className="db-hint" style={{ margin: 0, fontSize: "0.85rem" }}>{filteredPaiements.length} paiement(s)</p>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>Réf. Paiement</th><th>Client</th><th>Montant</th><th>Mode</th><th>Date</th><th>Statut</th><th>Facture</th></tr></thead>
                <tbody>
                  {filteredPaiements.length === 0 ? (
                    <EmptyRow cols={7} msg="Aucun paiement" />
                  ) : (
                    filteredPaiements.map((p) => (
                      <tr key={p.id}>
                        <td>{p.transaction_id || `PAY-${p.id}`}</td>
                        <td>{p.client_nom || "—"}</td>
                        <td>{fmtFCFA(p.montant)}</td>
                        <td>{p.mode_paiement ?? "—"}</td>
                        <td>{fmtDate(p.date)}</td>
                        <td><StatutBadge statut={p.statut} /></td>
                        <td>{p.statut === "recu" ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            onClick={() => {
                              apiAuthGetBlob(`/api/v1/document?type=facture&id=${p.id}`)
                                .then((blob: Blob) => {
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `facture-${p.id}.pdf`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                })
                                .catch(() => toast("Téléchargement impossible.", "error"));
                            }}
                          >
                            PDF
                          </button>
                        ) : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Courriers : nouveau courrier (clients réels dans le select) + historique
// ==========================================================

function TabCourriers() {
  const { lists, loading, error, reload } = useAdminData();
  const { toast } = useToast();
  const courriers: ApiAdminCourrier[] = lists?.courriers ?? [];
  const clients = lists?.clients ?? [];
  const [clientId, setClientId] = useState("");
  const [dateReception, setDateReception] = useState("");
  const [notify, setNotify] = useState(true);
  const [sending, setSending] = useState(false);
  const [courrierSearch, setCourrierSearch] = useState("");
  const [courrierFilter, setCourrierFilter] = useState("");
  const [scanFile, setScanFile] = useState<File | null>(null);

  const filteredCourriers = courriers.filter((co) => {
    const matchesSearch = (co.client_nom ?? "").toLowerCase().includes(courrierSearch.toLowerCase()) || (co.statut ?? "").toLowerCase().includes(courrierSearch.toLowerCase());
    const matchesFilter = !courrierFilter || co.statut === courrierFilter;
    return matchesSearch && matchesFilter;
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId) {
      toast("Sélectionnez un client destinataire.", "error");
      return;
    }
    setSending(true);
    try {
      if (scanFile) {
        // Upload réel du scan avec le courrier (FormData multipart)
        const fd = new FormData();
        fd.append("client_id", String(clientId));
        fd.append("date_reception", dateReception || "");
        fd.append("notify", String(notify));
        fd.append("scan", scanFile, scanFile.name);
        await apiAuthPostForm("/api/v1/admin/courrier/add", fd);
      } else {
        // POST /api/v1/admin/courrier/add : client_id + scan_path requis (CourrierAddRequest).
        // scan_path = upload réel via POST /api/v1/courrier/upload si un fichier est fourni ;
        // sinon chemin d'archive « (courrier enregistré sans scan) » par parité add() legacy.
        await apiAuthPost("/api/v1/admin/courrier/add", {
          client_id: Number(clientId),
          scan_path: "(courrier enregistré sans scan)",
          date_reception: dateReception || undefined,
          notify,
        });
      }
      toast("Courrier enregistré.", "success");
      setClientId("");
      setDateReception("");
      setScanFile(null);
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur d'enregistrement.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="db-tab-content active" id="tab-courriers">
      <div className="db-welcome"><div><h1>Gestion des Courriers</h1><p>Réception, numérisation et attribution du courrier physique.</p></div></div>
      <div className="db-section">
        <div className="db-section-header"><h2>Nouveau Courrier</h2></div>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="courrier-client">Client destinataire</label>
              <select
                id="courrier-client"
                className="form-control"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nom ?? "—"}{c.entreprise ? ` (${c.entreprise})` : ""} (CL-{String(c.id).padStart(3, "0")})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="courrier-date">Date de réception</label>
              <input
                id="courrier-date"
                type="date"
                className="form-control"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dateReception}
                onChange={(e) => setDateReception(e.target.value)}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="courrier-scan">Téléverser le scan</label>
              <label
                htmlFor="courrier-scan"
                style={{ border: "2px dashed var(--color-border-strong)", padding: 20, textAlign: "center", color: "var(--color-text-muted)", cursor: "pointer", display: "block", marginTop: 8 }}
              >
                <input
                  id="courrier-scan"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) setScanFile(e.target.files[0]);
                  }}
                />
                {scanFile ? `Fichier : ${scanFile.name}` : "Cliquez pour parcourir ou glissez-déposez le fichier ici"}
              </label>
            </div>
            <div className="form-group full">
              <label style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "none", letterSpacing: 0 }}>
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Notifier le client (Email & WhatsApp)
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? "Enregistrement…" : "Enregistrer et Notifier"}
          </button>
        </form>
      </div>
      <div className="db-section">
        <div className="db-section-header">
          <h2>Historique des Courriers</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <label>
              <input
                type="search"
                placeholder="Rechercher un courrier..."
                value={courrierSearch}
                onChange={(e) => setCourrierSearch(e.target.value)}
                className="form-control"
                style={{ padding: "6px 10px", fontSize: "0.85rem" }}
              />
            </label>
            <label>
              <select
                value={courrierFilter}
                onChange={(e) => setCourrierFilter(e.target.value as any)}
                className="form-control"
                style={{ padding: "6px 10px", fontSize: "0.85rem" }}
              >
                <option value="">Tous les statuts</option>
                <option value="scanné">Numérisé</option>
                <option value="en_attente">En attente</option>
                <option value="archivé">Archivé</option>
              </select>
            </label>
            <p className="db-hint" style={{ margin: 0, fontSize: "0.85rem" }}>{filteredCourriers.length} courrier(s)</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              const csv = ["ID,Date,Client,Statut"];
              filteredCourriers.forEach(co => {
                csv.push([
                  co.id,
                  fmtDate(co.date_reception),
                  `"${co.client_nom ?? ""}"`,
                  co.statut ?? ""
                ].join(","));
              });
              const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "courriers.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </button>
        </div>
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>Date</th><th>Client</th><th>Expéditeur / Type</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredCourriers.length === 0 ? (
                  <EmptyRow cols={5} msg="Aucun courrier" />
                ) : (
                  filteredCourriers.map((co) => (
                    <tr key={co.id}>
                      <td>{fmtDate(co.date_reception)}</td>
                      <td>{co.client_nom || "—"}</td>
                      <td>Courrier reçu</td>
                      <td><StatutBadge statut={co.statut} /></td>
                      <td>
                        {co.doc_exists ? (
                          <a
                            href={`${"/admin-document"}?type=courrier&id=${co.id}`}
                            target="_blank"
                            rel="noopener"
                            className="action-link"
                          >
                            Consulter
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Contrats : registre + L012 éditeur du modèle (OTP + TinyMCE CDN)
// ==========================================================

function TabContrats({ documentViewerPath = "/admin-document" }: { documentViewerPath?: string }) {
  const { lists, loading, error } = useAdminData();
  const { toast } = useToast();
  const contrats: ApiAdminContrat[] = lists?.contrats ?? [];
  const [contratSearch, setContratSearch] = useState("");
  const [contratFilter, setContratFilter] = useState("");

  const filteredContrats = contrats.filter((ct) => {
    const matchesSearch = (ct.client_nom ?? "").toLowerCase().includes(contratSearch.toLowerCase()) || (ct.type ?? "").toLowerCase().includes(contratSearch.toLowerCase());
    const matchesFilter = !contratFilter || ct.type === contratFilter;
    return matchesSearch && matchesFilter;
  });

  // --- Flux L012 : otp-request → otp-verify → GET template → TinyMCE → update ---
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [templateOtRequesting, setTemplateOtRequesting] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [templateContent, setTemplateContent] = useState("");

  const requestTemplateOtp = async () => {
    setTemplateOtRequesting(true);
    try {
      const res = await apiAuthPost<{ sent?: boolean; email?: string; error?: string }>(
        "/api/v1/admin/template/otp-request",
        {},
      );
      if (res.sent) {
        setOtpEmail(res.email ?? "");
        setOtp("");
        setOtpError("");
        setOtpModalOpen(true);
      } else {
        toast(res.error ?? "Impossible d'envoyer le code de vérification.", "error");
      }
    } catch (e) {
      toast("Erreur réseau lors de l'envoi du code.", "error");
    } finally {
      setTemplateOtRequesting(false);
    }
  };

  const submitTemplateOtp = async () => {
    const code = otp.replace(/\D/g, "");
    if (code.length !== 6) {
      setOtpError("Saisissez les 6 chiffres du code reçu.");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await apiAuthPost<{ unlocked?: boolean; error?: string }>(
        "/api/v1/admin/template/otp-verify",
        { otp: code },
      );
      if (res.unlocked) {
        setOtpModalOpen(false);
        // GET /api/v1/admin/template puis éditeur
        const tpl = await apiAuthGet<{ content?: string; error?: string }>(
          "/api/v1/admin/template",
        );
        if (typeof tpl.content === "string") {
          setTemplateContent(tpl.content);
          setEditorOpen(true);
        } else {
          toast(tpl.error ?? "Le modèle de contrat n'a pas pu être chargé pour le moment. Réessayez dans quelques instants.", "error");
        }
      } else {
        setOtpError(res.error ?? "Code invalide.");
      }
    } catch (e) {
      setOtpError("Erreur réseau. Réessayez.");
    } finally {
      setOtpBusy(false);
    }
  };

  const saveTemplate = useCallback(
    async (content: string) => {
      try {
        await apiAuthPost("/api/v1/admin/template/update", { content });
        toast("Modèle de contrat enregistré.", "success");
        setEditorOpen(false);
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (status === 403) {
          toast("Déverrouillage expiré : vérification OTP requise.", "error");
        } else {
          toast(err instanceof Error ? err.message : "Échec de l'enregistrement.", "error");
        }
        throw err;
      }
    },
    [toast],
  );

  return (
    <div className="db-tab-content active" id="tab-contrats">
      <div className="db-welcome"><div><h1>Contrats & Signatures</h1><p>Registre centralisé des actes générés et signés électroniquement.</p></div></div>
      <div className="db-section">
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <label>
                <input
                  type="search"
                  placeholder="Rechercher un contrat..."
                  value={contratSearch}
                  onChange={(e) => setContratSearch(e.target.value)}
                  className="form-control"
                  style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                />
              </label>
              <label>
                <select
                  value={contratFilter}
                  onChange={(e) => setContratFilter(e.target.value as any)}
                  className="form-control"
                  style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                >
                  <option value="">Tous les types</option>
                  <option value="creation">Création</option>
                  <option value="oapi">OAPI</option>
                  <option value="contrats">Contrats</option>
                  <option value="fiscalite">Fiscalité</option>
                </select>
              </label>
              <p className="db-hint" style={{ margin: 0, fontSize: "0.85rem" }}>{filteredContrats.length} contrat(s)</p>
            </div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>ID Contrat</th><th>Client</th><th>Type de Service</th><th>État Signature</th><th>Fichier</th></tr></thead>
                <tbody>
                  {filteredContrats.length === 0 ? (
                    <EmptyRow cols={5} msg="Aucun contrat" />
                  ) : (
                    filteredContrats.map((ct) => (
                      <tr key={ct.id}>
                        <td>CT-{String(ct.id).padStart(3, "0")}</td>
                        <td>{ct.client_nom || "—"}</td>
                        <td>{ct.type ?? "—"}</td>
                        <td><StatutBadge statut="actif" /></td>
                        {/* Note : ApiAdminContrat n'expose pas de champ statut ; "actif" est la valeur par défaut. */}
                        <td>
                          {ct.doc_exists ? (
                            <a
                              href={`${documentViewerPath}?type=contrat&id=${ct.id}`}
                              target="_blank"
                              rel="noopener"
                              className="action-link"
                            >
                              Consulter PDF
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {/* L012 : édition du modèle de contrat (OTP admin obligatoire + éditeur TinyMCE CDN) */}
      <div className="db-section" id="template-editor-section">
        <div className="db-section-header"><h2>Modèle de contrat</h2></div>
        <p className="l012-editor-hint">Le modèle ci-dessous sert à générer les contrats PDF des clients. Toute modification exige une vérification de sécurité : un code à 6 chiffres est envoyé à votre adresse e-mail d'administration.</p>
        <ButtonLoader isLoading={templateOtRequesting} delayMs={150}>
          <button className="btn btn-primary" id="btn-edit-template" type="button" onClick={requestTemplateOtp}>
            Modifier le contrat
          </button>
        </ButtonLoader>
      </div>

      {/* Modal OTP (L012) */}
      {otpModalOpen && (
        <Modal title="Vérification de sécurité" onClose={() => setOtpModalOpen(false)} disableOverlayClose>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", textAlign: "center" }}>
            Un code de vérification a été envoyé à <strong>{otpEmail}</strong>. Saisissez-le pour déverrouiller l'éditeur.
          </p>
          <div className="l012-otp-form">
            <input
              id="l012-otp-input"
              className="l012-otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="••••••"
              aria-label="Code de vérification à 6 chiffres"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitTemplateOtp();
                }
              }}
            />
            <p className="l012-otp-error" id="l012-otp-error" role="alert">{otpError}</p>
            <div className="l012-otp-actions">
              <button type="button" className="btn btn-outline" id="l012-otp-cancel" onClick={() => setOtpModalOpen(false)}>
                Annuler
              </button>
              <ButtonLoader isLoading={otpBusy} delayMs={150}>
                <button type="button" className="btn btn-primary" id="l012-otp-submit" onClick={submitTemplateOtp} disabled={otpBusy}>
                  {otpBusy ? "Vérification…" : "Valider"}
                </button>
              </ButtonLoader>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal éditeur TinyMCE (L012) */}
      {editorOpen && (
        <Modal title="Éditeur du modèle de contrat" onClose={() => setEditorOpen(false)} disableOverlayClose>
          <div className="fp-template-modal" style={{ width: "min(960px, 100%)" }}>
            <ContractTemplateEditor
              initialContent={templateContent}
              onSave={saveTemplate}
              onCancel={() => setEditorOpen(false)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==========================================================
// Tickets Support (onglet dynamique admin-dashboard.js)
// ==========================================================

function TabTickets() {
  const { lists, loading, error, reload } = useAdminData();
  const { toast } = useToast();
  const tickets: ApiTicket[] = lists?.tickets ?? [];
  const ticketsOpen = tickets.filter((t) => t.statut !== "closed" && t.statut !== "resolved").length;
  const [replyingTicketId, setReplyingTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const reply = async (ticketId: number) => {
    if (!replyText.trim()) return;
    setReplyingTicketId(ticketId);
    try {
      const res = await apiAuthPost<{ error?: string }>("/api/v1/admin/ticket/reply", {
        ticket_id: ticketId,
        reponse: replyText.trim(),
      });
      toast("Réponse envoyée. Le client la verra dans son espace.", "success");
      setReplyingTicketId(null);
      setReplyText("");
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de l'enregistrement.", "error");
    }
  };

  const cancelReply = () => {
    setReplyingTicketId(null);
    setReplyText("");
  };

  return (
    <div className="db-tab-content active" id="tab-tickets">
      <div className="db-welcome"><div><h1>Tickets Support</h1><p>Demandes clients via l'Espace Client.</p></div></div>
      <div className="db-section">
        <div className="db-section-header">
          <h2>Historique des Tickets</h2>
          {ticketsOpen > 0 && (
            <span style={{ background: "var(--color-warning)", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", marginLeft: 8 }}>
              {ticketsOpen} nouveau(x) ticket(s)
            </span>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              const csv = ["ID,Client,Sujet,Statut,Date"];
              tickets.forEach((t: any) => {
                csv.push([
                  t.id,
                  `"${(t as any).client_nom ?? t.client ?? ""}"`,
                  `"${t.sujet ?? ""}"`,
                  t.statut ?? "",
                  fmtDate(t.created_at)
                ].join(","));
              });
              const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "tickets.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </button>
        </div>
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>ID</th><th>Client</th><th>Sujet</th><th>Message</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>
              <tbody>
                {tickets.length === 0 ? (
                  <EmptyRow cols={7} msg="Aucun ticket" />
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id}>
                      <td>#{t.id}</td>
                      <td>{(t as ApiTicket & { client_nom?: string }).client_nom ?? "—"}</td>
                      <td>{t.sujet ?? "—"}</td>
                      <td style={{ maxWidth: 300 }}>{t.message ?? "—"}</td>
                      <td>{fmtDate(t.created_at)}</td>
                      <td><StatutBadge statut={t.statut} /></td>
                      <td>
                        {t.reponse ? (
                          <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Répondu</span>
                        ) : replyingTicketId === t.id ? (
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Votre réponse..."
                              style={{ padding: "4px 8px", fontSize: "0.75rem", flex: 1 }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => reply(t.id)}
                              disabled={!replyText.trim()}
                            >
                              Envoyer
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={cancelReply}
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                            type="button"
                            onClick={() => setReplyingTicketId(t.id)}
                          >
                            Répondre
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Messages de contact reçus depuis la page de contact (Support Client) */}
        {(!loading && !error) && (
          <div className="db-section" style={{ marginTop: 24 }}>
            <div className="db-section-header"><h2>Messages de contact (page Contact)</h2></div>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>ID</th><th>Nom</th><th>E-mail</th><th>Sujet</th><th>Message</th><th>Réception</th><th>Statut</th></tr></thead>
                <tbody>
                  {((lists?.contact_messages ?? []) as ApiContactMessage[]).length === 0 ? (
                    <EmptyRow cols={7} msg="Aucun message de contact" />
                  ) : (
                    (lists?.contact_messages ?? []).map((m) => (
                      <tr key={m.id}>
                        <td>#{m.id}</td>
                        <td>{m.nom ?? "—"}</td>
                        <td>{m.email ?? "—"}</td>
                        <td>{m.sujet ?? "—"}</td>
                        <td style={{ maxWidth: 300 }}>{(m.message ?? "—").slice(0, 120)}{(m.message ?? "").length > 120 ? "…" : ""}</td>
                        <td>{fmtDate(m.date_reception)}</td>
                        <td><StatutBadge statut={m.statut} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Messagerie interne (onglet dynamique admin-dashboard.js)
// ==========================================================

function TabMessages() {
  const { lists, loading, error, reload, overview } = useAdminData();
  const { toast } = useToast();
  const messages: ApiMailMessage[] = lists?.messages ?? [];
  const throttled: ApiThrottle[] = overview?.throttled ?? [];
  const [replyingMessageId, setReplyingMessageId] = useState<number | null>(null);
  const [replyMessageText, setReplyMessageText] = useState("");
  const [resettingThrottleId, setResettingThrottleId] = useState<string | null>(null);

  const resetThrottle = async (email: string, userType: string) => {
    if (!window.confirm(`Réinitialiser les tentatives de connexion pour ${email} ?`)) return;
    const key = `${email}:${userType}`;
    setResettingThrottleId(key);
    try {
      await apiAuthPost("/api/v1/admin/throttle/reset", { email, user_type: userType });
      toast("Tentatives réinitialisées.", "success");
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de la réinitialisation.", "error");
    } finally {
      setResettingThrottleId(null);
    }
  };

  const replyToClient = async (clientId: number | null | undefined, messageId: number) => {
    if (!clientId) return;
    setReplyingMessageId(messageId);
    try {
      if (!replyMessageText.trim()) return;
      await apiAuthPost("/api/v1/mail/reply", { client_id: Number(clientId), content: replyMessageText.trim() });
      toast("Réponse envoyée.", "success");
      setReplyingMessageId(null);
      setReplyMessageText("");
      reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de l'envoi.", "error");
    }
  };

  return (
    <div className="db-tab-content active" id="tab-messages">
      <div className="db-welcome">
        <div>
          <h1>Messagerie Interne</h1>
          <p>Échanges entre clients et administration.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ fontSize: "0.85rem" }}
          onClick={() => {
            const csv = ["ID,Date,Destinataire,Sujet,Statut"];
            messages.forEach((m) => {
              csv.push([
                m.id ?? "",
                `"${fmtDate(m.created_at)}"`,
                `"${m.client_nom ?? (m.sender_type === "admin" ? "Client" : "Administration")}"`,
                `"${(m.content ?? "").slice(0, 60)}"`,
                m.sender_type ?? "—",
              ].join(","));
            });
            const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "messages.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </button>
      </div>
      <div className="db-section">
        {loading ? <LoadingLine /> : null}
        {error ? <ErrorLine message={error} /> : null}
        {!loading && !error && (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>Client</th><th>De</th><th>Message</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {messages.length === 0 ? (
                  <EmptyRow cols={5} msg="Aucun message" />
                ) : (
                  messages.map((m, i) => (
                    <tr key={m.id ?? i}>
                      <td>{m.client_nom || "Admin"}</td>
                      <td>{m.sender_type ?? "—"}</td>
                      <td style={{ maxWidth: 400 }}>{m.content ?? "—"}</td>
                      <td>{fmtDate(m.created_at)}</td>
                      <td>
                        {m.sender_type === "client" ? (
                          replyingMessageId === m.id ? (
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                              <input
                                type="text"
                                value={replyMessageText}
                                onChange={(e) => setReplyMessageText(e.target.value)}
                                placeholder="Votre réponse..."
                                style={{ padding: "4px 8px", fontSize: "0.75rem", flex: 1 }}
                              />
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => replyToClient(m.sender_id, m.id ?? 0)}
                                disabled={!replyMessageText.trim()}
                              >
                                Envoyer
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  setReplyingMessageId(null);
                                  setReplyMessageText("");
                                }}
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <ButtonLoader
                              isLoading={replyingMessageId === m.id}
                              delayMs={150}
                            >
                              <button
                                className="btn btn-outline"
                                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                                type="button"
                                onClick={() => setReplyingMessageId(m.id ?? 0)}
                              >
                                Répondre
                              </button>
                            </ButtonLoader>
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Comptes verrouillés (tentatives de connexion) */}
        {(!loading && !error) && throttled.length > 0 && (
          <div className="db-section" style={{ marginTop: 24 }}>
            <div className="db-section-header"><h2>Comptes verrouillés (tentatives de connexion)</h2></div>
            <p className="db-hint" style={{ marginBottom: 12 }}>
              Ces comptes ont atteint le nombre maximal de tentatives échouées et sont temporairement bloqués. L'administrateur peut réinitialiser leurs tentatives.
            </p>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>Identifiant</th><th>Type</th><th>Tentatives</th><th>Verrouillé jusqu'à</th><th>IP</th><th>Action</th></tr></thead>
                <tbody>
                  {throttled.map((t) => (
                    <tr key={t.identifier + t.user_type}>
                      <td>{t.identifier ?? "—"}</td>
                      <td>{t.user_type ?? "—"}</td>
                      <td>{t.attempts ?? 0}</td>
                      <td>{t.locked_until ?? "—"}</td>
                      <td>{t.ip ?? "—"}</td>
                      <td>
                        <ButtonLoader
                          isLoading={resettingThrottleId === `${t.identifier}:${t.user_type}`}
                          delayMs={150}
                        >
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                            onClick={() => resetThrottle(t.identifier ?? "", t.user_type ?? "")}
                          >
                            Réinitialiser
                          </button>
                        </ButtonLoader>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Stats & Paramètres (toggles locaux, parité onclick source)
// ==========================================================

function TabStats() {
  const { lists, overview } = useAdminData();
  const { toast } = useToast();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    orange: true,
    mtn: true,
    whatsapp: false,
    maintenance: false,
  });

  const toggle = (key: string) => {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  };

  const k = overview?.stats ?? {};
  const ticketsEnAttente = (lists?.tickets ?? []).filter(
    (t) => t.statut !== "closed" && t.statut !== "resolved",
  ).length;

  return (
    <div className="db-tab-content active" id="tab-stats">
      <div className="db-welcome"><div><h1>Statistiques & Paramètres</h1><p>Configuration du système et analyse des performances.</p></div></div>
      <div className="db-section">
        <div className="overview-grid">
          <div className="overview-card">
            <h3>Clients actifs</h3>
            <div className="value">{k.clients ?? 0}</div>
          </div>
          <div className="overview-card">
            <h3>Abonnements</h3>
            <div className="value">{k.abonnements ?? 0}</div>
          </div>
          <div className="overview-card">
            <h3>Tickets en attente</h3>
            <div className="value">{ticketsEnAttente}</div>
          </div>
          <div className="overview-card">
            <h3>KYC en cours</h3>
            <div className="value">{k.kyc_en_cours ?? 0}</div>
          </div>
        </div>
        <div className="db-section-header"><h2>Configuration Système</h2></div>
        <div className="settings-list">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginBottom: 16 }}
            onClick={() => {
              // Envoi vers l'API de configuration (à connecter au backend)
              apiAuthPost("/api/v1/admin/config", toggles)
                .then(() => toast("Configuration enregistrée.", "success"))
                .catch(() => toast("Échec de l'enregistrement de la configuration.", "error"));
            }}
          >
            Enregistrer la configuration
          </button>
          <div className="setting-item">
            <div className="setting-info"><h4>Passerelle Orange Money</h4><p>API officielle pour la réception des paiements.</p></div>
            <div className={`status-toggle${toggles.orange ? " active" : ""}`} role="button" tabIndex={0} aria-pressed={toggles.orange} onClick={() => toggle("orange")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle("orange"); }} />
          </div>
          <div className="setting-item">
            <div className="setting-info"><h4>Passerelle MTN MoMo</h4><p>API officielle pour la réception des paiements.</p></div>
            <div className={`status-toggle${toggles.mtn ? " active" : ""}`} role="button" tabIndex={0} aria-pressed={toggles.mtn} onClick={() => toggle("mtn")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle("mtn"); }} />
          </div>
          <div className="setting-item">
            <div className="setting-info"><h4>Notifications WhatsApp Automatiques</h4><p>Envoi d'alertes aux clients pour courriers et factures.</p></div>
            <div className={`status-toggle${toggles.whatsapp ? " active" : ""}`} role="button" tabIndex={0} aria-pressed={toggles.whatsapp} onClick={() => toggle("whatsapp")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle("whatsapp"); }} />
          </div>
          <div className="setting-item">
            <div className="setting-info"><h4>Mode Maintenance</h4><p>Bloquer l'accès au tunnel de souscription pour maintenance.</p></div>
            <div className={`status-toggle${toggles.maintenance ? " active" : ""}`} role="button" tabIndex={0} aria-pressed={toggles.maintenance} onClick={() => toggle("maintenance")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle("maintenance"); }} />
          </div>
        </div>
      </div>
    </div>
  );
}

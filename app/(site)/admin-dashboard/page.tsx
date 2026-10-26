// Dashboard Admin fr — conversion de admin_dashboard.html (vague D).
// Dashboard admin data-driven (KYC queue, documents, courriers,
// tickets, messagerie, modèle de contrat L012 + TinyMCE CDN) —
// garde admin côté composant (Guarded.tsx).

import type { Metadata } from "next";
import AdminDashboardGuarded from "@/components/admin-dashboard/Guarded";

const title = "Dashboard Admin | FEDPAWA CORPORATE SOLUTIONS";
const description =
  "Tableau de bord administrateur FEDPAWA : synthèse d'activité, gestion clients, abonnements, paiements, courriers, validation KYC, tickets et messagerie interne.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/admin-dashboard",
    languages: {
      fr: "/admin-dashboard",
      en: "/en/admin-dashboard",
    },
  },
};

export default function AdminDashboardPage() {
  return <AdminDashboardGuarded locale="fr" documentViewerPath="/admin-document" />;
}

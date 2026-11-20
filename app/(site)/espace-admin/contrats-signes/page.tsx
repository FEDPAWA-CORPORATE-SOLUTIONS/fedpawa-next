// ==========================================================
// FEDPAWA — Admin : liste de tous les contrats de signature
// (routes /espace-admin/contrats-signes)
// ==========================================================

import type { Metadata } from "next";
import AdminDashboardGuarded from "@/components/admin-dashboard/Guarded";
import ContractSigningList from "@/components/espace-client/signature/ContractSigningList";
import type { Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Contrats électroniques | Admin FEDPAWA",
  description:
    "Tableau de bord admin : liste de tous les contrats de signature électronique, avec statut, date et téléchargement du PDF signé.",
  robots: { index: false, follow: false },
};

export default function AdminContratsSignesPage({ locale }: { locale: Locale }) {
  return (
    <main className="db-main sig-main">
      <div className="db-welcome">
        <div>
          <h1>Contrats électroniques</h1>
          <p>
            Consultez tous les contrats de signature électronique de la plateforme.
          </p>
        </div>
      </div>

      <ContractSigningList adminView={true} />
    </main>
  );
}

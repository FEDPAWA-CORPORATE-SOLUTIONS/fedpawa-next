// ============================================================
// FEDPAWA — Page souscription conseil juridique et fiscal
// Route : /souscription/conseil-fiscal (FR et EN)
// ============================================================
import type { Metadata } from "next";
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/conseil-fiscal.json";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  title: { absolute: `Conseil Juridique et Fiscal — Souscription en Ligne | ${meta.siteName}` },
  description: "Souscrivez au conseil et suivi juridique et fiscal FEDPAWA : régime fiscal, chiffre d'affaires, représentant légal, coordonnées, formule et paiement.",
  alternates: {
    canonical: SITE_URL + "/souscription/conseil-fiscal",
    languages: {
      fr: SITE_URL + "/souscription/conseil-fiscal",
      en: SITE_URL + "/en/souscription/conseil-fiscal",
      "x-default": SITE_URL + "/souscription/conseil-fiscal",
    },
  },
};

export default function SouscriptionConseilFiscalPage() {
  return <GeneriqueFormulaire locale="fr" spec={spec as any} />;
}

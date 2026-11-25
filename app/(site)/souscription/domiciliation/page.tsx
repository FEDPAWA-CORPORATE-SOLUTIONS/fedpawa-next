// ============================================================
// FEDPAWA — Page souscription domiciliation
// Route : /souscription/domiciliation (FR et EN)
// ============================================================
import type { Metadata } from "next";
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/domiciliation.json";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  title: { absolute: `Domiciliation d'Entreprise — Souscription en Ligne | ${meta.siteName}` },
  description: "Souscrivez à la domiciliation d'entreprise FEDPAWA : 6 étapes (entreprise, représentant, contact, formule, documents KYC, facturation), packs nationaux et internationaux, paiement Mobile Money.",
  alternates: {
    canonical: SITE_URL + "/souscription/domiciliation",
    languages: {
      fr: SITE_URL + "/souscription/domiciliation",
      en: SITE_URL + "/en/souscription/domiciliation",
      "x-default": SITE_URL + "/souscription/domiciliation",
    },
  },
};

export default function SouscriptionDomiciliationPage() {
  return <GeneriqueFormulaire locale="fr" spec={spec as any} />;
}

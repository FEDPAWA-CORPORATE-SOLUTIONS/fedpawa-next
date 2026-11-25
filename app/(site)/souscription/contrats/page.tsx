// ============================================================
// FEDPAWA — Page souscription rédaction de contrats
// Route : /souscription/contrats (FR et EN)
// ============================================================
import type { Metadata } from "next";
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/contrats.json";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  title: { absolute: `Rédaction de Contrats — Souscription en Ligne | ${meta.siteName}` },
  description: "Souscrivez à la rédaction de contrats FEDPAWA : contrat commercial, travail, prestation, confidentialité, bail, distribution, franchise, sous-traitance.",
  alternates: {
    canonical: SITE_URL + "/souscription/contrats",
    languages: {
      fr: SITE_URL + "/souscription/contrats",
      en: SITE_URL + "/en/souscription/contrats",
      "x-default": SITE_URL + "/souscription/contrats",
    },
  },
};

export default function SouscriptionContratsPage() {
  return <GeneriqueFormulaire locale="fr" spec={spec as any} />;
}

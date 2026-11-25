// ============================================================
// FEDPAWA — Page souscription OAPI
// Route : /souscription/oapi (FR et EN)
// ============================================================
import type { Metadata } from "next";
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/oapi.json";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  title: { absolute: `Protection OAPI — Souscription en Ligne | ${meta.siteName}` },
  description: "Souscrivez à la protection OAPI FEDPAWA : marque, logo, logiciel, dessin et modèle, brevet, avec classe de Nice et documents KYC.",
  alternates: {
    canonical: SITE_URL + "/souscription/oapi",
    languages: {
      fr: SITE_URL + "/souscription/oapi",
      en: SITE_URL + "/en/souscription/oapi",
      "x-default": SITE_URL + "/souscription/oapi",
    },
  },
};

export default function SouscriptionOapiPage() {
  return <GeneriqueFormulaire locale="fr" spec={spec as any} />;
}

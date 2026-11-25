// ============================================================
// FEDPAWA — Page souscription création d'entreprise
// Route : /souscription/creation-entreprise (FR et EN)
// ============================================================
import type { Metadata } from "next";
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/creation-entreprise.json";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  title: { absolute: `Création d'Entreprise — Souscription en Ligne | ${meta.siteName}` },
  description: "Souscrivez à la création d'entreprise FEDPAWA : 6 étapes, de la situation de l'entreprise à la validation juridique, avec accompagnement par nos experts.",
  alternates: {
    canonical: SITE_URL + "/souscription/creation-entreprise",
    languages: {
      fr: SITE_URL + "/souscription/creation-entreprise",
      en: SITE_URL + "/en/souscription/creation-entreprise",
      "x-default": SITE_URL + "/souscription/creation-entreprise",
    },
  },
};

export default function SouscriptionCreationPage() {
  return <GeneriqueFormulaire locale="fr" spec={spec as any} />;
}

// ==========================================================
// FEDPAWA — Page de souscription Création d'Entreprise (FR)
// Route : /creation-entreprise/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionCreation from "@/components/souscription-creation-entreprise/SouscriptionCreation";

export const metadata: Metadata = {
  title: { absolute: "Création d'Entreprise — Souscription en Ligne | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Souscrivez en ligne à la création d'entreprise chez FEDPAWA. Constitution, transformation, restructuration et légalisation auprès des autorités camerounaises.",
  alternates: {
    canonical: "https://www.fedpawa.com/creation-entreprise/souscription",
    languages: {
      fr: "https://www.fedpawa.com/creation-entreprise/souscription",
      en: "https://www.fedpawa.com/en/creation-entreprise/souscription",
      "x-default": "https://www.fedpawa.com/creation-entreprise/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "Création d'Entreprise — Souscription en Ligne | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Souscrivez en ligne à la création d'entreprise chez FEDPAWA. Constitution, transformation, restructuration et légalisation auprès des autorités camerounaises.",
    url: "https://www.fedpawa.com/creation-entreprise/souscription",
    locale: "fr_FR",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionCreationPage() {
  return <SouscriptionCreation locale="fr" />;
}

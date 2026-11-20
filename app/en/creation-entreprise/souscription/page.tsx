// ==========================================================
// FEDPAWA — Page de souscription Création d'Entreprise (EN)
// Route : /en/creation-entreprise/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionCreation from "@/components/souscription-creation-entreprise/SouscriptionCreation";

export const metadata: Metadata = {
  title: { absolute: "Company Formation — Online Subscription | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Subscribe online for company formation at FEDPAWA. Incorporation, transformation, restructuring and legalization with Cameroonian authorities.",
  alternates: {
    canonical: "https://www.fedpawa.com/en/creation-entreprise/souscription",
    languages: {
      fr: "https://www.fedpawa.com/creation-entreprise/souscription",
      en: "https://www.fedpawa.com/en/creation-entreprise/souscription",
      "x-default": "https://www.fedpawa.com/en/creation-entreprise/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "Company Formation — Online Subscription | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Subscribe online for company formation at FEDPAWA. Incorporation, transformation, restructuring and legalization with Cameroonian authorities.",
    url: "https://www.fedpawa.com/en/creation-entreprise/souscription",
    locale: "en_US",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionCreationPageEn() {
  return <SouscriptionCreation locale="en" />;
}

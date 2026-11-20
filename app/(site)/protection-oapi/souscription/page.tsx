// ==========================================================
// FEDPAWA — Page de souscription Protection OAPI (FR)
// Route : /protection-oapi/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionOapi from "@/components/souscription-oapi/SouscriptionOapi";

export const metadata: Metadata = {
  title: { absolute: "Protection OAPI — Souscription | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Souscrivez en ligne à la protection de votre propriété intellectuelle auprès de l'OAPI. Marques, logos, logiciels et actifs tech.",
  alternates: {
    canonical: "https://www.fedpawa.com/protection-oapi/souscription",
    languages: {
      fr: "https://www.fedpawa.com/protection-oapi/souscription",
      en: "https://www.fedpawa.com/en/protection-oapi/souscription",
      "x-default": "https://www.fedpawa.com/protection-oapi/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "Protection OAPI — Souscription | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Souscrivez en ligne à la protection de votre propriété intellectuelle auprès de l'OAPI. Marques, logos, logiciels et actifs tech.",
    url: "https://www.fedpawa.com/protection-oapi/souscription",
    locale: "fr_FR",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionOapiPage() {
  return <SouscriptionOapi locale="fr" />;
}

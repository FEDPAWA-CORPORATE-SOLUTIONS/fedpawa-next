// ==========================================================
// FEDPAWA — Page de souscription Rédaction de Contrats (FR)
// Route : /redaction-contrats/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionContrats from "@/components/souscription-contrats/SouscriptionContrats";

export const metadata: Metadata = {
  title: { absolute: "Rédaction de Contrats — Souscription | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Souscrivez en ligne à la rédaction de contrats chez FEDPAWA. Contrats commerciaux, de travail, de prestation, de confidentialité, baux commerciaux, contrats de distribution, etc.",
  alternates: {
    canonical: "https://www.fedpawa.com/redaction-contrats/souscription",
    languages: {
      fr: "https://www.fedpawa.com/redaction-contrats/souscription",
      en: "https://www.fedpawa.com/en/redaction-contrats/souscription",
      "x-default": "https://www.fedpawa.com/redaction-contrats/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "Rédaction de Contrats — Souscription | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Souscrivez en ligne à la rédaction de contrats chez FEDPAWA. Contrats commerciaux, de travail, de prestation, de confidentialité, baux commerciaux, contrats de distribution, etc.",
    url: "https://www.fedpawa.com/redaction-contrats/souscription",
    locale: "fr_FR",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionContratsPage() {
  return <SouscriptionContrats locale="fr" />;
}

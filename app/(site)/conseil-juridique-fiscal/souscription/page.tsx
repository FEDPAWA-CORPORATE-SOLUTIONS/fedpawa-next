// ==========================================================
// FEDPAWA — Page de souscription Conseil et Suivi Juridique et Fiscal (FR)
// Route : /conseil-juridique-fiscal/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionConseilFiscal from "@/components/souscription-conseil-fiscal/SouscriptionConseilFiscal";

export const metadata: Metadata = {
  title: { absolute: "Conseil et Suivi Juridique et Fiscal — Souscription | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Souscrivez en ligne à notre service de conseil et suivi juridique et fiscal. Déclarations mensuelles, liasse fiscale, représentation administrative auprès de la DGI.",
  alternates: {
    canonical: "https://www.fedpawa.com/conseil-juridique-fiscal/souscription",
    languages: {
      fr: "https://www.fedpawa.com/conseil-juridique-fiscal/souscription",
      en: "https://www.fedpawa.com/en/conseil-juridique-fiscal/souscription",
      "x-default": "https://www.fedpawa.com/conseil-juridique-fiscal/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "Conseil et Suivi Juridique et Fiscal — Souscription | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Souscrivez en ligne à notre service de conseil et suivi juridique et fiscal. Déclarations mensuelles, liasse fiscale, représentation administrative auprès de la DGI.",
    url: "https://www.fedpawa.com/conseil-juridique-fiscal/souscription",
    locale: "fr_FR",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionConseilFiscalPage() {
  return <SouscriptionConseilFiscal locale="fr" />;
}

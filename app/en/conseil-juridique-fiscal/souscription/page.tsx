// ==========================================================
// FEDPAWA — Page de souscription Conseil et Suivi Juridique et Fiscal (EN)
// Route : /en/conseil-juridique-fiscal/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionConseilFiscal from "@/components/souscription-conseil-fiscal/SouscriptionConseilFiscal";

export const metadata: Metadata = {
  title: { absolute: "Legal & Tax Advisory — Online Subscription | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Subscribe online for our legal and tax advisory service. Monthly declarations, tax file, administrative representation with the DGI.",
  alternates: {
    canonical: "https://www.fedpawa.com/en/conseil-juridique-fiscal/souscription",
    languages: {
      fr: "https://www.fedpawa.com/conseil-juridique-fiscal/souscription",
      en: "https://www.fedpawa.com/en/conseil-juridique-fiscal/souscription",
      "x-default": "https://www.fedpawa.com/en/conseil-juridique-fiscal/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "Legal & Tax Advisory — Online Subscription | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Subscribe online for our legal and tax advisory service. Monthly declarations, tax file, administrative representation with the DGI.",
    url: "https://www.fedpawa.com/en/conseil-juridique-fiscal/souscription",
    locale: "en_US",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionConseilFiscalPageEn() {
  return <SouscriptionConseilFiscal locale="en" />;
}

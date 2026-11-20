// ==========================================================
// FEDPAWA — Page de souscription Rédaction de Contrats (EN)
// Route : /en/redaction-contrats/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionContrats from "@/components/souscription-contrats/SouscriptionContrats";

export const metadata: Metadata = {
  title: { absolute: "Contract Drafting — Online Subscription | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Subscribe online for contract drafting at FEDPAWA. Commercial contracts, employment contracts, service contracts, confidentiality agreements, commercial leases, distribution contracts, etc.",
  alternates: {
    canonical: "https://www.fedpawa.com/en/redaction-contrats/souscription",
    languages: {
      fr: "https://www.fedpawa.com/redaction-contrats/souscription",
      en: "https://www.fedpawa.com/en/redaction-contrats/souscription",
      "x-default": "https://www.fedpawa.com/en/redaction-contrats/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "Contract Drafting — Online Subscription | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Subscribe online for contract drafting at FEDPAWA. Commercial contracts, employment contracts, service contracts, confidentiality agreements, commercial leases, distribution contracts, etc.",
    url: "https://www.fedpawa.com/en/redaction-contrats/souscription",
    locale: "en_US",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionContratsPageEn() {
  return <SouscriptionContrats locale="en" />;
}

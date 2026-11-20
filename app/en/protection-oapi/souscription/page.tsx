// ==========================================================
// FEDPAWA — Page de souscription Protection OAPI (EN)
// Route : /en/protection-oapi/souscription
// ==========================================================

import type { Metadata } from "next";
import SouscriptionOapi from "@/components/souscription-oapi/SouscriptionOapi";

export const metadata: Metadata = {
  title: { absolute: "OAPI Protection — Online Subscription | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Subscribe online for OAPI intellectual property protection. Trademarks, logos, software and intellectual assets.",
  alternates: {
    canonical: "https://www.fedpawa.com/en/protection-oapi/souscription",
    languages: {
      fr: "https://www.fedpawa.com/protection-oapi/souscription",
      en: "https://www.fedpawa.com/en/protection-oapi/souscription",
      "x-default": "https://www.fedpawa.com/en/protection-oapi/souscription",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FEDPAWA CORPORATE SOLUTIONS",
    title: "OAPI Protection — Online Subscription | FEDPAWA CORPORATE SOLUTIONS",
    description:
      "Subscribe online for OAPI intellectual property protection. Trademarks, logos, software and intellectual assets.",
    url: "https://www.fedpawa.com/en/protection-oapi/souscription",
    locale: "en_US",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: "FEDPAWA CORPORATE SOLUTIONS" }],
  },
};

export default function SouscriptionOapiPageEn() {
  return <SouscriptionOapi locale="en" />;
}

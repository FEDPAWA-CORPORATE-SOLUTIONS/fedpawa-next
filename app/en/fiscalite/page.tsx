// Fiscalite EN — miroir de app/(site)/fiscalite/page.tsx.

import type { Metadata } from "next";
import Fiscalite from "@/components/fiscalite/Fiscalite";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Legal & Tax Advisory";
const description =
  "Legal and tax advisory and monitoring for companies in Cameroon. DGI e-filings, annual tax return (DSF), Tax Compliance Certificate (ACF) and administrative representation before the DGI.";

export const metadata: Metadata = {
  // Title déjà complet (suffixe marque inclus) — absolute évite la
  // duplication du template « %s | FEDPAWA CORPORATE SOLUTIONS ».
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/en/fiscalite",
    languages: {
      fr: SITE_URL + "/fiscalite",
      en: SITE_URL + "/en/fiscalite",
      "x-default": SITE_URL + "/fiscalite",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/en/fiscalite",
    locale: "en_US",
    alternateLocale: "fr_FR",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/images/og-cover.jpg"],
  },
};

export default function EnFiscalitePage() {
  return <Fiscalite locale="en" />;
}

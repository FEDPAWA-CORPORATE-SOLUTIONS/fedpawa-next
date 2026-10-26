// Fiscalite FR — conversion de fiscalite.php (vague B).

import type { Metadata } from "next";
import Fiscalite from "@/components/fiscalite/Fiscalite";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = 'FEDPAWA CORPORATE SOLUTIONS | Conseil Juridique & Fiscal';
const description = 'Conseil et suivi juridique et fiscal des entreprises au Cameroun : télé-déclarations DGI, liasse fiscale, optimisation et représentation.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/fiscalite",
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
    url: SITE_URL + "/fiscalite",
    locale: "fr_FR",
    alternateLocale: "en_US",
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

export default function FiscalitePage() {
  return <Fiscalite locale="fr" />;
}

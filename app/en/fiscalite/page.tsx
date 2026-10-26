// Fiscalite EN — miroir de app/(site)/fiscalite/page.tsx.

import type { Metadata } from "next";
import Fiscalite from "@/components/fiscalite/Fiscalite";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = 'FEDPAWA CORPORATE SOLUTIONS | Legal and Tax Advisory for Companies';
const description = 'Legal and tax advisory and monitoring for companies in Cameroon: DGI e-filings, tax returns, optimisation and representation.';

export const metadata: Metadata = {
  title,
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
};

export default function EnFiscalitePage() {
  return <Fiscalite locale="en" />;
}

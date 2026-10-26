// About Us EN — miroir de app/(site)/qui-sommes-nous/page.tsx.

import type { Metadata } from "next";
import About from "@/components/qui-sommes-nous/About";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title =
  "FEDPAWA CORPORATE SOLUTIONS | The Strategic Partner for Your Business";
const description =
  "Discover FEDPAWA Corporate Solutions, an expert firm in OHADA company formation, OAPI trademark filings and tax advisory in Cameroon.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/en/qui-sommes-nous",
    languages: {
      fr: SITE_URL + "/qui-sommes-nous",
      en: SITE_URL + "/en/qui-sommes-nous",
      "x-default": SITE_URL + "/qui-sommes-nous",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/en/qui-sommes-nous",
    locale: "en_US",
    alternateLocale: "fr_FR",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
};

export default function EnAboutPage() {
  return <About locale="en" />;
}

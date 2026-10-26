// Contrats EN — miroir de app/(site)/contrats/page.tsx.

import type { Metadata } from "next";
import Contrats from "@/components/contrats/Contrats";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Legal Contract Drafting";
const description =
  "Corporate, commercial, employment, service and confidentiality (NDA) contract drafting by FEDPAWA legal experts. From 100,000 FCFA.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/en/contrats",
    languages: {
      fr: SITE_URL + "/contrats",
      en: SITE_URL + "/en/contrats",
      "x-default": SITE_URL + "/contrats",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/en/contrats",
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

export default function EnContratsPage() {
  return <Contrats locale="en" />;
}

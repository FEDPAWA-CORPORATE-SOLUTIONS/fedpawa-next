// Domiciliation EN — miroir de app/(site)/domiciliation/page.tsx.

import type { Metadata } from "next";
import Domiciliation from "@/components/domiciliation/Domiciliation";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Business Domiciliation in Douala";
const description =
  "Business domiciliation in Douala Logpom: prestigious business address, mail handling, meeting rooms. From 35,000 FCFA/month.";

export const metadata: Metadata = {
  // Title déjà complet (suffixe marque inclus) — absolute évite la
  // duplication du template « %s | FEDPAWA CORPORATE SOLUTIONS ».
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/en/domiciliation",
    languages: {
      fr: SITE_URL + "/domiciliation",
      en: SITE_URL + "/en/domiciliation",
      "x-default": SITE_URL + "/domiciliation",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/en/domiciliation",
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

export default function EnDomiciliationPage() {
  return <Domiciliation locale="en" />;
}

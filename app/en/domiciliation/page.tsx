// Domiciliation EN — miroir de app/(site)/domiciliation/page.tsx.

import type { Metadata } from "next";
import Domiciliation from "@/components/domiciliation/Domiciliation";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title =
  "FEDPAWA CORPORATE SOLUTIONS | Domiciliation for Legal Entities & Companies";
const description =
  "First-class business address in Douala Logpom: prestigious registered office, mail handling, meeting rooms. From XAF 35,000/month excl. tax.";

export const metadata: Metadata = {
  title,
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

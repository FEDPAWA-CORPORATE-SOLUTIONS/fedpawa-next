// About Us EN — miroir de app/(site)/qui-sommes-nous/page.tsx.

import type { Metadata } from "next";
import About from "@/components/qui-sommes-nous/About";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | About Us";
const description =
  "About FEDPAWA CORPORATE SOLUTIONS - The strategic partner for your business in Cameroon: domiciliation, company formation, tax advisory, OAPI, contracts.";

export const metadata: Metadata = {
  // Title déjà complet (suffixe marque inclus) — absolute évite la
  // duplication du template « %s | FEDPAWA CORPORATE SOLUTIONS ».
  title: { absolute: title },
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
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/images/og-cover.jpg"],
  },
};

export default function EnAboutPage() {
  return <About locale="en" />;
}

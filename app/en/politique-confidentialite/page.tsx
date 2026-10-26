// Privacy en — conversion de politique-confidentialite.php (vague B).

import type { Metadata } from "next";
import Privacy from "@/components/politique-confidentialite/Privacy";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = 'FEDPAWA CORPORATE SOLUTIONS | Privacy Policy';
const description = 'How FEDPAWA collects, uses and protects your personal data: KYC, Mobile Money payments, scanned mail, cookies and your rights.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/en/politique-confidentialite",
    languages: {
      fr: SITE_URL + "/politique-confidentialite",
      en: SITE_URL + "/en/politique-confidentialite",
      "x-default": SITE_URL + "/politique-confidentialite",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/en/politique-confidentialite",
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

export default function EnPrivacyPage() {
  return <Privacy locale="en" />;
}

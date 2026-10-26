// Privacy fr — conversion de politique-confidentialite.php (vague B).

import type { Metadata } from "next";
import Privacy from "@/components/politique-confidentialite/Privacy";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = 'FEDPAWA CORPORATE SOLUTIONS | Politique de Confidentialité';
const description = 'Comment FEDPAWA collecte, utilise et protège vos données personnelles : KYC, paiements Mobile Money, courriers numérisés, cookies et vos droits.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/politique-confidentialite",
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
    url: SITE_URL + "/politique-confidentialite",
    locale: "fr_FR",
    alternateLocale: "en_US",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
};

export default function PrivacyPage() {
  return <Privacy locale="fr" />;
}

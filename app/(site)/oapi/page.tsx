// Oapi FR — conversion de oapi.php.

import type { Metadata } from "next";
import Oapi from "@/components/oapi/Oapi";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Marques & Propriété Intellectuelle (OAPI)";
const description =
  "Enregistrement de vos marques, logos, applications et logiciels auprès de l'OAPI. Protection de votre propriété intellectuelle en zone francophone.";

export const metadata: Metadata = {
  // Title déjà complet (suffixe marque inclus) — absolute évite la
  // duplication du template « %s | FEDPAWA CORPORATE SOLUTIONS ».
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/oapi",
    languages: {
      fr: SITE_URL + "/oapi",
      en: SITE_URL + "/en/oapi",
      "x-default": SITE_URL + "/oapi",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/oapi",
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

export default function OapiPage() {
  return <Oapi locale="fr" />;
}

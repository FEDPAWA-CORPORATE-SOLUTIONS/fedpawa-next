// Contrats FR — conversion de contrats.php.

import type { Metadata } from "next";
import Contrats from "@/components/contrats/Contrats";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Rédaction de Contrats Juridiques";
const description =
  "Rédaction de contrats sociaux, commerciaux, de travail, NDAs et conventionnels par des juristes FEDPAWA. Souscription en ligne dès 100 000 FCFA HT.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/contrats",
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
    url: SITE_URL + "/contrats",
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

export default function ContratsPage() {
  return <Contrats locale="fr" />;
}

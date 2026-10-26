// Domiciliation FR — conversion de domiciliation.php (vague B).

import type { Metadata } from "next";
import Domiciliation from "@/components/domiciliation/Domiciliation";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Domiciliation d'Entreprises à Douala";
const description = "Domiciliation d'entreprises à Douala Logpom : adresse commerciale prestigieuse, gestion du courrier, salles de réunion. Dès 35 000 FCFA/mois HT.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/domiciliation",
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
    url: SITE_URL + "/domiciliation",
    locale: "fr_FR",
    alternateLocale: "en_US",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
};

export default function DomiciliationPage() {
  return <Domiciliation locale="fr" />;
}

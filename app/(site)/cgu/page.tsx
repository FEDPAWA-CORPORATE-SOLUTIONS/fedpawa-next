// Cgu fr — conversion de cgu.php (vague B).

import type { Metadata } from "next";
import Cgu from "@/components/cgu/Cgu";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Conditions Générales d'Utilisation et de Vente";
const description = 'CGU/CGV FEDPAWA : comptes clients, souscriptions, paiements Mobile Money, engagements réciproques, résiliation et responsabilité.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/cgu",
    languages: {
      fr: SITE_URL + "/cgu",
      en: SITE_URL + "/en/cgu",
      "x-default": SITE_URL + "/cgu",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/cgu",
    locale: "fr_FR",
    alternateLocale: "en_US",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
};

export default function CguPage() {
  return <Cgu locale="fr" />;
}

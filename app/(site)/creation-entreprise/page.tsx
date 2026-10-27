// Creation fr — conversion de creation_entreprise.php (vague B).

import type { Metadata } from "next";
import Creation from "@/components/creation-entreprise/Creation";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Création, Restructuration et Légalisation d'Entreprises au Cameroun";
const description = "Constitution, transformation et immatriculation d'entreprises au Cameroun : statuts OHADA sur-mesure, circuit notarial, Greffe et CFCE, livraison du Kit Corporate complet.";

export const metadata: Metadata = {
  // Title déjà complet (suffixe marque inclus) — absolute évite la
  // duplication du template « %s | FEDPAWA CORPORATE SOLUTIONS ».
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/creation-entreprise",
    languages: {
      fr: SITE_URL + "/creation-entreprise",
      en: SITE_URL + "/en/creation-entreprise",
      "x-default": SITE_URL + "/creation-entreprise",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/creation-entreprise",
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

export default function CreationPage() {
  return <Creation locale="fr" />;
}

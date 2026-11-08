// Qui sommes-nous 2 (FR) — copie remaniée de la page Qui sommes-nous :
// galerie supprimée, images redistribées dans Nos Valeurs / Savoir-Faire /
// Notre Différence. L'original /qui-sommes-nous reste inchangé.

import type { Metadata } from "next";
import About2 from "@/components/qui-sommes-nous/About2";
import { getDictionary } from "@/lib/i18n";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Qui sommes-nous 2";
const description =
  "Découvrez FEDPAWA Corporate Solutions, cabinet expert en création d'entreprises OHADA, dépôt de marques OAPI et conseil fiscal au Cameroun.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "https://www.fedpawa.com/qui-sommes-nous-2",
    languages: {
      fr: "https://www.fedpawa.com/qui-sommes-nous-2",
      "x-default": "https://www.fedpawa.com/qui-sommes-nous-2",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: "https://www.fedpawa.com/qui-sommes-nous-2",
    locale: "fr_FR",
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

export default function About2Page() {
  return <About2 locale="fr" />;
}

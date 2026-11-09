// Qui sommes-nous 3 (FR) — version revue avec style moderne, design amélioré
// — garde l'original (/qui-sommes-nous) et la variante 2 (/qui-sommes-nous-2) inchangés.
// Nouveautés : grille hero responsive, sections image|côté avec cartes stylisées,
// meilleure typographie, couleurs améliorées, accessibilité renforcée,
// composants réutilisables About3.

import type { Metadata } from "next";
import About3 from "@/components/qui-sommes-nous/About3";
import { getDictionary } from "@/lib/i18n";

const { meta } = getDictionary("fr").shared;
const title = "FEDPAWA CORPORATE SOLUTIONS | Qui sommes-nous";
const description =
  "Découvrez FEDPAWA Corporate Solutions, cabinet expert en création d'entreprises OHADA, dépôt de marques OAPI et conseil fiscal au Cameroun.";

export const metadata: Metadata = {
  // Title déjà complet (suffixe marque inclus) — absolute évite la duplication du template « %s | FEDPAWA CORPORATE SOLUTIONS ».
  title: { absolute: title },
  description,
  alternates: {
    canonical: "https://www.fedpawa.com/qui-sommes-nous.php",
    languages: {
      fr: "https://www.fedpawa.com/qui-sommes-nous.php",
      en: "https://www.fedpawa.com/en/qui-sommes-nous.php",
      "x-default": "https://www.fedpawa.com/qui-sommes-nous.php",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: "https://www.fedpawa.com/qui-sommes-nous.php",
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

export default function About3Page() {
  return <About3 locale="fr" />;
}
// Nos Valeurs / Savoir-Faire / Différence — Design B : Moderne Décliné
import type { Metadata } from "next";
import AboutNos4 from "@/components/qui-sommes-nous/AboutNos4";
import { getDictionary } from "@/lib/i18n";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Notre Savoir-Faire et Nos Valeurs";
const description =
  "Découvrez le savoir-faire, les valeurs et ce qui fait la différence de FEDPAWA Corporate Solutions au Cameroun.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "https://www.fedpawa.com/nos-4",
    languages: {
      fr: "https://www.fedpawa.com/nos-4",
      "x-default": "https://www.fedpawa.com/nos-4",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: "https://www.fedpawa.com/nos-4",
    locale: "fr_FR",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/images/og-cover.jpg"] },
};

export default function Nos4Page() {
  return <AboutNos4 locale="fr" />;
}

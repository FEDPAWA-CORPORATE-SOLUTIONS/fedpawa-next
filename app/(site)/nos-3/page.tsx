// Nos Valeurs / Savoir-Faire / Différence — Design A : Vision Box Élégante
import type { Metadata } from "next";
import AboutNos3 from "@/components/qui-sommes-nous/AboutNos3";
import { getDictionary } from "@/lib/i18n";

const { meta } = getDictionary("fr").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Nos Valeurs — Savoir-Faire — Différence";
const description =
  "Découvrez les valeurs, le savoir-faire et la différence de FEDPAWA Corporate Solutions, cabinet expert en création d'entreprises OHADA et dépôt de marques OAPI au Cameroun.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "https://www.fedpawa.com/nos-3",
    languages: {
      fr: "https://www.fedpawa.com/nos-3",
      "x-default": "https://www.fedpawa.com/nos-3",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: "https://www.fedpawa.com/nos-3",
    locale: "fr_FR",
    images: [{ url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/images/og-cover.jpg"] },
};

export default function Nos3Page() {
  return <AboutNos3 locale="fr" />;
}

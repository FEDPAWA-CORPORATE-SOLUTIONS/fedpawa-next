// Creation en — conversion de creation_entreprise.php (vague B).

import type { Metadata } from "next";
import Creation from "@/components/creation-entreprise/Creation";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = "FEDPAWA CORPORATE SOLUTIONS | Company Formation in Cameroon";
const description =
  "Company formation, transformation, restructuring and legalization in Cameroon with OHADA compliance by experienced legal experts.";

export const metadata: Metadata = {
  // Title déjà complet (suffixe marque inclus) — absolute évite la
  // duplication du template « %s | FEDPAWA CORPORATE SOLUTIONS ».
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/en/creation-entreprise",
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
    url: SITE_URL + "/en/creation-entreprise",
    locale: "en_US",
    alternateLocale: "fr_FR",
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

export default function EnCreationPage() {
  return <Creation locale="en" />;
}

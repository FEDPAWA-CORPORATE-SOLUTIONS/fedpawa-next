// Cgu en — conversion de cgu.php (vague B).

import type { Metadata } from "next";
import Cgu from "@/components/cgu/Cgu";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = 'FEDPAWA CORPORATE SOLUTIONS | Terms of Service and Sale';
const description = 'FEDPAWA Terms of Service and Sale: client accounts, subscriptions, Mobile Money payments, mutual commitments, termination and liability.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/en/cgu",
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
    url: SITE_URL + "/en/cgu",
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

export default function EnCguPage() {
  return <Cgu locale="en" />;
}

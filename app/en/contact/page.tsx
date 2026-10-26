// Contact en — conversion de contact.php (vague B).

import type { Metadata } from "next";
import Contact from "@/components/contact/Contact";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = 'FEDPAWA CORPORATE SOLUTIONS | Contact — Douala, Cameroon';
const description = 'Get in touch with FEDPAWA: address, opening hours, phone, WhatsApp, email and online form. Reply within 24 hours.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/en/contact",
    languages: {
      fr: SITE_URL + "/contact",
      en: SITE_URL + "/en/contact",
      "x-default": SITE_URL + "/contact",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title,
    description,
    url: SITE_URL + "/en/contact",
    locale: "en_US",
    alternateLocale: "fr_FR",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
};

export default function EnContactPage() {
  return <Contact locale="en" />;
}

// Contact fr — conversion de contact.php (vague B).

import type { Metadata } from "next";
import Contact from "@/components/contact/Contact";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = 'FEDPAWA CORPORATE SOLUTIONS | Contact — Douala, Cameroun';
const description = 'Contactez FEDPAWA : adresse, horaires, téléphone, WhatsApp, email et formulaire en ligne. Réponse sous 24h.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/contact",
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
    url: SITE_URL + "/contact",
    locale: "fr_FR",
    alternateLocale: "en_US",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
};

export default function ContactPage() {
  return <Contact locale="fr" />;
}

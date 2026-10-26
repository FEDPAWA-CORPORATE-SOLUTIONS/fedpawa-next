// Accueil FR — conversion de index.php (vague B).
// JSON-LD LocalBusiness conservé (L016) : script inline du <main> source.

import type { Metadata } from "next";
import Home from "@/components/index/Home";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  title: meta.defaultTitle,
  description: meta.defaultDescription,
  alternates: {
    canonical: "/",
    languages: {
      fr: SITE_URL + "/",
      en: SITE_URL + "/en",
      "x-default": SITE_URL + "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title: meta.defaultTitle,
    description: meta.defaultDescription,
    url: SITE_URL + "/",
    locale: "fr_FR",
    alternateLocale: "en_US",
    images: [
      {
        url: "/assets/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: meta.siteName,
      },
    ],
  },
};

// JSON-LD LocalBusiness/ProfessionalService — repris tel quel du <main> source (L016).
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": SITE_URL + "/#localbusiness",
  name: "FEDPAWA CORPORATE SOLUTIONS SARL",
  description:
    "Centre de domiciliation et infrastructure d'affaires à Logpom, Douala : adresse commerciale, gestion de courrier, création d'entreprise, conseil fiscal, OAPI et contrats.",
  url: SITE_URL + "/",
  image: SITE_URL + "/assets/images/og-cover.jpg",
  logo: SITE_URL + "/assets/images/logo.jpg",
  telephone: "+2376961704802",
  email: "contact@fedpawa.com",
  priceRange: "FCFA 25,000 - FCFA 70,000",
  currenciesAccepted: "XAF",
  paymentAccepted: "Mobile Money, Cash, Bank Transfer",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Immeuble Pharmacie de Logpom",
    addressLocality: "Douala",
    addressRegion: "Littoral",
    addressCountry: "CM",
  },
  geo: { "@type": "GeoCoordinates", latitude: 4.0836, longitude: 9.737 },
  areaServed: [
    { "@type": "Country", name: "Cameroun" },
    { "@type": "City", name: "Douala" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  sameAs: ["https://wa.me/237691704802"],
  identifier: [
    { "@type": "PropertyValue", name: "RCCM", value: "CM-DLA-01-2026-B13-00767" },
    { "@type": "PropertyValue", name: "NIU", value: "M09261890362B" },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd),
        }}
      />
      <Home locale="fr" />
    </>
  );
}

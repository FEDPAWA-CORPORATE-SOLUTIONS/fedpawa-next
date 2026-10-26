// Layout racine FEDPAWA — squelette <head> repris du partial source
// (templates/partials/site-header.php) : fonts Google, icônes, meta/OG par
// défaut, JSON-LD Organization+WebSite. Header/Footer vivent dans les layouts
// de section (app/(site)/layout.tsx FR, app/en/layout.tsx EN) pour un chrome
// par locale. data-theme="navy" data-mode="dark" = valeurs source.

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: meta.defaultTitle,
    template: `%s | ${meta.siteName}`,
  },
  description: meta.defaultDescription,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/assets/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/assets/images/apple-touch-icon.png",
  },
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
    images: [
      {
        url: "/assets/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: meta.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.defaultTitle,
    description: meta.defaultDescription,
    images: ["/assets/images/og-cover.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15294D",
};

// JSON-LD global (L016) — repris tel quel du partial source.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "FEDPAWA CORPORATE SOLUTIONS",
      legalName: "FEDPAWA CORPORATE SOLUTIONS SARL",
      url: SITE_URL + "/",
      logo: SITE_URL + "/assets/images/logo.jpg",
      description:
        "Infrastructure d'affaires et hub opérationnel à Douala, Logpom (Cameroun) : domiciliation d'entreprises, création d'entreprise, conseil fiscal, protection OAPI et rédaction de contrats.",
      email: "contact@fedpawa.com",
      telephone: "+237691704802",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Immeuble Pharmacie de Logpom",
        addressLocality: "Douala",
        addressRegion: "Littoral",
        postalCode: "",
        addressCountry: "CM",
      },
      openingHoursSpecification: [
        ["Monday", "08:00", "18:00"],
        ["Tuesday", "08:00", "18:00"],
        ["Wednesday", "08:00", "18:00"],
        ["Thursday", "08:00", "18:00"],
        ["Friday", "08:00", "18:00"],
        ["Saturday", "09:00", "14:00"],
      ].map(([day, opens, closes]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day,
        opens,
        closes,
      })),
      sameAs: ["https://wa.me/237691704802"],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL + "/",
      name: "FEDPAWA CORPORATE SOLUTIONS",
      inLanguage: "fr",
      publisher: { "@id": SITE_URL + "/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: SITE_URL + "/index.php?s={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="fr" data-theme="navy" data-mode="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

// Layout section publique EN (miroir /en) — Header + <main> + Footer, locale EN.
// Structure miroir de app/(site)/ — les vagues B/C/D y créent les mêmes routes.

import type { Metadata } from "next";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

export const metadata: Metadata = {
  title: {
    default: meta.defaultTitle,
    template: `%s | ${meta.siteName}`,
  },
  description: meta.defaultDescription,
  alternates: {
    canonical: "/en",
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
    url: SITE_URL + "/en",
    locale: "en_US",
    alternateLocale: "fr_FR",
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

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      <main>{children}</main>
      <Footer locale="en" />
    </>
  );
}

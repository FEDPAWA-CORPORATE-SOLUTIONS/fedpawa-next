// Notifications EN — miroir /en/notifications (page espace client).

import type { Metadata } from "next";
import NotificationsList from "@/components/notifications/NotificationsList";
import { getDictionary, getPageDictionary } from "@/lib/i18n";

const t = getPageDictionary("en", "notifications");
const { meta } = getDictionary("en").shared;

export const metadata: Metadata = {
  title: { absolute: `FEDPAWA CORPORATE SOLUTIONS | ${t.title}` },
  description: t.metaDescription,
  alternates: {
    canonical: "https://www.fedpawa.com/en/notifications",
    languages: {
      fr: "https://www.fedpawa.com/notifications",
      en: "https://www.fedpawa.com/en/notifications",
      "x-default": "https://www.fedpawa.com/notifications",
    },
  },
  openGraph: {
    type: "website",
    siteName: meta.siteName,
    title: t.title,
    description: t.metaDescription,
    url: "https://www.fedpawa.com/en/notifications",
    locale: "en_US",
    alternateLocale: "fr_FR",
    images: [
      { url: "/assets/images/og-cover.jpg", width: 1200, height: 630, alt: meta.siteName },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: t.title,
    description: t.metaDescription,
    images: ["/assets/images/og-cover.jpg"],
  },
};

export default function NotificationsPageEn() {
  return <NotificationsList locale="en" />;
}

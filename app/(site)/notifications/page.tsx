// Notifications FR — page espace client : historique des événements
// notifiés (table notification_events — les événements qui déclenchent
// un e-mail). Client component : Bearer requis.

import type { Metadata } from "next";
import NotificationsList from "@/components/notifications/NotificationsList";
import { getDictionary, getPageDictionary } from "@/lib/i18n";

const t = getPageDictionary("fr", "notifications");
const { meta } = getDictionary("fr").shared;

export const metadata: Metadata = {
  title: { absolute: `FEDPAWA CORPORATE SOLUTIONS | ${t.title}` },
  description: t.metaDescription,
  alternates: {
    canonical: "https://www.fedpawa.com/notifications",
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
    url: "https://www.fedpawa.com/notifications",
    locale: "fr_FR",
    alternateLocale: "en_US",
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

export default function NotificationsPage() {
  return <NotificationsList locale="fr" />;
}

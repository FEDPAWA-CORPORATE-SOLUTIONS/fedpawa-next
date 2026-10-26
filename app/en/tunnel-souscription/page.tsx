// Tunnel souscription en — conversion de tunnel_souscription.php (vague C).

import type { Metadata } from "next";
import Tunnel from "@/components/tunnel-souscription/Tunnel";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = 'Subscription Tunnel | FEDPAWA CORPORATE SOLUTIONS';
const description = 'Subscribe to FEDPAWA services: company formation, tax, OAPI, contracts, debt collection. 4 steps: project, options, KYC documents, Mobile Money payment.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/en/tunnel-souscription",
    languages: {
      fr: SITE_URL + "/tunnel-souscription",
      en: SITE_URL + "/en/tunnel-souscription",
      "x-default": SITE_URL + "/tunnel-souscription",
    },
  },
};

export default function EnTunnelPage() {
  return <Tunnel locale="en" />;
}

// Tunnel souscription en — conversion de tunnel_souscription.php (vague C).
// Routing ?service=&pack= côté client (comportement tunnel.js source) :
// la page reste statique, le panier s'initialise à l'hydratation.

import type { Metadata } from "next";
import TunnelGuarded from "@/components/tunnel-souscription/Guarded";
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
  // Audit #2 : garde data-auth="user" (client-side, parité source).
  return <TunnelGuarded locale="en" />;
}

// Tunnel souscription fr — conversion de tunnel_souscription.php (vague C).

import type { Metadata } from "next";
import Tunnel from "@/components/tunnel-souscription/Tunnel";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("fr").shared;

const title = 'Tunnel de Souscription | FEDPAWA CORPORATE SOLUTIONS';
const description = "Souscrivez à vos services FEDPAWA : création d'entreprise, fiscalité, OAPI, contrats, recouvrement. 4 étapes : projet, options, pièces KYC, paiement Mobile Money.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/tunnel-souscription",
    languages: {
      fr: SITE_URL + "/tunnel-souscription",
      en: SITE_URL + "/en/tunnel-souscription",
      "x-default": SITE_URL + "/tunnel-souscription",
    },
  },
};

export default function TunnelPage() {
  return <Tunnel locale="fr" />;
}

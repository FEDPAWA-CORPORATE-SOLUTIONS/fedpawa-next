// Souscription domiciliation en — conversion de souscription_domiciliation.php (vague C).

import type { Metadata } from "next";
import Souscription from "@/components/souscription-domiciliation/Souscription";
import { getDictionary } from "@/lib/i18n";
import { SITE_URL } from "@/lib/routes";

const { meta } = getDictionary("en").shared;

const title = 'Domiciliation Subscription | FEDPAWA CORPORATE SOLUTIONS';
const description = 'Subscribe to FEDPAWA business domiciliation: 6 steps (company, representative, contact, plan, KYC documents, invoicing), national and international plans, Mobile Money payment.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/en/souscription-domiciliation",
    languages: {
      fr: SITE_URL + "/souscription-domiciliation",
      en: SITE_URL + "/en/souscription-domiciliation",
      "x-default": SITE_URL + "/souscription-domiciliation",
    },
  },
};

export default function EnSouscriptionPage() {
  return <Souscription locale="en" />;
}

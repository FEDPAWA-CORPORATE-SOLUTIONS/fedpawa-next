// ============================================================
// FEDPAWA — Page signature → paiement
// Route : /souscription/signature-paiement (FR et EN)
// Redirection cible après le formulaire générique (étape 5)
// ============================================================
import type { Metadata } from "next";
import SouscriptionNouveauFlux from "@/components/souscription-domiciliation/SouscriptionNouveauFlux";
import { SITE_URL } from "@/lib/routes";

export const metadata: Metadata = {
  title: { absolute: `Signature et Paiement — Domiciliation | FEDPAWA` },
  description: "Signez votre contrat de domiciliation et procédez au paiement Mobile Money. Suite de la souscription en ligne.",
  alternates: {
    canonical: SITE_URL + "/souscription/signature-paiement",
    languages: {
      fr: SITE_URL + "/souscription/signature-paiement",
      en: SITE_URL + "/en/souscription/signature-paiement",
      "x-default": SITE_URL + "/souscription/signature-paiement",
    },
  },
};

export default function SignaturePaiementPage() {
  return <SouscriptionNouveauFlux locale="fr" />;
}

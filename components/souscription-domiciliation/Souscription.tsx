"use client";

// ==========================================================
// FEDPAWA — Souscription Domiciliation : redirection vers le nouveau flux
// Unifié avec SouscriptionNouveauFlux (Signature → Paiement)
// L'ancien wizard 6 étapes (Paiement → Signature) est déprécié.
// Toutes les routes de domiciliation pointent maintenant vers ce composant,
// qui délègue entièrement au nouveau flux unifié.
// ==========================================================

import SouscriptionNouveauFlux from "./SouscriptionNouveauFlux";
import type { Locale } from "@/lib/i18n";

export interface SouscriptionProps {
  locale?: Locale;
}

export default function Souscription({ locale }: SouscriptionProps) {
  return <SouscriptionNouveauFlux locale={locale} />;
}

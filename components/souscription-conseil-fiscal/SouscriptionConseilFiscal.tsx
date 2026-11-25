"use client";

/**
 * ============================================================
 * FEDPAWA — Souscription Conseil et Suivi Juridique et Fiscal
 * Maintenant piloté par le composant GeneriqueFormulaire + spec JSON.
 * ============================================================ */
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/conseil-fiscal.json";
import { type Locale } from "@/lib/i18n";

export default function SouscriptionConseilFiscal({ locale = "fr" as Locale }: { locale?: Locale }) {
  return <GeneriqueFormulaire locale={locale} spec={spec as any} />;
}

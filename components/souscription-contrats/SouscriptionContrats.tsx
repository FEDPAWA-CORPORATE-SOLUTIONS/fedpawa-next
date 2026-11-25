"use client";

/**
 * ============================================================
 * FEDPAWA — Souscription Rédaction de Contrats
 * Maintenant piloté par le composant GeneriqueFormulaire + spec JSON.
 * ============================================================ */
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/contrats.json";
import { type Locale } from "@/lib/i18n";

export default function SouscriptionContrats({ locale = "fr" as Locale }: { locale?: Locale }) {
  return <GeneriqueFormulaire locale={locale} spec={spec as any} />;
}

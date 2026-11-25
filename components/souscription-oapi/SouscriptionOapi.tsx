"use client";

/**
 * ============================================================
 * FEDPAWA — Souscription Protection OAPI
 * Maintenant piloté par le composant GeneriqueFormulaire + spec JSON.
 * ============================================================ */
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/oapi.json";
import { type Locale } from "@/lib/i18n";

export default function SouscriptionOapi({ locale = "fr" as Locale }: { locale?: Locale }) {
  return <GeneriqueFormulaire locale={locale} spec={spec as any} />;
}

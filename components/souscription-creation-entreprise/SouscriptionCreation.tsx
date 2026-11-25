"use client";

/**
 * ============================================================
 * FEDPAWA — Souscription Création d'Entreprise
 * Maintenant piloté par le composant GeneriqueFormulaire + spec JSON.
 * Le code métier spécifique a été déplacé vers specs/creation-entreprise.json.
 * ============================================================ */
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/creation-entreprise.json";
import { type Locale } from "@/lib/i18n";

export default function SouscriptionCreation({ locale = "fr" as Locale }: { locale?: Locale }) {
  return <GeneriqueFormulaire locale={locale} spec={spec as any} />;
}

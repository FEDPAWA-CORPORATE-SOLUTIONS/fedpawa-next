// ==========================================================
// FEDPAWA — Espace Client gardé (vague D)
// Garde client (parité auth-guard.js data-auth="client") dans un
// client component : admin → dashboard admin, anonyme → auth.
// Rendu vide pendant la vérification (la page source ne s'affiche
// qu'après le feu vert du garde).
// ==========================================================

"use client";

import EspaceClient from "@/components/espace-client/Component";
import { useAuthGuard } from "@/components/dashboard/useAuthGuard";
import type { Locale } from "@/lib/i18n";

export default function EspaceClientGuarded({ locale }: { locale: Locale }) {
  const guard = useAuthGuard("client", locale);

  if (guard.status === "checking" || guard.status === "denied") {
    return null;
  }

  return <EspaceClient locale={locale} />;
}

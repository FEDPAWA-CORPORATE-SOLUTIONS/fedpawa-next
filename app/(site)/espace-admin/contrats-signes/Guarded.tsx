// ==========================================================
// FEDPAWA — Admin garde : contrats signés
// ==========================================================

"use client";

import { useAuthGuard } from "@/components/dashboard/useAuthGuard";
import type { Locale } from "@/lib/i18n";

export default function AdminContratsSignesGuarded({ locale }: { locale: Locale }) {
  const guard = useAuthGuard("admin", locale);

  if (guard.status === "checking" || guard.status === "denied") {
    return null;
  }

  return null; // Le composant enfant est rendu par la page via le garde parent
}

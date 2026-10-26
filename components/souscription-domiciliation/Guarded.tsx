// ==========================================================
// FEDPAWA — Souscription gardée (audit #2 : data-auth="user"
// source souscription_domiciliation.php). Garde client-side :
// anonyme → /authentification?next=…, connecté → souscription.
// Prérendu statique intact (JS redirect, parité auth-guard.js).
// ==========================================================

"use client";

import Souscription from "@/components/souscription-domiciliation/Souscription";
import { useUserPageGuard } from "@/components/dashboard/useUserPageGuard";
import type { Locale } from "@/lib/i18n";

export default function SouscriptionGuarded({ locale }: { locale: Locale }) {
  const status = useUserPageGuard(locale);

  if (status !== "allowed") return null;

  return <Souscription locale={locale} />;
}

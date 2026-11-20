// ==========================================================
// FEDPAWA — Tunnel gardé (audit #2 : data-auth="user" source)
// Garde client-side (parité auth-guard.js) : anonyme →
// /authentification?next=…, connecté (client OU admin) → tunnel.
// Le prérendu statique reste intact : la page est rendue puis
// l'expulsion se fait au navigateur (JS redirect), jamais en SSR.
// ==========================================================

"use client";

import { Suspense } from "react";
import Abonnement from "./Abonnement";
import VerificationGateModal from "@/components/verification/VerificationGateModal";
import { useUserPageGuard } from "@/components/dashboard/useUserPageGuard";
import type { Locale } from "@/lib/i18n";

export default function TunnelGuarded({ locale, service, pack }) {
  const status = useUserPageGuard(locale);

  if (status !== "allowed") {
    return (
      <div className="container px-4 py-20 text-center">
        <div className="alert alert-warning" role="alert">
          <h3>Accès requis</h3>
          <p>Vous devez être connecté pour accéder au formulaire de souscription.</p>
          <p>Veuillez vous <a href="/authentification">connecter</a> ou <a href="/authentification?action=register">créer un compte</a> pour continuer.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <>
        <Abonnement locale={locale} service={service} pack={pack} />
        <VerificationGateModal locale={locale} />
      </>
    </Suspense>
  );
}
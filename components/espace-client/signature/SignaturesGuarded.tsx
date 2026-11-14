// ==========================================================
// FEDPAWA — Espace client : liste des contrats de signature.
// Garde client dans un CLIENT component (pattern Guarded.tsx) :
// la page server ne peut pas appeler useAuthGuard.
// ==========================================================

"use client";

import Link from "next/link";
import { useAuthGuard } from "@/components/dashboard/useAuthGuard";
import ContractSigningList from "@/components/espace-client/signature/ContractSigningList";
import type { Locale } from "@/lib/i18n";

export default function SignaturesGuarded({ locale = "fr" }: { locale?: Locale }) {
  const guard = useAuthGuard("client", locale);

  if (guard.status === "checking" || guard.status === "denied") {
    return null;
  }

  return (
    <main className="db-main sig-main">
      <div className="db-welcome">
        <div>
          <h1>Contrats électroniques</h1>
          <p>
            Consultez et téléchargez vos contrats signés électroniquement.
          </p>
        </div>
        <Link
          href="/contrat-a-signer"
          className="btn btn-primary"
        >
          Envoyer un nouveau contrat à signer
        </Link>
        <Link
          href="/espace-client/signature"
          className="btn btn-outline"
        >
          Voir les dossiers de signature
        </Link>
      </div>

      <ContractSigningList adminView={false} />
    </main>
  );
}

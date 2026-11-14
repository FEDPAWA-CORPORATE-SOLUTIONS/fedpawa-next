// ==========================================================
// FEDPAWA — Espace client : liste des contrats de signature
// (route /espace-client/signatures). Wrapper server + garde
// client (useAuthGuard) — pattern Guarded.tsx.
// ==========================================================

import type { Metadata } from "next";
import SignaturesGuarded from "@/components/espace-client/signature/SignaturesGuarded";

export const metadata: Metadata = {
  title: { absolute: "Contrats électroniques | FEDPAWA CORPORATE SOLUTIONS" },
  description:
    "Consultez et téléchargez vos contrats signés électroniquement depuis votre espace client FEDPAWA.",
  robots: { index: false, follow: false },
};

export default function SignaturesPage() {
  return <SignaturesGuarded locale="fr" />;
}

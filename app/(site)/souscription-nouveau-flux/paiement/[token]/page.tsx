// ============================================================================
// FEDPAWA — Page intermédiaire de lien de paiement (anti-prefetch)
// Route : /souscription/paiement/[token]
// GET : affiche une page intermédiaire légère sans consommer le jeton
// POST : consomme le jeton et redirige vers le paiement
// ============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface PaymentLinkPageProps {
  params: { token: string };
}

export const generateStaticParams = () => [];

export default function PaymentLinkPage({ params }: PaymentLinkPageProps) {
  const { token } = params;

  // Le formulaire POST consomme le jeton via l'API de consommation
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", minHeight: "80vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "#fef3c7",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={32}
            height={32}
            fill="none"
            stroke="#b45309"
            strokeWidth="2.5"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Paiement sécurisé</h1>
        <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.5 }}>
          Ce lien de paiement est à usage unique et expire dans 30 minutes.
          Cliquez sur le bouton ci-dessous pour poursuivre le paiement.
        </p>
        <form
          action="/api/v1/souscription/payment-link/consume"
          method="POST"
          style={{ display: "inline-block" }}
        >
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            style={{
              background: "#15294D",
              color: "#fff",
              border: "none",
              padding: "12px 32px",
              borderRadius: 8,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Continuer vers le paiement sécurisé
          </button>
        </form>
        <p style={{ marginTop: "20px", fontSize: "0.85rem", color: "#9ca3af" }}>
          Si vous n'êtes pas à l'origine de cette demande, ignorez ce message. Ce
          lien ne peut être utilisé qu'une seule fois.
        </p>
      </div>
    </div>
  );
}

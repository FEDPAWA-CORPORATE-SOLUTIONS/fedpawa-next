// ============================================================================
// FEDPAWA — Page intermédiaire de lien de signature (anti-prefetch)
// Route : /souscription/signature/[token]
// GET : affiche une page intermédiaire légère sans consommer le jeton
// POST : consomme le jeton et redirige vers la signature OpenSign
// ============================================================================

interface SignatureLinkPageProps {
  params: { token: string };
}

export const generateStaticParams = () => [];

export default function SignatureLinkPage({ params }: SignatureLinkPageProps) {
  const { token } = params;

  return (
    <div style={{ textAlign: "center", padding: "60px 20px", minHeight: "80vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "#dbeafe",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={32}
            height={32}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
          >
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Signature électronique</h1>
        <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.5 }}>
          Ce lien de signature est à usage unique et expire dans 30 minutes.
          Cliquez sur le bouton ci-dessous pour accéder à la zone de signature.
        </p>
        <form
          action="/api/v1/souscription/signature-link/consume"
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
            Continuer vers la signature
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

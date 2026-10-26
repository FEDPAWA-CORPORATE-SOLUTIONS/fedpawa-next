import type { NextConfig } from "next";

// ============================================================
// Sécurité (audit FIX-SECURITY) : CSP stricte + entêtes de
// défense sur toutes les réponses.
//
// CSP — 'unsafe-inline' en script-src EST requis : le site rend
// des <script type="application/ld+json"> inline (JSON-LD dans
// app/(site)/layout.tsx, app/en/layout.tsx, app/(site)/page.tsx)
// — vérifié, pas d'externalisation possible. style-src 'unsafe-
// inline' requis aussi (styles inline React + skin TinyMCE).
// TinyMCE charge depuis le CDN officiel cdn.tiny.cloud (L012).
// ============================================================

const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // JSON-LD inline (+ 'unsafe-eval' en dev pour HMR uniquement).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.tiny.cloud`,
  // Fonts Google + skin oxide TinyMCE + styles inline React.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tiny.cloud",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.tiny.cloud",
  // data: images (SVG inline) + blob: (uploads/aperçus).
  "img-src 'self' data: blob:",
  // Prod : API same-origin derrière le reverse proxy.
  // Dev : API Laravel sur http://localhost:8000 (NEXT_PUBLIC_API_URL).
  `connect-src 'self'${isDev ? " http://localhost:8000" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // 404 globale brandée — nécessaire avec les layouts racines
  // multiples FR/EN (cf. doc file-conventions/not-found).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Prod servira le domaine en HTTPS.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

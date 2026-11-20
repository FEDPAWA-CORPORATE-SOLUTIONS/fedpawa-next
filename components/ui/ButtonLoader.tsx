"use client";

// ============================================================
// FEDPAWA — ButtonLoader
// Petit cercle spinner (thème bleu nuit #15294D + doré #D4AF37)
// à afficher sur un bouton pendant une action asynchrone
// (sans changement de page). Le contenu du bouton passe en
// opacité réduite pendant le chargement.
// ============================================================

import React from "react";

interface ButtonLoaderProps {
  /** Quand true, affiche le spinner et réduit l'opacité du contenu */
  isLoading: boolean;
  /** Contenu du bouton (texte, icône, etc.) */
  children: React.ReactNode;
  /** Taille du spinner (px). Défaut: 16 */
  size?: number;
  /** Largeur du bord du spinner (px). Défaut: 2.5 */
  strokeWidth?: number;
  /** Délai avant affichage (ms) pour éviter le clignotement sur actions rapides. Défaut: 200 */
  delayMs?: number;
}

export default function ButtonLoader({
  isLoading,
  children,
  size = 16,
  strokeWidth = 2.5,
  delayMs = 200,
}: ButtonLoaderProps) {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => setVisible(true), delayMs);
    } else {
      setVisible(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, delayMs]);

  if (!visible) {
    return <>{children}</>;
  }

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "48px",
        minHeight: "48px",
      }}
    >
      {/* Contenu du bouton en arrière-plan, opacité réduite */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.45,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </span>

      {/* Petit cercle spinner au centre */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: "#d4af37",
            animation: `buttonLoaderSpin 0.8s linear infinite`,
          }}
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
    </span>
  );
}

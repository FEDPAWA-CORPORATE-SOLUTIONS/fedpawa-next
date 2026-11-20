"use client";

// ============================================================
// FEDPAWA — PageLoader
// Overlay plein écran qui recouvre la page pendant une requête.
// - Source de vérité unique : isLoading du contexte global.
// - Délai d'affichage court (300 ms) pour éviter le clignotement
//   sur les requêtes très rapides.
// - Disparaît dès que la requête est terminée (succès ou échec).
// - Timeout de sécurité (maxDuration) pour forcer l'arrêt.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useGlobalLoader, maxDuration } from "./GlobalLoaderContext";

export default function PageLoader() {
  const { isLoading } = useGlobalLoader();

  const displayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);

  // Nettoyage des timers au démontage
  useEffect(() => {
    return () => {
      if (displayRef.current) clearTimeout(displayRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  // Afficher après un délai pour éviter le clignotement.
  // Cacher immédiatement dès que la requête est terminée.
  useEffect(() => {
    if (isLoading && !visible) {
      displayRef.current = setTimeout(() => setVisible(true), 300);
    }

    if (!isLoading && visible) {
      setVisible(false);
    }

    return () => {
      if (displayRef.current) clearTimeout(displayRef.current);
    };
  }, [isLoading, visible]);

  // Sécurité : forcer l'arrêt après maxDuration si le loader reste bloqué.
  useEffect(() => {
    if (visible) {
      safetyRef.current = setTimeout(() => setVisible(false), maxDuration);
    } else {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    }
    return () => {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      id="page-loader"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background:
          "color-mix(in srgb, var(--color-surface-dark, #0A1424) 85%, transparent)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          border: "4px solid rgba(212, 175, 55, 0.15)",
          borderTop: "4px solid #d4af37",
          borderRadius: "50%",
          animation: "pageSkeletonSpin 1.2s linear infinite",
        }}
      />
      <p
        style={{
          marginTop: "16px",
          color: "#d4af37",
          fontSize: "0.9rem",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Chargement…
      </p>
    </div>
  );
}

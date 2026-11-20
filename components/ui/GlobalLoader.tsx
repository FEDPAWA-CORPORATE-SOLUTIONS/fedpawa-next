"use client";

// ============================================================
// FEDPAWA — Loader global plein écran
// Thème : bleu nuit (#15294D) + accents dorés (#D4AF37)
// Apparaît par-dessus toute la page pendant une requête API
// ou une transition.
// ============================================================

import { useContext } from "react";
import { GlobalLoadingContext } from "./GlobalLoaderContext";

const SPINNER_SVG = (
  <svg
    viewBox="0 0 50 50"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    className="animate-spin"
  >
    <circle cx="25" cy="25" r="20" />
  </svg>
);

export default function GlobalLoader({
  message = "Chargement…",
}: {
  message?: string;
}) {
  const ctx = useContext(GlobalLoadingContext);
  const isLoading = ctx?.isLoading ?? false;

  if (!isLoading) return null;

  return (
    <div
      className="global-loader-overlay"
      role="status"
      aria-live="polite"
      aria-modal="true"
    >
      <div className="global-loader-card">
        <div className="global-loader-spinner">{SPINNER_SVG}</div>
        <p className="global-loader-message">{message}</p>
      </div>
    </div>
  );
}

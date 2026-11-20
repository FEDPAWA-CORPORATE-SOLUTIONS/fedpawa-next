"use client";

// ============================================================
// FEDPAWA — PageSkeletonLoader
// Affiche un circle spinner (thème bleu nuit #15294D + doré #D4AF37)
// à la place du contenu pendant 1,5s au chargement de chaque page,
// entre le header et le footer.
// Inspiré de react-spinners CircleLoader.
// ============================================================

import { useEffect, useState } from "react";

export default function PageSkeletonLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div
        className="page-skeleton"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          width: "100%",
          paddingTop: "80px",
        }}
      >
        <div
          className="page-skeleton-spinner"
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
          className="page-skeleton-msg"
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

  return <>{children}</>;
}

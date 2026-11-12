// ============================================================
// FEDPAWA — Composant ActiveSectionAboutVisionVariants
// Variations du style "about-vision-box" (fond bleu #1A237E,
// bordure gauche or, texte blanc, padding 40px).
// Chaque variante modifie UN détail du style original.
// ==========================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Locale } from "@/lib/i18n";

export interface VisionBoxItem {
  img: string;
  title: string;
  text: string;
}

interface ActiveSectionAboutVisionVariantsProps {
  locale: Locale;
  sectionTitle: string;
  items: VisionBoxItem[];
  visionVariant: 1 | 2 | 3 | 4 | 5 | 6;
}

// ============================================================
// STYLES DE CHAQUE VARIANTE (basés sur about-vision-box)
// Original : background #1A237E, color #fff, padding 40px,
//            border-left 5px or, shadow, justify-content flex-start
// ============================================================

function getBoxStyle(variant: 1 | 2 | 3 | 4 | 5 | 6, isActive: boolean) {
  const base = {
    padding: "40px",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start" as const,
    transition: "all 0.3s ease",
    cursor: "pointer",
  } as React.CSSProperties;

  switch (variant) {
    case 1: // Original : bleu, bordure gauche or, shadow
      return {
        ...base,
        backgroundColor: "#1A237E",
        color: "#fff",
        borderLeft: "5px solid #d4af37",
        boxShadow: isActive ? "0 15px 40px rgba(26, 35, 126, 0.35)" : "0 10px 30px rgba(26, 35, 126, 0.2)",
        borderRadius: 0,
      };
    case 2: // Bordure complète (tout autour) au lieu de gauche seulement
      return {
        ...base,
        backgroundColor: "#1A237E",
        color: "#fff",
        border: "3px solid #d4af37",
        boxShadow: isActive ? "0 15px 40px rgba(26, 35, 126, 0.35)" : "0 10px 30px rgba(26, 35, 126, 0.2)",
        borderRadius: 0,
      };
    case 3: // Inversé : fond blanc, texte noir, bordure gauche or, pas de shadow
      return {
        ...base,
        backgroundColor: "#ffffff",
        color: "#111827",
        borderLeft: "5px solid #d4af37",
        boxShadow: "none",
        borderRadius: 0,
      };
    case 4: // Bordure bas uniquement, bleu, shadow
      return {
        ...base,
        backgroundColor: "#1A237E",
        color: "#fff",
        borderBottom: "5px solid #d4af37",
        boxShadow: isActive ? "0 15px 40px rgba(26, 35, 126, 0.35)" : "0 10px 30px rgba(26, 35, 126, 0.2)",
        borderRadius: 0,
      };
    case 5: // Pas de bordure, bleu, shadow uniquement, padding réduit
      return {
        ...base,
        backgroundColor: "#1A237E",
        color: "#fff",
        border: "none",
        boxShadow: isActive ? "0 15px 40px rgba(26, 35, 126, 0.35)" : "0 10px 30px rgba(26, 35, 126, 0.2)",
        padding: "25px",
        borderRadius: 12,
      };
    case 6: // Double bordure (gauche + bas), bleu, padding réduit
      return {
        ...base,
        backgroundColor: "#1A237E",
        color: "#fff",
        borderLeft: "5px solid #d4af37",
        borderBottom: "5px solid #d4af37",
        boxShadow: isActive ? "0 15px 40px rgba(26, 35, 126, 0.35)" : "0 10px 30px rgba(26, 35, 126, 0.2)",
        padding: "30px",
        borderRadius: 0,
      };
    default:
      return base;
  }
}

export default function ActiveSectionAboutVisionVariants({
  locale,
  sectionTitle,
  items,
  visionVariant,
}: ActiveSectionAboutVisionVariantsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelRef = useRef<number>(0);
  const item = items[activeIndex];

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelRef.current < 750) return; // ralenti par 3
      wheelRef.current = now;
      if (e.deltaY > 0) {
        setActiveIndex((i) => (i + 1) % items.length);
      } else if (e.deltaY < 0) {
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
      }
    },
    [items.length]
  );

  const handleClick = useCallback(
    (index: number) => () => setActiveIndex(index),
    []
  );

  const variantLabels: Record<number, string> = {
    1: "Original — Bleu, bordure gauche or, shadow",
    2: "Bordure complète — Or tout autour",
    3: "Inversé — Fond blanc, texte noir, sans shadow",
    4: "Bordure bas uniquement — Or en dessous",
    5: "Sans bordure — Bleu, shadow seulement, coins arrondis",
    6: "Double bordure — Gauche + bas, padding réduit",
  };

  return (
    <section
      style={{
        padding: "5rem 0",
        background: visionVariant === 3 ? "#fafaf9" : "#ffffff",
      }}
    >
      <div className="container" style={{ maxWidth: 1150, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#d4af37",
              marginBottom: "0.75rem",
            }}
          >
            {locale === "fr" ? "Sélectionnez un élément" : "Select an element"}
          </span>
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 1rem 0",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            {sectionTitle}
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#6b7280",
              margin: 0,
              maxWidth: 600,
              margin: "0 auto 2rem auto",
            }}
          >
            {variantLabels[visionVariant]}
          </p>
        </div>

        <div
          onWheel={handleWheel}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {items.map((it, i) => {
            const isActive = i === activeIndex;
            const boxStyle = getBoxStyle(visionVariant, isActive);

            return (
              <div
                key={it.img}
                style={boxStyle}
                onClick={() => handleClick(i)}
                onMouseEnter={(e) => {
                  if (visionVariant === 1 || visionVariant === 2 || visionVariant === 4 || visionVariant === 5 || visionVariant === 6) {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (visionVariant === 1 || visionVariant === 2 || visionVariant === 4 || visionVariant === 5 || visionVariant === 6) {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }
                }}
              >
                <div
                  style={{
                    marginBottom: "16px",
                    borderRadius: visionVariant === 5 ? 8 : 0,
                    overflow: "hidden",
                  }}
                >
                  <picture>
                    <source type="image/webp" srcSet={`/assets/images/${it.img}.webp`} />
                    <img
                      src={`/assets/images/${it.img}.jpg`}
                      alt={it.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </picture>
                </div>
                <h3
                  style={{
                    color: boxStyle.color === "#fff" ? "#fff" : "#111827",
                    fontSize: "1.4rem",
                    margin: "0 0 12px 0",
                    lineHeight: 1.3,
                    fontWeight: 800,
                  }}
                >
                  {it.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: boxStyle.color === "#fff" ? "rgba(255,255,255,0.85)" : "#4b5563",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {it.text}
                </p>
              </div>
            );
          })}
        </div>

        {visionVariant !== 2 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: "3rem",
            }}
          >
            {items.map((_, i) => (
              <div
                key={i}
                style={{
                  width: activeIndex === i ? 30 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: activeIndex === i ? "#d4af37" : "#d1d5db",
                  transition: "all 0.4s ease",
                  cursor: "pointer",
                }}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

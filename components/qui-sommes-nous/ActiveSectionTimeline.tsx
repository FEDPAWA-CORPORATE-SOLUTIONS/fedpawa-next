// ============================================================
// FEDPAWA — Composant ActiveSectionTimeline
// Inspiration directe de l'image : grand visuel à gauche (~50%),
// ligne verticale centrale, 3 marqueurs numérotés alignés sur la ligne,
// titre + texte à droite de chaque marqueur.
// Règle : clic sur un cercle = change le grand visuel + le texte actif.
//         molette souris = défiler les éléments un par un.
//         animation d'entrée rapide au chargement.
// ==========================================================

"use client";

import { useCallback, useRef, useState } from "react";
import { type Locale } from "@/lib/i18n";

export interface TimelineItem {
  number: string;   // "01", "02", "03"
  title: string;
  text: string;
  image: string;    // nom de l'image sans extension
  color: string;    // couleur du marqueur
}

interface ActiveSectionTimelineProps {
  locale: Locale;
  sectionTitle: string;
  items: TimelineItem[]; // exactement 3 éléments
}

export default function ActiveSectionTimeline({
  locale,
  sectionTitle,
  items,
}: ActiveSectionTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelRef = useRef<number>(0);

  const item = items[activeIndex];

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelRef.current < 250) return;
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

  return (
    <section
      style={{
        padding: "5rem 0",
        background: "#fafaf9",
      }}
    >
      <div className="container" style={{ maxWidth: 1150, margin: "0 auto", padding: "0 20px" }}>
        {/* Grand titre centré au-dessus */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 0.75rem 0",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            {sectionTitle}
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: 600, margin: "0 auto" }}>
            {locale === "fr" ? "Sélectionnez un élément pour découvrir le détail." : "Select an item to discover the details."}
          </p>
        </div>

        {/* Ligne principale : Grand visuel à gauche (~50%) | Ligne verticale | Marqueurs + Texte à droite */}
        <div
          onWheel={handleWheel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            minHeight: "62vh",
            position: "relative",
          }}
        >
          {/* ========== GRAND VISUEL À GAUCHE (~50%) ========== */}
          <div
            style={{
              flex: 1,
              minHeight: 520,
              position: "relative",
              overflow: "hidden",
              borderRadius: 0,
              border: "1px solid #e5e5e5",
              background: "#f3f4f6",
            }}
          >
            <img
              src={`/assets/images/${item.image}.jpg`}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            />
            {/* Titre en surimpression sur l'image (bas gauche) */}
            <div
              style={{
                position: "absolute",
                bottom: 30,
                left: 30,
                color: "#ffffff",
                fontSize: "1.75rem",
                fontWeight: 800,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                lineHeight: 1.3,
                pointerEvents: "none",
                maxWidth: "75%",
              }}
            >
              {item.title}
            </div>
          </div>

          {/* ========== LIGNE VERTICALE CENTRALE ========== */}
          <div
            style={{
              width: 1,
              height: "100%",
              background: "#e5e5e5",
              position: "relative",
            }}
          >
            {/* Petits points sur la ligne pour marquer les niveaux */}
            {items.map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "-4px",
                  top: `${i * 33.33}%`,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: activeIndex === i ? items[i].color : "#d1d5db",
                  border: `3px solid #ffffff`,
                  boxShadow: activeIndex === i ? `0 0 0 4px ${items[i].color}` : "none",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* ========== MARQUEURS + TEXTE À DROITE ========== */}
          <div
            style={{
              flex: 1,
              paddingLeft: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            {items.map((it, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={it.number}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                  }}
                  onClick={handleClick(i)}
                >
                  {/* Cercle numéroté */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: isActive ? it.color : "#ffffff",
                      border: `3px solid ${it.color}`,
                      color: isActive ? "#ffffff" : it.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      boxShadow: isActive ? "0 4px 14px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                      flexShrink: 0,
                    }}
                  >
                    {it.number}
                  </div>

                  {/* Texte à droite */}
                  <div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: isActive ? "#111827" : "#6b7280",
                        margin: "0 0 0.5rem 0",
                        lineHeight: 1.35,
                        letterSpacing: "-0.01em",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {it.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                        color: isActive ? "#4b5563" : "#9ca3af",
                        margin: 0,
                        maxWidth: 420,
                        transition: "color 0.3s ease",
                      }}
                    >
                      {it.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicateurs de progression (points en bas) */}
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
      </div>
    </section>
  );
}

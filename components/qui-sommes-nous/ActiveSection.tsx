// ============================================================
// FEDPAWA — Composant ActiveSection (Section active avec image + 3 cercles)
// Design : Grand carré (80% hauteur section, 3 côtés droits + 1 côté courbé)
//          3 cercles sur le côté courbé, chacun lié à un bloc de texte
//          Clic sur un cercle = change image + texte actifs
//          Molette souris = défiler entre les éléments
// ==========================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Locale } from "@/lib/i18n";

export interface ActiveItem {
  img: string;        // nom de l'image sans extension (ex: "qui_1")
  title: string;      // titre du bloc actif
  text: string;       // texte du bloc actif
  caption: string;    // légende sous l'image
  color: string;      // couleur d'accent du cercle
}

interface ActiveSectionProps {
  locale: Locale;
  sectionTitle: string;
  items: ActiveItem[]; // exactement 3 éléments
}

export default function ActiveSection({
  locale,
  sectionTitle,
  items,
}: ActiveSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelRef = useRef<number>(0);

  const item = items[activeIndex];
  const prevIndex = (activeIndex - 1 + items.length) % items.length;
  const nextIndex = (activeIndex + 1) % items.length;

  // Défilement molette : descendre = suivant, monter = précédent
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelRef.current < 300) return;
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
        padding: "6rem 0",
        background: locale === "fr" ? "#ffffff" : "#ffffff",
        position: "relative",
      }}
    >
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        {/* Grand titre au-dessus */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.9rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#d4af37",
              marginBottom: "0.75rem",
            }}
          >
            {locale === "fr" ? "Nos engagements" : "Our commitments"}
          </span>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "#111827",
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {sectionTitle}
          </h2>
        </div>

        {/* Ligne principale : Carré image | Cercles + Texte */}
        <div
          onWheel={handleWheel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            minHeight: "70vh",
            position: "relative",
          }}
        >
          {/* ========== GRAND CARRÉ (côté courbé à droite) ========== */}
          <div
            style={{
              flex: 1,
              minHeight: 560,
              position: "relative",
              overflow: "hidden",
              borderRadius: "0 90px 90px 0", // côté droit courbé
              border: "1px solid #e5e5e5",
              background: "#f3f4f6",
            }}
          >
            {/* Image de fond du carré */}
            <img
              src={`/assets/images/${item.img}.jpg`}
              alt={item.caption}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                opacity: activeIndex === items.indexOf(item) ? 1 : 0.6,
              }}
            />

            {/* Overlay titre sur l'image (optionnel, léger) */}
            <div
              style={{
                position: "absolute",
                bottom: 32,
                left: 32,
                right: 32,
                color: "#ffffff",
                fontSize: "1.5rem",
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                lineHeight: 1.3,
                pointerEvents: "none",
              }}
            >
              {item.title}
            </div>
          </div>

          {/* ========== 3 CERCLES SUR LE CÔTÉ COURBÉ ========== */}
          <div
            style={{
              position: "absolute",
              right: "-28px",
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              padding: "40px 0",
              pointerEvents: "none",
            }}
          >
            {items.map((it, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={it.img}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pointerEvents: "auto",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  onClick={handleClick(i)}
                  onMouseEnter={() => {}}
                >
                  {/* Cercle */}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: isActive ? item.color : "#ffffff",
                      border: `3px solid ${isActive ? "#ffffff" : item.color}`,
                      color: isActive ? "#ffffff" : item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      marginBottom: 8,
                      boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 6px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Légende cercle */}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: isActive ? item.color : "#6b7280",
                      textAlign: "center",
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {it.caption}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ========== BLOC TEXTE ACTIF ========== */}
          <div
            style={{
              flex: 1,
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 40px 0 20px",
            }}
          >
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 1rem 0",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                transition: "color 0.3s ease",
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: "#4b5563",
                margin: "0 0 1.5rem 0",
                maxWidth: 420,
                transition: "color 0.3s ease",
              }}
            >
              {item.text}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.875rem",
                fontWeight: 600,
                color: item.color,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />
              Voir les détails
            </div>
          </div>
        </div>

        {/* Indice de navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: "2rem",
          }}
        >
          {items.map((_, i) => (
            <div
              key={i}
              style={{
                width: activeIndex === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: activeIndex === i ? "#d4af37" : "#d1d5db",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

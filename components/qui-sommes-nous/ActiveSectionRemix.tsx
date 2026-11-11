// ============================================================
// FEDPAWA — Composant ActiveSectionRemix
// 4 variantes de présentation du même contenu (3 items) :
//   v1 : Split Line Timeline (grand visuel gauche + ligne centrale + marqueurs)
//   v2 : Radial Orbit (grand visuel central + 3 cercles autour)
//   v3 : Stacked Timeline (cartes verticales empilées avec image à gauche)
//   v4 : Grid Focus (grille 2x2, visuel en haut, 3 cartes ci-dessous)
// Règle : clic sur un élément = change le visuel actif + le bloc texte
//         molette souris = défiler un par un
//         animation d'entrée rapide au chargement de section
// ==========================================================

"use client";

import { useCallback, useRef, useState } from "react";
import { type Locale } from "@/lib/i18n";

export interface RemixItem {
  number: string;   // "01", "02", "03"
  title: string;
  text: string;
  image: string;    // nom de l'image sans extension
  color: string;    // couleur du marqueur
  caption?: string; // légende courte sous le chiffre (variante 2)
}

interface ActiveSectionRemixProps {
  locale: Locale;
  sectionTitle: string;
  items: RemixItem[];
  variant: 1 | 2 | 3 | 4;
}

export default function ActiveSectionRemix({
  locale,
  sectionTitle,
  items,
  variant,
}: ActiveSectionRemixProps) {
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

  // ========== VARIANTE 1 : Split Line Timeline ==========
  // Grand visuel à gauche (~50%), ligne verticale centrale,
  // 3 marqueurs numérotés sur la ligne, titre+texte à droite.
  const renderV1 = () => (
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
      {/* Grand visuel à gauche */}
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
            transition: "opacity 0.5s ease",
          }}
        />
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

      {/* Ligne verticale centrale */}
      <div
        style={{
          width: 1,
          height: "100%",
          background: "#e5e5e5",
          position: "relative",
        }}
      >
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

      {/* Marqueurs + Texte à droite */}
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
              style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }}
              onClick={handleClick(i)}
            >
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
  );

  // ========== VARIANTE 2 : Radial Orbit ==========
  // Grand visuel central, 3 éléments en arc de cercle autour
  const renderV2 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3rem",
        minHeight: "62vh",
        position: "relative",
      }}
    >
      {/* Grand visuel central */}
      <div
        style={{
          width: "55vw",
          maxWidth: 640,
          height: 420,
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid #e5e5e5",
          position: "relative",
          boxShadow: "0 10px 30px rgba(10, 14, 24, 0.12)",
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
            transition: "opacity 0.5s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            color: "#ffffff",
            fontSize: "1.75rem",
            fontWeight: 800,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            maxWidth: "80%",
          }}
        >
          {item.title}
        </div>
      </div>

      {/* 3 cercles en arc de cercle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {items.map((it, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={it.number}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={() => {}}
              onClick={handleClick(i)}
            >
              {/* Cercle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: isActive ? it.color : "#f3f4f6",
                  border: `3px solid ${isActive ? it.color : "#d1d5db"}`,
                  color: isActive ? "#ffffff" : "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  boxShadow: isActive ? "0 6px 16px rgba(0,0,0,0.15)" : "0 2px 6px rgba(0,0,0,0.1)",
                  transition: "all 0.35s ease",
                }}
              >
                {it.number}
              </div>
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: isActive ? it.color : "#6b7280",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {it.caption || it.title}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    lineHeight: 1.4,
                    maxWidth: 140,
                    display: "block",
                  }}
                >
                  {it.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ========== VARIANTE 3 : Stacked Timeline ==========
  // Cartes verticales empilées, visuel à gauche de chaque carte active
  const renderV3 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        minHeight: "62vh",
        alignItems: "center",
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
              gap: "2rem",
              width: "100%",
              maxWidth: 900,
              padding: isActive ? "1.5rem 2rem" : "1rem 1.5rem",
              borderRadius: 16,
              background: isActive ? "#ffffff" : "#f8fafc",
              border: `1px solid ${isActive ? item.color : "#e5e5e5"}`,
              boxShadow: isActive ? "0 8px 24px rgba(10, 14, 24, 0.1)" : "none",
              transform: isActive ? "scale(1)" : "scale(0.96)",
              opacity: isActive ? 1 : 0.6,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
            }}
            onClick={handleClick(i)}
          >
            {/* Image miniature à gauche */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 12,
                overflow: "hidden",
                border: `2px solid ${isActive ? it.color : "#e5e5e5"}`,
                flexShrink: 0,
              }}
            >
              <img
                src={`/assets/images/${it.image}.jpg`}
                alt={it.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>

            {/* Texte à droite */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isActive ? it.color : "#e5e5e5",
                    color: isActive ? "#ffffff" : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    fontWeight: 800,
                  }}
                >
                  {it.number}
                </div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: isActive ? it.color : "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {it.caption || it.title}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: isActive ? "#111827" : "#4b5563",
                  margin: "0 0 0.5rem 0",
                  lineHeight: 1.4,
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
                  maxWidth: 500,
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
  );

  // ========== VARIANTE 4 : Grid Focus ==========
  // Visuel en grand en haut, 3 cartes en grille en dessous
  const renderV4 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        minHeight: "62vh",
        alignItems: "center",
      }}
    >
      {/* Visuel en grand */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          height: 340,
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid #e5e5e5",
          position: "relative",
          boxShadow: "0 10px 30px rgba(10, 14, 24, 0.1)",
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
            transition: "opacity 0.5s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            color: "#ffffff",
            fontSize: "1.75rem",
            fontWeight: 800,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            maxWidth: "80%",
          }}
        >
          {item.title}
        </div>
      </div>

      {/* 3 cartes en grille */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          width: "100%",
          maxWidth: 900,
        }}
      >
        {items.map((it, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={it.number}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "1.5rem",
                borderRadius: 14,
                background: isActive ? "#ffffff" : "#f9fafb",
                border: `1px solid ${isActive ? it.color : "#e5e5e5"}`,
                cursor: "pointer",
                transition: "all 0.35s ease",
                transform: isActive ? "scale(1.02)" : "scale(1)",
                boxShadow: isActive ? "0 6px 18px rgba(10, 14, 24, 0.08)" : "none",
              }}
              onClick={handleClick(i)}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isActive ? it.color : "#ffffff",
                  border: `2px solid ${it.color}`,
                  color: isActive ? "#ffffff" : it.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 800,
                  marginBottom: "0.75rem",
                  transition: "all 0.3s ease",
                }}
              >
                {it.number}
              </div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: isActive ? "#111827" : "#4b5563",
                  margin: "0 0 0.5rem 0",
                  lineHeight: 1.4,
                  transition: "color 0.3s ease",
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: isActive ? "#4b5563" : "#9ca3af",
                  margin: 0,
                  maxWidth: 240,
                  transition: "color 0.3s ease",
                }}
              >
                {it.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Sélecteur de variante
  const renderVariant = () => {
    switch (variant) {
      case 1: return renderV1();
      case 2: return renderV2();
      case 3: return renderV3();
      case 4: return renderV4();
      default: return renderV1();
    }
  };

  return (
    <section
      style={{
        padding: "5rem 0",
        background: variant === 2 || variant === 4 ? "#fafaf9" : "#ffffff",
      }}
    >
      <div className="container" style={{ maxWidth: 1150, margin: "0 auto", padding: "0 20px" }}>
        {/* Grand titre centré au-dessus */}
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
        </div>

        {renderVariant()}

        {/* Indicateurs de progression en bas (sauf v2 qui a ses propres indicateurs implicites) */}
        {variant !== 2 && (
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

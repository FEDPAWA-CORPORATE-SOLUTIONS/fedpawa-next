// ============================================================
// FEDPAWA — Composant ActiveSectionVariants
// 4 variantes de présentation basées sur l'image de référence :
//   v1 : Split Line (grand visuel à gauche, ligne verticale,
//        3 marqueurs numérotés sur le côté courbé, texte à droite)
//   v2 : Radial Orbit (grand visuel central, 3 cercles en arc)
//   v3 : Stacked Timeline (cartes verticales empilées)
//   v4 : Grid Focus (visuel en grand en haut, 3 cartes en grille)
// Règle : clic sur un cercle = change l'image + le texte actif.
//         Seul l'élément actif est mis en avant (texte plus grand/large).
//         Molette souris = défiler un par un (ralenti par 3).
//         Animation d'entrée rapide.
// ==========================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Locale } from "@/lib/i18n";

export interface RemixItem {
  number: string;
  title: string;
  text: string;
  image: string;
  color: string;
}

interface ActiveSectionVariantsProps {
  locale: Locale;
  sectionTitle: string;
  items: RemixItem[];
  variant: 1 | 2 | 3 | 4;
}

export default function ActiveSectionVariants({
  locale,
  sectionTitle,
  items,
  variant,
}: ActiveSectionVariantsProps) {
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

  // ========== VARIANTE 1 : Split Line Timeline ==========
  // Grand carré à gauche (côté droit courbé), 3 cercles sur le côté courbé,
  // texte à droite de chaque cercle.
  const renderV1 = () => (
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
      {/* Grand carré à gauche, côté droit courbé */}
      <div
        style={{
          flex: 1,
          minHeight: 560,
          position: "relative",
          overflow: "hidden",
          borderRadius: "0 90px 90px 0",
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
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 32,
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
              }}
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
              <div style={{ minHeight: 80 }}>
                <h3
                  style={{
                    fontSize: isActive ? "1.35rem" : "1.2rem",
                    fontWeight: 800,
                    color: isActive ? "#111827" : "#6b7280",
                    margin: "0 0 0.5rem 0",
                    lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                    transition: "all 0.3s ease",
                  }}
                >
                  {it.title}
                </h3>
                <p
                  style={{
                    fontSize: isActive ? "1rem" : "0.95rem",
                    lineHeight: 1.8,
                    color: isActive ? "#111827" : "#9ca3af",
                    margin: 0,
                    maxWidth: isActive ? 520 : 420,
                    fontWeight: isActive ? 600 : 400,
                    transition: "all 0.3s ease",
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
  // Grand visuel central, 3 cercles en arc de cercle autour
  const renderV2 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3rem",
        minHeight: "70vh",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "55vw",
          maxWidth: 640,
          height: 460,
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
              onClick={handleClick(i)}
            >
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
                <h3
                  style={{
                    fontSize: isActive ? "1.1rem" : "0.95rem",
                    fontWeight: 800,
                    color: isActive ? "#111827" : "#6b7280",
                    margin: "0 0 0.5rem 0",
                    lineHeight: 1.3,
                    transition: "all 0.3s ease",
                  }}
                >
                  {it.title}
                </h3>
                <span
                  style={{
                    fontSize: isActive ? "0.85rem" : "0.8rem",
                    color: isActive ? "#111827" : "#9ca3af",
                    lineHeight: 1.4,
                    maxWidth: 140,
                    display: "block",
                    transition: "all 0.3s ease",
                    fontWeight: isActive ? 600 : 400,
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

  // ========== VARIANTE 3 : Stacked Timeline (responsive, sans bordure arrondie, sans padding) ==========
  // Cartes verticales empilées, image à gauche et texte à droite (colonne sur mobile).
  // Pas de border-radius, pas de padding entre conteneur et contenu.
  const renderV3 = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 768);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);

    return (
      <div
        onWheel={handleWheel}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          minHeight: "70vh",
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
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                gap: isMobile ? 0 : "1rem",
                width: "100%",
                maxWidth: 900,
                padding: 0,
                borderRadius: 0,
                background: isActive ? "#ffffff" : "#fafafa",
                border: isActive ? `1px solid ${it.color}` : "none",
                boxShadow: isActive ? "0 4px 12px rgba(10, 14, 24, 0.08)" : "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onClick={handleClick(i)}
            >
              <div
                style={{
                  width: isMobile ? "100%" : 160,
                  height: isMobile ? 200 : 160,
                  borderRadius: 0,
                  overflow: "hidden",
                  border: isActive ? `1px solid ${it.color}` : "none",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`/assets/images/${it.image}.jpg`}
                  alt={it.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ flex: 1, padding: isMobile ? "1rem 0 0 0" : 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 0,
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
                    {it.title}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: isActive ? "1.25rem" : "1rem",
                    fontWeight: 800,
                    color: isActive ? "#111827" : "#4b5563",
                    margin: "0 0 0.5rem 0",
                    lineHeight: 1.4,
                    transition: "all 0.3s ease",
                  }}
                >
                  {it.title}
                </h3>
                <p
                  style={{
                    fontSize: isActive ? "1rem" : "0.9rem",
                    lineHeight: 1.7,
                    color: isActive ? "#111827" : "#9ca3af",
                    margin: 0,
                    maxWidth: "none",
                    fontWeight: isActive ? 600 : 400,
                    transition: "all 0.3s ease",
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
  };

  // ========== VARIANTE 4 : Grid Focus ==========
  // Visuel en grand en haut, 3 cartes en grille en dessous
  const renderV4 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        minHeight: "70vh",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          height: 380,
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
                transform: isActive ? "scale(1.03)" : "scale(1)",
                boxShadow: isActive ? "0 8px 24px rgba(10, 14, 24, 0.12)" : "none",
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
                  fontSize: isActive ? "1.1rem" : "1rem",
                  fontWeight: 800,
                  color: isActive ? "#111827" : "#4b5563",
                  margin: "0 0 0.5rem 0",
                  lineHeight: 1.4,
                  transition: "all 0.3s ease",
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontSize: isActive ? "0.9rem" : "0.85rem",
                  lineHeight: 1.6,
                  color: isActive ? "#111827" : "#9ca3af",
                  margin: 0,
                  maxWidth: 260,
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.3s ease",
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

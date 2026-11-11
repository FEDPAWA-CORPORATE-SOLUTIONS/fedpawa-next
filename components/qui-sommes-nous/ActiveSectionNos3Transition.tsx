// ============================================================
// FEDPAWA — Composant ActiveSectionNos3Transition
// 3 variantes de transition entre la v3 "Stacked Timeline"
// et le design minimaliste "About Us" (cartes, lignes fines,
// images en haut, icônes, texte épuré).
// ==========================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Locale } from "@/lib/i18n";

export interface Nos3Item {
  number: string;
  title: string;
  text: string;
  image: string;
  icon: string;
  color: string;
}

interface ActiveSectionNos3TransitionProps {
  locale: Locale;
  sectionTitle: string;
  items: Nos3Item[];
  transition: 1 | 2 | 3;
}

export default function ActiveSectionNos3Transition({
  locale,
  sectionTitle,
  items,
  transition,
}: ActiveSectionNos3TransitionProps) {
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

  const ICONS: Record<string, string> = {
    camera: "📷",
    printer: "🖨️",
    phone: "📞",
    document: "📄",
    building: "🏢",
    users: "👥",
  };

  // ========== TRANSITION 1 : Stacked Minimal (proche de v3) ==========
  // Cartes empilées, image à gauche (carré), texte à droite.
  // Bordure fine sur la carte active, pas de fond sur les inactifs.
  const renderT1 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: "60vh",
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
              gap: "1.5rem",
              width: "100%",
              maxWidth: 900,
              padding: "1.5rem",
              borderRadius: 0,
              background: isActive ? "#ffffff" : "transparent",
              border: isActive ? `1px solid ${it.color}` : "1px solid #e5e5e5",
              boxShadow: isActive ? "0 4px 12px rgba(10, 14, 24, 0.06)" : "none",
              transition: "all 0.3s ease",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
            onClick={handleClick(i)}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 0,
                overflow: "hidden",
                border: `1px solid ${it.color}`,
                flexShrink: 0,
              }}
            >
              <img
                src={`/assets/images/${it.image}.jpg`}
                alt={it.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div style={{ flex: 1 }}>
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
                    width: 24,
                    height: 24,
                    borderRadius: 0,
                    background: isActive ? it.color : "#f3f4f6",
                    color: isActive ? "#ffffff" : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: 800,
                  }}
                >
                  {it.number}
                </div>
                <h3
                  style={{
                    fontSize: isActive ? "1.25rem" : "1rem",
                    fontWeight: 800,
                    color: isActive ? "#111827" : "#4b5563",
                    margin: 0,
                    lineHeight: 1.4,
                    transition: "all 0.3s ease",
                  }}
                >
                  {it.title}
                </h3>
              </div>
              <p
                style={{
                  fontSize: isActive ? "0.95rem" : "0.9rem",
                  lineHeight: 1.7,
                  color: isActive ? "#111827" : "#9ca3af",
                  margin: 0,
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

  // ========== TRANSITION 2 : Card Center (intermédiaire) ==========
  // Image en haut de la carte, icône au centre, titre et texte en dessous.
  // Disposition horizontale : image à gauche, contenu à droite.
  const renderT2 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minHeight: "60vh",
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
              gap: "1.5rem",
              width: "100%",
              maxWidth: 900,
              padding: "1rem",
              borderRadius: 0,
              background: isActive ? "#ffffff" : "#fafafa",
              border: `1px solid ${isActive ? it.color : "#e5e5e5"}`,
              boxShadow: isActive ? "0 4px 12px rgba(10, 14, 24, 0.08)" : "none",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={handleClick(i)}
          >
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 0,
                overflow: "hidden",
                border: `1px solid ${it.color}`,
                flexShrink: 0,
              }}
            >
              <img
                src={`/assets/images/${it.image}.jpg`}
                alt={it.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 0,
                  background: it.color,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                {ICONS[it.icon] || it.icon}
              </div>
              <h3
                style={{
                  fontSize: isActive ? "1.2rem" : "1rem",
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
                  lineHeight: 1.7,
                  color: isActive ? "#111827" : "#9ca3af",
                  margin: 0,
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

  // ========== TRANSITION 3 : About Us Style (proche de l'image) ==========
  // Bloc texte à gauche, cartes à droite avec image en haut, titre et texte.
  // Lignes très fines, style minimaliste, gris/noir sur blanc.
  const renderT3 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        minHeight: "60vh",
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
              padding: "0",
              borderRadius: 0,
              background: "transparent",
              border: "none",
              boxShadow: "none",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={handleClick(i)}
          >
            {/* Bloc texte à gauche */}
            <div
              style={{
                flex: 1,
                paddingRight: "2rem",
                borderRight: isActive ? `1px solid ${it.color}` : "1px solid #e5e5e5",
              }}
            >
              <h3
                style={{
                  fontSize: isActive ? "1.3rem" : "1rem",
                  fontWeight: 800,
                  color: isActive ? "#111827" : "#4b5563",
                  margin: "0 0 0.75rem 0",
                  lineHeight: 1.4,
                  transition: "all 0.3s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontSize: isActive ? "0.95rem" : "0.85rem",
                  lineHeight: 1.8,
                  color: isActive ? "#111827" : "#9ca3af",
                  margin: 0,
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.3s ease",
                }}
              >
                {it.text}
              </p>
            </div>
            {/* Carte à droite */}
            <div
              style={{
                width: 200,
                borderRadius: 0,
                border: `1px solid ${isActive ? it.color : "#e5e5e5"}`,
                background: "#ffffff",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  height: 140,
                  overflow: "hidden",
                  borderBottom: `1px solid ${isActive ? it.color : "#e5e5e5"}`,
                }}
              >
                <img
                  src={`/assets/images/${it.image}.jpg`}
                  alt={it.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ padding: "1rem" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 0,
                    background: it.color,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {ICONS[it.icon] || it.icon}
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: it.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                  }}
                >
                  {it.number}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTransition = () => {
    switch (transition) {
      case 1: return renderT1();
      case 2: return renderT2();
      case 3: return renderT3();
      default: return renderT1();
    }
  };

  return (
    <section
      style={{
        padding: "5rem 0",
        background: "#ffffff",
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

        {renderTransition()}

        {transition !== 3 && (
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

// ============================================================
// FEDPAWA — Composant ActiveSectionAboutVisionRestructured
// 6 variantes de RESTRUCTURATION complète du composant
// "about-vision-box" : chaque variante change la disposition,
// les rapports de taille, la structure HTML et les animations.
// ==========================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Locale } from "@/lib/i18n";

export interface VisionBoxItem {
  img: string;
  title: string;
  text: string;
}

interface ActiveSectionAboutVisionRestructuredProps {
  locale: Locale;
  sectionTitle: string;
  items: VisionBoxItem[];
  variant: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function ActiveSectionAboutVisionRestructured({
  locale,
  sectionTitle,
  items,
  variant,
}: ActiveSectionAboutVisionRestructuredProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelRef = useRef<number>(0);
  const item = items[activeIndex];

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelRef.current < 750) return;
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

  // ============================================================
  // VARIANTE 1 : Original structuré
  // Image en haut (largeur pleine), titre et texte en dessous.
  // Bloc unique, fond bleu, bordure gauche or.
  // ============================================================
  const renderV1 = () => (
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
        return (
          <div
            key={it.img}
            style={{
              background: "#1A237E",
              color: "#fff",
              padding: "40px",
              borderLeft: "5px solid #d4af37",
              boxShadow: isActive ? "0 15px 40px rgba(26, 35, 126, 0.35)" : "0 10px 30px rgba(26, 35, 126, 0.2)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={handleClick(i)}
          >
            <div style={{ marginBottom: "16px", borderRadius: 0, overflow: "hidden" }}>
              <picture>
                <source type="image/webp" srcSet={`/assets/images/${it.img}.webp`} />
                <img
                  src={`/assets/images/${it.img}.jpg`}
                  alt={it.title}
                  loading="lazy"
                  style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                />
              </picture>
            </div>
            <h3
              style={{
                color: "#fff",
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
                color: "rgba(255,255,255,0.85)",
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
  );

  // ============================================================
  // VARIANTE 2 : Côte à côte (Image | Texte)
  // L'image occupe 40% à gauche, le texte 60% à droite.
  // Sur mobile : empilement vertical.
  // ============================================================
  const renderV2 = () => {
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
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        {items.map((it, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={it.img}
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                gap: "2rem",
                width: "100%",
                maxWidth: 900,
                padding: 0,
                marginBottom: "2rem",
                borderRadius: 0,
                background: isActive ? "#ffffff" : "#fafafa",
                border: isActive ? `2px solid #d4af37` : "1px solid #e5e5e5",
                boxShadow: isActive ? "0 10px 30px rgba(10, 14, 24, 0.12)" : "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
                overflow: "hidden",
              }}
              onClick={handleClick(i)}
            >
              {/* Image : 40% largeur */}
              <div
                style={{
                  flex: isMobile ? 1 : 0.4,
                  minHeight: isMobile ? 200 : 260,
                  borderRadius: 0,
                  overflow: "hidden",
                  background: "#1A237E",
                }}
              >
                <picture>
                  <source type="image/webp" srcSet={`/assets/images/${it.img}.webp`} />
                  <img
                    src={`/assets/images/${it.img}.jpg`}
                    alt={it.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </picture>
              </div>
              {/* Texte : 60% largeur */}
              <div style={{ flex: isMobile ? 1 : 0.6, padding: isMobile ? "1rem 0 0 0" : "0 2rem" }}>
                <div
                  style={{
                    width: 40,
                    height: 4,
                    background: "#d4af37",
                    marginBottom: "1rem",
                    borderRadius: 2,
                  }}
                />
                <h3
                  style={{
                    fontSize: isActive ? "1.5rem" : "1.25rem",
                    fontWeight: 800,
                    color: "#111827",
                    margin: "0 0 0.75rem 0",
                    lineHeight: 1.3,
                  }}
                >
                  {it.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color: "#4b5563",
                    margin: 0,
                    fontWeight: isActive ? 600 : 400,
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

  // ============================================================
  // VARIANTE 3 : Image cercle central + texte en dessous
  // Image découpée en cercle au centre, titre et texte en dessous,
  // bloc centré, fond blanc, bordure fine.
  // ============================================================
  const renderV3 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      {items.map((it, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={it.img}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "2rem",
              borderRadius: 0,
              background: isActive ? "#1A237E" : "#ffffff",
              color: isActive ? "#fff" : "#111827",
              border: isActive ? `3px solid #d4af37` : "1px solid #e5e5e5",
              boxShadow: isActive ? "0 12px 36px rgba(26, 35, 126, 0.25)" : "0 4px 12px rgba(0,0,0,0.06)",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
            }}
            onClick={handleClick(i)}
          >
            {/* Cercle image */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                overflow: "hidden",
                marginBottom: "1.5rem",
                border: `3px solid ${isActive ? "#d4af37" : "#e5e5e5"}`,
                background: isActive ? "#d4af37" : "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`/assets/images/${it.img}.jpg`}
                alt={it.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <h3
              style={{
                fontSize: isActive ? "1.4rem" : "1.15rem",
                fontWeight: 800,
                margin: "0 0 0.75rem 0",
                lineHeight: 1.3,
              }}
            >
              {it.title}
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 260,
                fontWeight: isActive ? 600 : 400,
                opacity: isActive ? 1 : 0.7,
              }}
            >
              {it.text}
            </p>
          </div>
        );
      })}
    </div>
  );

  // ============================================================
  // VARIANTE 4 : Image en fond avec texte en overlay (bas)
  // L'image occupe tout le bloc, le texte est en overlay
  // en bas avec un dégradé de fond pour lisibilité.
  // ============================================================
  const renderV4 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "2rem",
        alignItems: "stretch",
      }}
    >
      {items.map((it, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={it.img}
            style={{
              position: "relative",
              height: 340,
              borderRadius: 0,
              overflow: "hidden",
              border: `2px solid ${isActive ? "#d4af37" : "#e5e5e5"}`,
              boxShadow: isActive ? "0 12px 36px rgba(10, 14, 24, 0.15)" : "none",
              transition: "all 0.35s ease",
              cursor: "pointer",
            }}
            onClick={handleClick(i)}
          >
            {/* Image en fond */}
            <picture>
              <source type="image/webp" srcSet={`/assets/images/${it.img}.webp`} />
              <img
                src={`/assets/images/${it.img}.jpg`}
                alt={it.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.5s ease",
                }}
              />
            </picture>
            {/* Overlay dégradé en bas */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "45%",
                background: "linear-gradient(to top, rgba(26, 35, 126, 0.95), transparent)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 3,
                  background: "#d4af37",
                  marginBottom: "0.75rem",
                  borderRadius: 2,
                }}
              />
              <h3
                style={{
                  color: "#fff",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  margin: "0 0 0.5rem 0",
                  lineHeight: 1.3,
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.5,
                  margin: 0,
                  maxHeight: 100,
                  overflow: "hidden",
                  fontWeight: 500,
                }}
              >
                {it.text}
              </p>
            </div>
            {/* Badge actif */}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#d4af37",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(212, 175, 55, 0.4)",
                }}
              >
                ✓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ============================================================
  // VARIANTE 5 : Deux colonnes asymétriques (60% image | 40% texte)
  // L'image prend 60% à gauche, le texte 40% à droite avec un
  // fond coloré sur le bloc texte uniquement.
  // ============================================================
  const renderV5 = () => {
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
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        {items.map((it, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={it.img}
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                width: "100%",
                maxWidth: 900,
                padding: 0,
                marginBottom: "2rem",
                borderRadius: 0,
                overflow: "hidden",
                background: "#ffffff",
                border: `1px solid ${isActive ? "#d4af37" : "#e5e5e5"}`,
                boxShadow: isActive ? "0 8px 24px rgba(26, 35, 126, 0.1)" : "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onClick={handleClick(i)}
            >
              {/* Image : 60% */}
              <div
                style={{
                  flex: isMobile ? 1 : 0.6,
                  minHeight: isMobile ? 220 : 300,
                  overflow: "hidden",
                  background: "#f3f4f6",
                }}
              >
                <picture>
                  <source type="image/webp" srcSet={`/assets/images/${it.img}.webp`} />
                  <img
                    src={`/assets/images/${it.img}.jpg`}
                    alt={it.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </picture>
              </div>
              {/* Texte : 40% avec fond coloré */}
              <div
                style={{
                  flex: isMobile ? 1 : 0.4,
                  padding: "1.5rem",
                  background: isActive ? "#1A237E" : "#fafaf9",
                  color: isActive ? "#fff" : "#111827",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 0,
                    background: "#d4af37",
                    marginBottom: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </div>
                <h3
                  style={{
                    fontSize: isActive ? "1.2rem" : "1rem",
                    fontWeight: 800,
                    margin: "0 0 0.5rem 0",
                    lineHeight: 1.3,
                  }}
                >
                  {it.title}
                </h3>
                <p
                  style={{
                    fontSize: isActive ? "0.9rem" : "0.85rem",
                    lineHeight: 1.6,
                    margin: 0,
                    opacity: isActive ? 1 : 0.8,
                    fontWeight: isActive ? 600 : 400,
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

  // ============================================================
  // VARIANTE 6 : Style carte journal (petite image en haut à gauche,
  // titre en gros en dessous, texte en deux colonnes)
  // ============================================================
  const renderV6 = () => (
    <div
      onWheel={handleWheel}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
        alignItems: "start",
      }}
    >
      {items.map((it, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={it.img}
            style={{
              background: "#ffffff",
              border: `2px solid ${isActive ? "#d4af37" : "#e5e5e5"}`,
              borderRadius: 0,
              boxShadow: isActive ? "0 10px 30px rgba(26, 35, 126, 0.12)" : "none",
              transition: "all 0.35s ease",
              cursor: "pointer",
              overflow: "hidden",
            }}
            onClick={handleClick(i)}
          >
            {/* Petite image en haut à gauche */}
            <div
              style={{
                width: "100%",
                height: 140,
                overflow: "hidden",
                background: "#f8fafc",
                borderBottom: `1px solid ${isActive ? "#d4af37" : "#e5e5e5"}`,
              }}
            >
              <picture>
                <source type="image/webp" srcSet={`/assets/images/${it.img}.webp`} />
                <img
                  src={`/assets/images/${it.img}.jpg`}
                  alt={it.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </picture>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: "#d4af37",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  FEDPAWA
                </span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#d4af37",
                    display: "block",
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#111827",
                  margin: "0 0 0.75rem 0",
                  lineHeight: 1.3,
                }}
              >
                {it.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "#4b5563",
                  margin: 0,
                  fontWeight: isActive ? 600 : 400,
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

  const renderVariant = () => {
    switch (variant) {
      case 1: return renderV1();
      case 2: return renderV2();
      case 3: return renderV3();
      case 4: return renderV4();
      case 5: return renderV5();
      case 6: return renderV6();
      default: return renderV1();
    }
  };

  const variantLabels: Record<number, string> = {
    1: "Structure originale : image en haut, titre et texte en dessous, bloc bleu",
    2: "Côte à côte : image 40% à gauche, texte 60% à droite",
    3: "Image cercle central : photo ronde au centre, texte en dessous",
    4: "Image en fond + overlay texte : image pleine, texte en bas avec dégradé",
    5: "Deux colonnes asymétriques : image 60% à gauche, texte 40% à droite",
    6: "Style carte journal : petite image en haut, titre en gros, texte en dessous",
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
          <p
            style={{
              fontSize: "0.95rem",
              color: "#6b7280",
              margin: "0 auto 2rem auto",
              maxWidth: 700,
            }}
          >
            {variantLabels[variant]}
          </p>
        </div>

        {renderVariant()}

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

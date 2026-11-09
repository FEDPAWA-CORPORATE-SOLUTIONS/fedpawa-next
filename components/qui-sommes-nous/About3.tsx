// ==========================================================
// FEDPAWA — About3 : Qui sommes-nous 3 (version revue)
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";

// ===================== Dictionary helpers =====================
const t = (key: string) => getPageDictionary("fr", "qui-sommes-nous")[key];

// ===================== FeatureRow composant =====================
// Row image | texte côte à côte, responsive, avec style modernisé.
function FeatureRow({
  img,
  caption,
  alt,
  reversed = false,
  onOpen,
  children,
}: {
  img: string;
  caption: string;
  alt: string;
  reversed?: boolean;
  onOpen: (img: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "32px",
        alignItems: "center",
        marginBottom: "48px",
      }}
    >
      <figure
        style={{
          margin: 0,
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(10, 14, 24, 0.12)",
          order: reversed ? 2 : 1,
        }}
        onClick={() => onOpen(img)}
      >
        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <picture>
            <source
              type="image/webp"
              srcSet={`/assets/images/${img}.webp`}
            />
            <img
              src={`/assets/images/${img}.jpg`}
              alt={alt}
              loading="lazy"
              style={{
                width: "100%",
                height: "340px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </picture>
        </div>
        <figcaption
          style={{
            fontSize: "13px",
            color: "var(--color-text-muted)",
            marginTop: "10px",
            textAlign: "center",
            letterSpacing: "0.02em",
          }}
        >
          {caption}
        </figcaption>
      </figure>
      <div style={{ order: reversed ? 1 : 2 }}>{children}</div>
    </div>
  );
}

// ===================== About3 composant principal =====================
export default function About3({ locale = "fr" }: { locale: Locale }) {
  const dictionary = getPageDictionary(locale, "qui-sommes-nous");
  const routes = routesFor(locale);

  // ===== Lightbox =====
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  useEffect(() => {
    document.body.style.overflow = lightboxSrc ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxSrc]);

  const openLightbox = (img: string) => {
    setLightboxSrc(`/assets/images/${img}.jpg`);
  };

  // ===== Compteurs animés =====
  const statsKicker = t("statsKicker");
  const statsTitle = t("statsTitle");

  // Valeurs par défaut (seront remplies par le dictionnaire)
  const statLabels = [
    t("stat1Label"),
    t("stat2Label"),
    t("stat3Label"),
    t("stat4Label"),
  ];
  const statSuffixes = [
    t("stat1Suffix"),
    t("stat2Suffix"),
    t("stat3Suffix"),
    t("stat4Suffix"),
  ];

  // S'assurer que les suffixes sont définis
  const safeSuffixes = statSuffixes.map((s) => (s || "%"));

  const counters = [
    { target: 300, decimals: 0, suffix: safeSuffixes[0] },
    { target: 17, decimals: 0, suffix: safeSuffixes[1] },
    { target: 99.8, decimals: 1, suffix: "%" },
    { target: 100, decimals: 0, suffix: safeSuffixes[3] },
  ];

  const [counterValues, setCounterValues] = useState(
    counters.map(() => 0)
  );
  const statsRef = useRef<HTMLDivElement | null>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || animated.current) return;
        animated.current = true;

        const speed = 2000;
        counters.forEach((c, i) => {
          const increment = c.target / (speed / 10);
          let current = 0;

          const tick = () => {
            current += increment;
            if (current < c.target) {
              setCounterValues((v) => {
                const next = [...v];
                next[i] = current;
                return next;
              });
              setTimeout(tick, 10);
            } else {
              setCounterValues((v) => {
                const next = [...v];
                next[i] = c.target;
                return next;
              });
            }
          };
          tick();
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ===== Modale Rendez-vous =====
  const [rdvOpen, setRdvOpen] = useState(false);
  const [rdvSent, setRdvSent] = useState(false);

  useEffect(() => {
    document.body.style.overflow = rdvOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [rdvOpen]);

  return (
    <>
      {/* ============== HERO RÉSPONSIVE ============== */}
      <section
        style={{
          // Hero background with subtle pattern, responsive
          background:
            "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(255, 215, 0, 0.15)",
                border: "1px solid var(--color-gold)",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "1rem",
                color: "var(--color-gold)",
              }}
            >
              {t("heroBadge")}
            </div>

            <h1
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "var(--color-primary)",
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
            >
              {t("heroTitle")}
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                lineHeight: 1.6,
                color: "var(--color-text)",
                marginBottom: "2rem",
                maxWidth: 600,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {t("heroSubtitle")}
            </p>

            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.8,
                color: "var(--color-text-secondary)",
                marginBottom: "2rem",
                maxWidth: 600,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {t("heroText")}
            </p>

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Link
                href={routes.domiciliation}
                style={{
                  background: "var(--color-gold)",
                  color: "var(--color-bg)",
                  fontWeight: 500,
                  padding: "12px 28px",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  transition: "background 0.2s",
                }}
                className="btn btn-gold"
              >
                {t("heroCtaPrimary")}
              </Link>

              <button
                type="button"
                style={{
                  border: "2px solid var(--color-gold)",
                  background: "transparent",
                  color: "var(--color-gold)",
                  fontWeight: 500,
                  padding: "12px 28px",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                className="btn btn-outline"
                onClick={() => setRdvOpen(true)}
              >
                {t("heroCtaModal")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============== HISTOIRE & VISION ============== */}
      <section
        style={{
          // Section with subtle contrast, better spacing
          padding: "6rem 0",
          background: "var(--color-bg)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              alignItems: "center",
            }}
          >
            <div style={{}}>
              <span
                className="section-kicker"
                style={{
                  color: "var(--color-gold)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1rem",
                  display: "inline-block",
                }}
              >
                {t("historyKicker")}
              </span>

              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "var(--color-primary)",
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                {t("historyTitle")}
              </h2>

              <p
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.8,
                  color: "var(--color-text)",
                  marginBottom: "1rem",
                }}
              >
                {t("historyText1")}
              </p>

              <p
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.8,
                  color: "var(--color-text)",
                  marginBottom: "2rem",
                }}
              >
                {t("historyText2")}
              </p>
            </div>

            <div
              className="about-vision-box"
              style={{
                // Vision box with improved design
                padding: "2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="about-vision-photo"
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "2rem",
                }}
              >
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/assets/images/qui_6.webp"
                  />
                  <img
                    src="/assets/images/qui_6.jpg"
                    alt={t("visionImgAlt")}
                    loading="lazy"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                </picture>
              </div>

              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "1rem",
                }}
              >
                <span>🎯</span>{t("visionTitle").replace("🎯 ", "")}
              </h3>

              <p
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.7,
                  color: "var(--color-text)",
                }}
              >
                {t("visionText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== GALERIE PHOTOS AMÉLIORÉE ============== */}
      <section
        style={{
          padding: "6rem 0",
          background: "var(--color-bg)",
        }}
      >
        <div className="container" style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            <span
              className="section-kicker"
              style={{
                color: "var(--color-gold)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
                display: "inline-block",
              }}
            >
              {t("galleryKicker")}
            </span>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--color-primary)",
                marginBottom: "1rem",
              }}
            >
              {t("galleryTitle")}
            </h2>

            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.8,
                color: "var(--color-text-secondary)",
              }}
            >
              {t("galleryIntro")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
              justifyItems: "center",
            }}
          >
            {[
              { id: "qui_1" },
              { id: "qui_2" },
              { id: "qui_3" },
              { id: "qui_4" },
              { id: "qui_5" },
              { id: "qui_6" },
              { id: "qui_7" },
              { id: "qui_8" },
              { id: "qui_9" },
              { id: "qui_10" },
              { id: "qui_11" },
              { id: "qui_12" },
            ]
              .map(({ id }) => (
                <div
                  key={id}
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    width: "100%",
                    height: "280px",
                    boxShadow: "0 8px 24px rgba(10, 14, 24, 0.12)",
                    transition: "transform 0.2s",
                  }}
                  onClick={() => openLightbox(id)}
                >
                  <img
                    src={`/assets/images/${id}.jpg`}
                    alt={`Image FEDPAWA ${id}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.2s",
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ============== CHIFFRES CLÉS AMÉLIORÉS ============== */}
      <section
        style={{
          padding: "6rem 0",
          background: "linear-gradient(135deg, #f8f9fa 0%, #edeef1 100%)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            <span
              className="section-kicker"
              style={{
                color: "var(--color-gold)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
                display: "inline-block",
              }}
            >
              {t("statsKicker")}
            </span>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--color-primary)",
                marginBottom: "1rem",
              }}
            >
              {t("statsTitle")}
            </h2>

            <p
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
              }}
            >
              {t("statsIntro") || "Nos chiffres clés démontrent notre expertise et notre impact dans le domaine de la conformité d'entreprise et du droit OHADA."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
              justifyItems: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)",
                minWidth: 200,
                transition: "background 0.3s",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-gold)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-5h6v5" />
                </svg>
              </div>

              <strong
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {counterValues[0].toFixed(0)}
              </strong>

              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {t("stat1Label")} {t("stat1Suffix")}
              </span>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)",
                minWidth: 200,
                transition: "background 0.3s",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-primary)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path
                    d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                  />
                </svg>
              </div>

              <strong
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {counterValues[1].toFixed(0)}
              </strong>

              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {t("stat2Label")} {t("stat2Suffix")}
              </span>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)",
                minWidth: 200,
                transition: "background 0.3s",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-success)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <strong
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {counterValues[2].toFixed(1)}
              </strong>

              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {t("stat3Label")} {"%"}
              </span>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)",
                minWidth: 200,
                transition: "background 0.3s",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-warning)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>

              <strong
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {counterValues[3].toFixed(0)}
              </strong>

              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {t("stat4Label")} {t("stat4Suffix")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============== 4 PILIERS D'EXCELLENCE (STYLISÉS) ============== */}
      <section
        style={{
          padding: "6rem 0",
          background: "var(--color-bg)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            <span
              className="section-kicker"
              style={{
                color: "var(--color-gold)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
                display: "inline-block",
              }}
            >
              {t("pillarsKicker")}
            </span>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--color-primary)",
                marginBottom: "1rem",
              }}
            >
              {t("pillarsTitle")}
            </h2>

            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.8,
                color: "var(--color-text)",
              }}
            >
              {t("pillarsIntro")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-gold)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "0.75rem",
                  textAlign: "center",
                }}
              >
                {t("pillar1Title")}
              </h3>

              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: "1.6",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pillar1Text")}
              </p>
            </div>

            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-primary)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "0.75rem",
                  textAlign: "center",
                }}
              >
                {t("pillar2Title")}
              </h3>

              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: "1.6",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pillar2Text")}
              </p>
            </div>

            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-success)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "0.75rem",
                  textAlign: "center",
                }}
              >
                {t("pillar3Title")}
              </h3>

              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: "1.6",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pillar3Text")}
              </p>
            </div>

            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-warning)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: "2rem", height: "2rem" }}
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V8l7-5 7 5v13" />
                  <path d="M9 21v-5h6v5" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "0.75rem",
                  textAlign: "center",
                }}
              >
                {t("pillar4Title")}
              </h3>

              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: "1.6",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pillar4Text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== PÔLES D'EXPERTISE ============== */}
      <section
        style={{
          padding: "6rem 0",
          background: "var(--color-bg)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            <span
              className="section-kicker"
              style={{
                color: "var(--color-gold)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
                display: "inline-block",
              }}
            >
              {t("expertiseKicker")}
            </span>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--color-primary)",
                marginBottom: "1rem",
              }}
            >
              {t("expertiseTitle")}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-gold)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: "1.5rem", height: "1.5rem" }}
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {t("pole1Title")}
              </h3>

              <span
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pole1Obj")}
              </span>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole1Item1")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole1Item2")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole1Item3")}
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-primary)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: "1.5rem", height: "1.5rem" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {t("pole2Title")}
              </h3>

              <span
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pole2Obj")}
              </span>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole2Item1")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole2Item2")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole2Item3")}
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-success)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: "1.5rem", height: "1.5rem" }}
                >
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {t("pole3Title")}
              </h3>

              <span
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pole3Obj")}
              </span>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole3Item1")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole3Item2")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole3Item3")}
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "2.5rem 2rem",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--color-border)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 auto 1.5rem",
                  background: "var(--color-warning)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: "1.5rem", height: "1.5rem" }}
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V8l7-5 7 5v13" />
                  <path d="M9 21v-5h6v5" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {t("pole4Title")}
              </h3>

              <span
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {t("pole4Obj")}
              </span>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole4Item1")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole4Item2")}
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                  }}
                >
                  {t("pole4Item3")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============== POURQUOI CHOISIR FEDPAWA ============== */}
      <section
        style={{
          padding: "6rem 0",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            <span
              className="section-kicker"
              style={{
                color: "var(--color-gold)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
                display: "inline-block",
              }}
            >
              {t("compareKicker")}
            </span>

            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--color-primary)",
                marginBottom: "1rem",
              }}
            >
              {t("compareTitle")}
            </h2>

            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.8,
                color: "var(--color-text)",
              }}
            >
              {t("compareIntro")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "32px",
            }}
          >
            <div
              style={{
                padding: "2rem",
                borderRadius: "20px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h4
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                {t("compareHeadTradition")}
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: "auto auto",
                  gap: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    color: "var(--color-text)",
                  }}
                >
                  {t("row1Tradition")}
                </p>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    color: "var(--color-text)",
                  }}
                >
                  {t("row2Tradition")}
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "2rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "1px solid var(--color-gold)",
              }}
            >
              <h4
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--color-gold)",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                {t("compareHeadFedpawa")}
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: "auto auto",
                  gap: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    color: "var(--color-text)",
                  }}
                >
                  {t("row1Fedpawa")}
                </p>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    color: "var(--color-text)",
                  }}
                >
                  {t("row2Fedpawa")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA FINAL ============== */}
      <section
        style={{
          padding: "6rem 0",
          background: "var(--color-primary)",
          color: "var(--color-bg)",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              {t("ctaTitle")}
            </h2>

            <p
              style={{
                fontSize: "1.25rem",
                lineHeight: "1.7",
                opacity: 0.9,
              }}
            >
              {t("ctaText")}
            </p>

            <Link
              href={routes.contact}
              style={{
                background: "var(--color-gold)",
                color: "var(--color-bg)",
                fontWeight: 500,
                padding: "14px 40px",
                borderRadius: "8px",
                fontSize: "1.1rem",
                marginTop: "2rem",
                display: "inline-block",
                transition: "background 0.2s",
              }}
              className="btn btn-gold"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </div>
      </section>

      {/* ============== LIGHTBOX ============== */}
      <div
        className={`lightbox${lightboxSrc ? " open" : ""}`}
        id="lightbox"
        onClick={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).classList.contains("lightbox-close")
          ) {
            setLightboxSrc(null);
          }
        }}
      >
        <span className="lightbox-close">&times;</span>
        <img
          src={lightboxSrc ?? "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="}
          id="lightboxImg"
          alt={t("galleryLightboxAlt")}
        />
      </div>

      {/* ============== MODALE RENDEZ-VOUS ============== */}
      <div
        className={`modal-overlay${rdvOpen ? " open" : ""}`}
        id="appointmentModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setRdvOpen(false);
        }}
      >
        <div className="modal-box">
          <button
            type="button"
            className="modal-close"
            aria-label={t("modalCloseLabel")}
            onClick={() => setRdvOpen(false)}
          >
            &times;
          </button>

          <div className="modal-header">
            <h3>{t("modalTitle")}</h3>
            <p>{t("modalIntro")}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.alert(t("modalSuccess"));
              setRdvSent(true);
              setRdvOpen(false);
            }}
          >
            <div className="form-group">
              <label>{t("modalReasonLabel")}</label>
              <select className="form-control" required>
                <option value="">{t("modalReasonPlaceholder")}</option>
                <option>{t("modalReason1")}</option>
                <option>{t("modalReason2")}</option>
                <option>{t("modalReason3")}</option>
                <option>{t("modalReason4")}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("modalNameLabel")}</label>
              <input
                type="text"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>{t("modalPhoneLabel")}</label>
              <input
                type="tel"
                className="form-control"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {t("modalSubmit")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
// ============================================================
// FEDPAWA — Qui sommes-nous 2 (copie remaniée de About.tsx)
// 12 éléments de style "about-vision-box" (fond bleu, bordure or,
// texte blanc) répartis sur 3 sections : Nos Valeurs, Savoir-Faire,
// Notre Différence. Sans l'emoji 🎯 dans les titres.
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";

export interface About2Props {
  locale?: Locale;
}

/** Item de galerie source : image + classe taille + légende. */
// 12 images uniformisées 736×736 extraites de QUI_final.zip (crop centré équitable).
const GALLERY: {
  img: string;
  cls: string;
  captionFr: string;
  captionEn: string;
  altFr: string;
  altEn: string;
}[] = [
  { img: "qui_1", cls: "", captionFr: "Découverte FEDPAWA", captionEn: "Discover FEDPAWA", altFr: "Image FEDPAWA 1", altEn: "FEDPAWA image 1" },
  { img: "qui_2", cls: "", captionFr: "Espace FEDPAWA", captionEn: "FEDPAWA Space", altFr: "Image FEDPAWA 2", altEn: "FEDPAWA image 2" },
  { img: "qui_3", cls: "", captionFr: "Univers FEDPAWA", captionEn: "FEDPAWA Universe", altFr: "Image FEDPAWA 3", altEn: "FEDPAWA image 3" },
  { img: "qui_4", cls: "", captionFr: "Médias & Vidéos", captionEn: "Media & Videos", altFr: "Médias et vidéos verticales", altEn: "Vertical media and videos" },
  { img: "qui_5", cls: "", captionFr: "Stratégie d'Entreprise", captionEn: "Corporate Strategy", altFr: "Stratégie d'entreprise", altEn: "Corporate strategy" },
  { img: "qui_6", cls: "", captionFr: "Numérisation & Digitalisation", captionEn: "Digitization & Digitalization", altFr: "Numérisation et digitalisation", altEn: "Digitization and digitalization" },
  { img: "qui_7", cls: "", captionFr: "Formalités en Ligne", captionEn: "Online Formalities", altFr: "Formalités administratives en ligne", altEn: "Online administrative formalities" },
  { img: "qui_8", cls: "", captionFr: "Bien-être & Ergonomie", captionEn: "Wellness & Ergonomics", altFr: "Bien-être et ergonomie au travail", altEn: "Wellness and ergonomics at work" },
  { img: "qui_9", cls: "", captionFr: "Services aux Talents", captionEn: "Talent Services", altFr: "Services aux talents", altEn: "Talent services" },
  { img: "qui_10", cls: "", captionFr: "Cession d'Entreprise", captionEn: "Business Exit", altFr: "Raisons de cession d'entreprise", altEn: "Business owners selling reasons" },
  { img: "qui_11", cls: "", captionFr: "Transition 5.0", captionEn: "Transition 5.0", altFr: "Transition industrielle 5.0", altEn: "Industry transition 5.0" },
  { img: "qui_12", cls: "", captionFr: "Téléphonie d'Entreprise", captionEn: "Business Phone Systems", altFr: "Système téléphonique d'entreprise", altEn: "Business phone systems" },
];

/** Bloc de style "about-vision-box" reproduit exactement :
 *  fond bleu #1A237E, bordure gauche or, padding 40px, texte blanc,
 *  image en haut, titre h3 sans emoji, texte p en dessous.
 */
function AboutBoxElement({
  img,
  title,
  text,
  onOpen,
}: {
  img: string;
  title: string;
  text: string;
  onOpen: (img: string) => void;
}) {
  return (
    <div
      className="about-vision-box"
      style={{
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={() => onOpen(img)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 15px 40px rgba(26, 35, 126, 0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px rgba(26, 35, 126, 0.2)";
      }}
    >
      <div className="about-vision-photo" style={{ marginBottom: "16px" }}>
        <picture>
          <source type="image/webp" srcSet={`/assets/images/${img}.webp`} />
          <img
            src={`/assets/images/${img}.jpg`}
            alt={title}
            loading="lazy"
            style={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              display: "block",
              borderRadius: 8,
            }}
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
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.95rem",
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default function About2({ locale = "fr" }: About2Props) {
  const t = getPageDictionary(locale, "qui-sommes-nous");
  const routes = routesFor(locale);
  const cap = (img: string) => {
    const item = GALLERY.find((g) => g.img === img)!;
    return locale === "en" ? item.captionEn : item.captionFr;
  };
  const alt = (img: string) => {
    const item = GALLERY.find((g) => g.img === img)!;
    return locale === "en" ? item.altEn : item.altFr;
  };

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  useEffect(() => {
    document.body.style.overflow = lightboxSrc ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxSrc]);

  // Compteurs animés
  const counters: { target: number; decimals: number; suffix: string }[] = [
    { target: 300, decimals: 0, suffix: t.stat1Suffix },
    { target: 17, decimals: 0, suffix: t.stat2Suffix },
    { target: 99.8, decimals: 1, suffix: "%" },
    { target: 100, decimals: 0, suffix: t.stat4Suffix },
  ];
  const [counterValues, setCounterValues] = useState<number[]>(
    counters.map(() => 0),
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
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Modale Rendez-vous
  const [rdvOpen, setRdvOpen] = useState(false);
  const [rdvSent, setRdvSent] = useState(false);
  useEffect(() => {
    document.body.style.overflow = rdvOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [rdvOpen]);

  const openLightbox = (img: string) => {
    setLightboxSrc(`/assets/images/${img}.jpg`);
  };

  // ========== DONNÉES DES 12 ÉLÉMENTS (4+4+4) ==========
  const valeursElements = [
    {
      img: "qui_1",
      title: t.pillar1Title,
      text: t.pillar1Text,
    },
    {
      img: "qui_7",
      title: t.pillar2Title,
      text: t.pillar2Text,
    },
    {
      img: "qui_11",
      title: t.pillar3Title,
      text: t.pillar3Text,
    },
    {
      img: "qui_8",
      title: t.pillar4Title,
      text: t.pillar4Text,
    },
  ];

  const savoirFaireElements = [
    {
      img: "qui_10",
      title: t.pole1Title,
      text: `${t.pole1Obj} ${t.pole1Item1} ${t.pole1Item2} ${t.pole1Item3}`,
    },
    {
      img: "qui_4",
      title: t.pole2Title,
      text: `${t.pole2Obj} ${t.pole2Item1} ${t.pole2Item2} ${t.pole2Item3}`,
    },
    {
      img: "qui_5",
      title: t.pole3Title,
      text: `${t.pole3Obj} ${t.pole3Item1} ${t.pole3Item2} ${t.pole3Item3}`,
    },
    {
      img: "qui_2",
      title: t.pole4Title,
      text: `${t.pole4Obj} ${t.pole4Item1} ${t.pole4Item2} ${t.pole4Item3}`,
    },
  ];

  const differenceElements = [
    {
      img: "qui_3",
      title: t.compareHeadTradition,
      text: `${t.row1Tradition} ${t.row2Tradition}`,
    },
    {
      img: "qui_9",
      title: t.compareHeadFedpawa,
      text: `${t.row1Fedpawa} ${t.row2Fedpawa}`,
    },
    {
      img: "qui_12",
      title: t.compareHeadCriteria,
      text: `${t.row3Criteria} ${t.row4Criteria}`,
    },
    {
      img: "qui_6",
      title: t.visionTitle.replace("🎯 ", ""),
      text: t.visionText,
    },
  ];

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 32,
    marginBottom: 40,
  };

  return (
    <>
      {/* ============== HERO ============== */}
      <section className="page-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">{t.heroBadge}</div>
            <h1>{t.heroTitle}</h1>
            <p className="subtitle">{t.heroSubtitle}</p>
            <p>{t.heroText}</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link href={routes.domiciliation} className="btn btn-gold">
                {t.heroCtaPrimary}
              </Link>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setRdvOpen(true)}
              >
                {t.heroCtaModal}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============== HISTOIRE & VISION ============== */}
      <section className="oapi-risk-section">
        <div className="container">
          <div className="oapi-risk-grid">
            <div className="oapi-risk-text">
              <span className="section-kicker">{t.historyKicker}</span>
              <h2>{t.historyTitle}</h2>
              <p>{t.historyText1}</p>
              <p>{t.historyText2}</p>
            </div>
            <div className="about-vision-box">
              <div className="about-vision-photo">
                <picture>
                  <source type="image/webp" srcSet="/assets/images/qui_6.webp" />
                  <img
                    src="/assets/images/qui_6.jpg"
                    alt={t.visionImgAlt}
                    loading="lazy"
                  />
                </picture>
              </div>
              <h3>{t.visionTitle.replace("🎯 ", "")}</h3>
              <p>{t.visionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CHIFFRES CLÉS ============== */}
      <section className="stats-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 40 }}>
            <span className="section-kicker" style={{ color: "var(--color-gold)", justifyContent: "center" }}>
              {t.statsKicker}
            </span>
            <h2 style={{ color: "#fff" }}>{t.statsTitle}</h2>
          </div>
          <div className="stats-wrap" ref={statsRef}>
            <div className="stat-item">
              <span className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-5h6v5" />
                </svg>
              </span>
              <strong className="stat-counter">
                {counterValues[0].toFixed(0)}
                {t.stat1Suffix}
              </strong>
              <span>{t.stat1Label}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <strong className="stat-counter">
                {counterValues[1].toFixed(0)}
                {t.stat2Suffix}
              </strong>
              <span>{t.stat2Label}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <strong className="stat-counter">
                {counterValues[2].toFixed(1)}%
              </strong>
              <span>{t.stat3Label}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <strong className="stat-counter">
                {counterValues[3].toFixed(0)}
                {t.stat4Suffix}
              </strong>
              <span>{t.stat4Label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============== NOS VALEURS — 4 PILIERS (style about-vision-box) ============== */}
      <section className="section-padding section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">{t.pillarsKicker}</span>
            <h2>{t.pillarsTitle}</h2>
            <p>{t.pillarsIntro}</p>
          </div>
          <div style={gridStyle}>
            {valeursElements.map((el, i) => (
              <AboutBoxElement key={i} img={el.img} title={el.title} text={el.text} onOpen={openLightbox} />
            ))}
          </div>
        </div>
      </section>

      {/* ============== NOTRE SAVOIR-FAIRE — 4 PÔLES (style about-vision-box) ============== */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">{t.expertiseKicker}</span>
            <h2>{t.expertiseTitle}</h2>
          </div>
          <div style={gridStyle}>
            {savoirFaireElements.map((el, i) => (
              <AboutBoxElement key={i} img={el.img} title={el.title} text={el.text} onOpen={openLightbox} />
            ))}
          </div>
        </div>
      </section>

      {/* ============== NOTRE DIFFÉRENCE — 4 ÉLÉMENTS (style about-vision-box) ============== */}
      <section className="comparison-section">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">{t.compareKicker}</span>
            <h2>{t.compareTitle}</h2>
            <p>{t.compareIntro}</p>
          </div>
          <div style={gridStyle}>
            {differenceElements.map((el, i) => (
              <AboutBoxElement key={i} img={el.img} title={el.title} text={el.text} onOpen={openLightbox} />
            ))}
          </div>
        </div>
      </section>

      {/* ============== CTA FINAL ============== */}
      <section className="cta-banner-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <Link href={routes.contact} className="btn btn-gold">{t.ctaButton}</Link>
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
          src={
            lightboxSrc ??
            "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
          }
          id="lightboxImg"
          alt={t.galleryLightboxAlt}
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
            aria-label={t.modalCloseLabel}
            onClick={() => setRdvOpen(false)}
          >
            &times;
          </button>
          <div className="modal-header">
            <h3>{t.modalTitle}</h3>
            <p>{t.modalIntro}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.alert(t.modalSuccess);
              setRdvSent(true);
              setRdvOpen(false);
            }}
          >
            <div className="form-group">
              <label>{t.modalReasonLabel}</label>
              <select className="form-control" required>
                <option value="">{t.modalReasonPlaceholder}</option>
                <option>{t.modalReason1}</option>
                <option>{t.modalReason2}</option>
                <option>{t.modalReason3}</option>
                <option>{t.modalReason4}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.modalNameLabel}</label>
              <input type="text" className="form-control" required />
            </div>
            <div className="form-group">
              <label>{t.modalPhoneLabel}</label>
              <input type="tel" className="form-control" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              {t.modalSubmit}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

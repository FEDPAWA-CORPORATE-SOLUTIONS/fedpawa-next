// ============================================================
// FEDPAWA — Nos Valeurs / Savoir-Faire / Différence (nos-3)
// Design A : "Vision Box Élégante"
// Règle : titre de section, puis alternance stricte image | bloc texte
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";

export interface AboutNos3Props {
  locale?: Locale;
}

const GALLERY: {
  img: string;
  captionFr: string;
  captionEn: string;
  altFr: string;
  altEn: string;
}[] = [
  { img: "qui_1", captionFr: "Découverte FEDPAWA", captionEn: "Discover FEDPAWA", altFr: "Image FEDPAWA 1", altEn: "FEDPAWA image 1" },
  { img: "qui_7", captionFr: "Formalités en Ligne", captionEn: "Online Formalities", altFr: "Formalités administratives", altEn: "Online administrative formalities" },
  { img: "qui_11", captionFr: "Transition 5.0", captionEn: "Transition 5.0", altFr: "Transition 5.0", altEn: "Industry transition 5.0" },
  { img: "qui_8", captionFr: "Bien-être & Ergonomie", captionEn: "Wellness & Ergonomics", altFr: "Bien-être et ergonomie", altEn: "Wellness and ergonomics" },
  { img: "qui_10", captionFr: "Cession d'Entreprise", captionEn: "Business Exit", altFr: "Cession d'entreprise", altEn: "Business exit" },
  { img: "qui_4", captionFr: "Médias & Vidéos", captionEn: "Media & Videos", altFr: "Médias et vidéos", altEn: "Media and videos" },
  { img: "qui_5", captionFr: "Stratégie d'Entreprise", captionEn: "Corporate Strategy", altFr: "Stratégie d'entreprise", altEn: "Corporate strategy" },
  { img: "qui_2", captionFr: "Espace FEDPAWA", captionEn: "FEDPAWA Space", altFr: "Espace FEDPAWA", altEn: "FEDPAWA space" },
  { img: "qui_3", captionFr: "Univers FEDPAWA", captionEn: "FEDPAWA Universe", altFr: "Univers FEDPAWA", altEn: "FEDPAWA universe" },
  { img: "qui_9", captionFr: "Services aux Talents", captionEn: "Talent Services", altFr: "Services aux talents", altEn: "Talent services" },
  { img: "qui_12", captionFr: "Téléphonie d'Entreprise", captionEn: "Business Phone Systems", altFr: "Téléphonie d'entreprise", altEn: "Business phone systems" },
];

function caption(locale: Locale, img: string) {
  const item = GALLERY.find((g) => g.img === img);
  if (!item) return img;
  return locale === "en" ? item.captionEn : item.captionFr;
}
function alt(locale: Locale, img: string) {
  const item = GALLERY.find((g) => g.img === img);
  if (!item) return img;
  return locale === "en" ? item.altEn : item.altFr;
}

/** Bloc image | texte — style about-vision-box : carte élégante, fond sombre, bordure or */
function VisionPair({
  img,
  reversed,
  children,
  onOpen,
  locale,
}: {
  img: string;
  reversed?: boolean;
  children: React.ReactNode;
  onOpen: (img: string) => void;
  locale: Locale;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "40px",
        alignItems: "center",
        marginBottom: "56px",
      }}
    >
      <figure
        style={{
          margin: 0,
          borderRadius: "16px",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 12px 36px rgba(10, 14, 24, 0.18)",
          order: reversed ? 2 : 1,
          border: "1px solid rgba(212, 175, 55, 0.25)",
        }}
        onClick={() => onOpen(img)}
      >
        <div style={{ borderRadius: "16px", overflow: "hidden" }}>
          <picture>
            <source type="image/webp" srcSet={`/assets/images/${img}.webp`} />
            <img
              src={`/assets/images/${img}.jpg`}
              alt={alt(locale, img)}
              loading="lazy"
              style={{ width: "100%", height: "420px", objectFit: "cover", display: "block" }}
            />
          </picture>
        </div>
      </figure>
      <div
        style={{
          order: reversed ? 1 : 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AboutNos3({ locale = "fr" }: AboutNos3Props) {
  const t = getPageDictionary(locale, "qui-sommes-nous");
  const routes = routesFor(locale);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [rdvOpen, setRdvOpenState] = useState(false);
  const [rdvSent, setRdvSentState] = useState(false);
  useEffect(() => {
    document.body.style.overflow = lightboxSrc ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxSrc]);
  useEffect(() => {
    document.body.style.overflow = rdvOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [rdvOpen]);

  const openLightbox = (img: string) => setLightboxSrc(`/assets/images/${img}.jpg`);

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
              <button type="button" className="btn btn-outline" onClick={() => setRdvOpenState(true)}>
                {t.heroCtaModal}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============== NOS VALEURS — Variation 1 : Image | Texte alterné ============== */}
      <section style={{ padding: "6rem 0", background: "var(--color-bg)" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="section-kicker" style={{ color: "var(--color-gold)", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", display: "inline-block" }}>
              {t.pillarsKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.3, color: "var(--color-primary)", marginBottom: "1rem" }}>{t.pillarsTitle}</h2>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.8, color: "var(--color-text)" }}>{t.pillarsIntro}</p>
          </div>

          {/* 1. Image | Texte */}
          <VisionPair img="qui_1" reversed={false} locale={locale} onOpen={openLightbox}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem", lineHeight: 1.4 }}>{t.pillar1Title}</h3>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-text-muted)", margin: 0 }}>{t.pillar1Text}</p>
          </VisionPair>

          {/* 2. Texte | Image */}
          <VisionPair img="qui_7" reversed={true} locale={locale} onOpen={openLightbox}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem", lineHeight: 1.4 }}>{t.pillar2Title}</h3>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-text-muted)", margin: 0 }}>{t.pillar2Text}</p>
          </VisionPair>

          {/* 3. Image | Texte */}
          <VisionPair img="qui_11" reversed={false} locale={locale} onOpen={openLightbox}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem", lineHeight: 1.4 }}>{t.pillar3Title}</h3>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-text-muted)", margin: 0 }}>{t.pillar3Text}</p>
          </VisionPair>

          {/* 4. Texte | Image */}
          <VisionPair img="qui_8" reversed={true} locale={locale} onOpen={openLightbox}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem", lineHeight: 1.4 }}>{t.pillar4Title}</h3>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--color-text-muted)", margin: 0 }}>{t.pillar4Text}</p>
          </VisionPair>
        </div>
      </section>

      {/* ============== NOTRE SAVOIR-FAIRE — Variation 2 : Texte | Image alterné ============== */}
      <section style={{ padding: "6rem 0", background: "var(--color-bg-alt)" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="section-kicker" style={{ color: "var(--color-gold)", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", display: "inline-block" }}>
              {t.expertiseKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.3, color: "var(--color-primary)", marginBottom: "1rem" }}>{t.expertiseTitle}</h2>
          </div>

          <VisionPair img="qui_10" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.5rem" }}>{t.pole1Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>{t.pole1Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole1Item1}</li>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole1Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole1Item3}</li>
              </ul>
            </div>
          </VisionPair>

          <VisionPair img="qui_4" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.5rem" }}>{t.pole2Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>{t.pole2Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole2Item1}</li>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole2Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole2Item3}</li>
              </ul>
            </div>
          </VisionPair>

          <VisionPair img="qui_5" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.5rem" }}>{t.pole3Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>{t.pole3Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole3Item1}</li>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole3Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole3Item3}</li>
              </ul>
            </div>
          </VisionPair>

          <VisionPair img="qui_2" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.5rem" }}>{t.pole4Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>{t.pole4Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole4Item1}</li>
                <li style={{ marginBottom: "0.5rem", paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole4Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1.2rem", position: "relative" }}>:: {t.pole4Item3}</li>
              </ul>
            </div>
          </VisionPair>
        </div>
      </section>

      {/* ============== NOTRE DIFFÉRENCE — Variation 3 : Carte encadrée or ============== */}
      <section style={{ padding: "6rem 0", background: "var(--color-bg)" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="section-kicker" style={{ color: "var(--color-gold)", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", display: "inline-block" }}>
              {t.compareKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.3, color: "var(--color-primary)", marginBottom: "1rem" }}>{t.compareTitle}</h2>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.8, color: "var(--color-text)" }}>{t.compareIntro}</p>
          </div>

          {/* Approche traditionnelle | Image */}
          <VisionPair img="qui_3" reversed={false} locale={locale} onOpen={openLightbox}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "1.5rem", background: "rgba(10, 14, 24, 0.04)", borderRadius: "12px", border: "1px solid rgba(10, 14, 24, 0.08)" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadTradition}</h4>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text-muted)", margin: 0 }}>{t.row1Tradition}</p>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text-muted)", marginTop: "0.75rem", marginBottom: 0 }}>{t.row2Tradition}</p>
              </div>
            </div>
          </VisionPair>

          {/* Image | Approche FEDPAWA */}
          <VisionPair img="qui_9" reversed={true} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.04) 100%)", borderRadius: "12px", border: "1px solid rgba(212, 175, 55, 0.35)" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadFedpawa}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text)", margin: 0 }}>{t.row1Fedpawa}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text)", marginTop: "0.75rem", marginBottom: 0 }}>{t.row2Fedpawa}</p>
            </div>
          </VisionPair>

          {/* Image | Approche traditionnelle (suite) */}
          <VisionPair img="qui_12" reversed={false} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "rgba(10, 14, 24, 0.04)", borderRadius: "12px", border: "1px solid rgba(10, 14, 24, 0.08)" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadCriteria}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text-muted)", margin: 0 }}>{t.row3Criteria}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text-muted)", marginTop: "0.75rem", marginBottom: 0 }}>{t.row4Criteria}</p>
            </div>
          </VisionPair>

          {/* Texte | Approche FEDPAWA (suite) */}
          <VisionPair img="qui_6" reversed={true} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.04) 100%)", borderRadius: "12px", border: "1px solid rgba(212, 175, 55, 0.35)" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadFedpawa}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text)", margin: 0 }}>{t.row3Fedpawa}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--color-text)", marginTop: "0.75rem", marginBottom: 0 }}>{t.row4Fedpawa}</p>
            </div>
          </VisionPair>
        </div>
      </section>

      {/* ============== CTA FINAL ============== */}
      <section className="cta-banner-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <Link href={routes.contact} className="btn btn-gold">
            {t.ctaButton}
          </Link>
        </div>
      </section>

      {/* ============== LIGHTBOX ============== */}
      <div className={`lightbox${lightboxSrc ? " open" : ""}`} id="lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightboxSrc(null); }}>
        <span className="lightbox-close">&times;</span>
        <img src={lightboxSrc ?? "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} id="lightboxImg" alt={t.galleryLightboxAlt} />
      </div>

      {/* ============== MODALE RENDEZ-VOUS ============== */}
      <div className={`modal-overlay${rdvOpen ? " open" : ""}`} id="appointmentModal" onClick={(e) => { if (e.target === e.currentTarget) setRdvOpenState(false); }}>
        <div className="modal-box">
          <button type="button" className="modal-close" aria-label={t.modalCloseLabel} onClick={() => setRdvOpenState(false)}>&times;</button>
          <div className="modal-header"><h3>{t.modalTitle}</h3><p>{t.modalIntro}</p></div>
          <form onSubmit={(e) => { e.preventDefault(); window.alert(t.modalSuccess); setRdvSentState(true); setRdvOpenState(false); }}>
            <div className="form-group"><label>{t.modalReasonLabel}</label><select className="form-control" required><option value="">{t.modalReasonPlaceholder}</option><option>{t.modalReason1}</option><option>{t.modalReason2}</option><option>{t.modalReason3}</option><option>{t.modalReason4}</option></select></div>
            <div className="form-group"><label>{t.modalNameLabel}</label><input type="text" className="form-control" required /></div>
            <div className="form-group"><label>{t.modalPhoneLabel}</label><input type="tel" className="form-control" required /></div>
            <button type="submit" className="btn btn-primary btn-block">{t.modalSubmit}</button>
          </form>
        </div>
      </div>
    </>
  );
}

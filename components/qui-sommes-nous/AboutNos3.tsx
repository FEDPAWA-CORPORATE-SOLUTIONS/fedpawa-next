// ============================================================
// FEDPAWA — Nos Valeurs / Savoir-Faire / Différence (nos-3)
// Design A : "Minimaliste Élégante"
// Famille de style : fond blanc/gris chaud, accents or subtils,
// cartes épurées, image et texte de même largeur, espacement réduit.
// Règle : titre de section, puis alternance image | bloc texte.
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

/**
 * Paire image | texte — Design A Minimaliste Élégante
 * - Image et texte ont exactement la même largeur (flex: 1)
 * - Carte blanche avec bordure très fine et ombre légère
 * - Accent or discret en haut de la carte
 * - Espacement réduit entre les groupes (margin-bottom: 24px)
 */
function ElegantPair({
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
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginBottom: 24,
        borderRadius: 10,
        overflow: "hidden",
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        boxShadow: "0 2px 8px rgba(10, 14, 24, 0.06)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }} />

      <figure
        style={{
          margin: 0,
          flex: 1,
          minHeight: 260,
          cursor: "pointer",
          overflow: "hidden",
          order: reversed ? 2 : 1,
        }}
        onClick={() => onOpen(img)}
      >
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <picture>
            <source type="image/webp" srcSet={`/assets/images/${img}.webp`} />
            <img
              src={`/assets/images/${img}.jpg`}
              alt={alt(locale, img)}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </picture>
        </div>
      </figure>

      <div
        style={{
          flex: 1,
          minHeight: 260,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 24,
          order: reversed ? 1 : 2,
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
      <section style={{ padding: "5rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-kicker" style={{ color: "#d4af37", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", display: "inline-block" }}>
              {t.pillarsKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.3, color: "#1f2937", marginBottom: "0.75rem" }}>{t.pillarsTitle}</h2>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#4b5563", maxWidth: 700, margin: "0 auto" }}>{t.pillarsIntro}</p>
          </div>

          <ElegantPair img="qui_1" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar1Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#4b5563", margin: 0 }}>{t.pillar1Text}</p>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_7" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar2Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#4b5563", margin: 0 }}>{t.pillar2Text}</p>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_11" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar3Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#4b5563", margin: 0 }}>{t.pillar3Text}</p>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_8" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar4Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#4b5563", margin: 0 }}>{t.pillar4Text}</p>
            </div>
          </ElegantPair>
        </div>
      </section>

      {/* ============== NOTRE SAVOIR-FAIRE — Variation 2 : Texte | Image alterné ============== */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-kicker" style={{ color: "#d4af37", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", display: "inline-block" }}>
              {t.expertiseKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.3, color: "#1f2937", marginBottom: "0.75rem" }}>{t.expertiseTitle}</h2>
          </div>

          <ElegantPair img="qui_10" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>{t.pole1Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic" }}>{t.pole1Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole1Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole1Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole1Item3}</li>
              </ul>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_4" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>{t.pole2Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic" }}>{t.pole2Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole2Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole2Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole2Item3}</li>
              </ul>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_5" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>{t.pole3Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic" }}>{t.pole3Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole3Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole3Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole3Item3}</li>
              </ul>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_2" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>{t.pole4Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic" }}>{t.pole4Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole4Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole4Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#1f2937" }}>:: {t.pole4Item3}</li>
              </ul>
            </div>
          </ElegantPair>
        </div>
      </section>

      {/* ============== NOTRE DIFFÉRENCE — Variation 3 : Carte encadrée or ============== */}
      <section style={{ padding: "5rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-kicker" style={{ color: "#d4af37", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", display: "inline-block" }}>
              {t.compareKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.3, color: "#1f2937", marginBottom: "0.75rem" }}>{t.compareTitle}</h2>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#4b5563", maxWidth: 700, margin: "0 auto" }}>{t.compareIntro}</p>
          </div>

          <ElegantPair img="qui_3" reversed={false} locale={locale} onOpen={openLightbox}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "1.5rem", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e5e5" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadTradition}</h4>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#4b5563", margin: 0 }}>{t.row1Tradition}</p>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#4b5563", marginTop: "0.75rem", marginBottom: 0 }}>{t.row2Tradition}</p>
              </div>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_9" reversed={true} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "#fdf7ec", borderRadius: 8, border: "1px solid #fed7aa" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadFedpawa}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#78350f", margin: 0 }}>{t.row1Fedpawa}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#78350f", marginTop: "0.75rem", marginBottom: 0 }}>{t.row2Fedpawa}</p>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_12" reversed={false} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e5e5" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadCriteria}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#4b5563", margin: 0 }}>{t.row3Criteria}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#4b5563", marginTop: "0.75rem", marginBottom: 0 }}>{t.row4Criteria}</p>
            </div>
          </ElegantPair>

          <ElegantPair img="qui_6" reversed={true} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "#fdf7ec", borderRadius: 8, border: "1px solid #fed7aa" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadFedpawa}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#78350f", margin: 0 }}>{t.row3Fedpawa}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#78350f", marginTop: "0.75rem", marginBottom: 0 }}>{t.row4Fedpawa}</p>
            </div>
          </ElegantPair>
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

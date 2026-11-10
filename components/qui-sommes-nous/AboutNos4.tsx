// ============================================================
// FEDPAWA — Nos Valeurs / Savoir-Faire / Différence (nos-4)
// Design B : "Corporate Or & Nuit"
// Famille de style : fond bleu nuit profond, cartes sombres,
// accents or marqués, image et texte de même largeur,
// espacement réduit entre les groupes.
// Règle : titre de section, puis alternance bloc texte | image.
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";

export interface AboutNos4Props {
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
 * Paire texte | image — Design B Corporate Or & Nuit
 * - Image et texte ont exactement la même largeur (flex: 1)
 * - Carte sombre avec bordure or et fond dégradé nuit
 * - Icône or en haut du bloc texte
 * - Espacement réduit entre les groupes (margin-bottom: 24px)
 */
function CorporatePair({
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
        borderRadius: 12,
        background: "#111827",
        border: "1px solid rgba(212, 175, 55, 0.35)",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }} />

      <div
        style={{
          flex: 1,
          minHeight: 240,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 24,
          order: reversed ? 2 : 1,
        }}
      >
        {children}
      </div>

      <figure
        style={{
          margin: 0,
          flex: 1,
          minHeight: 240,
          cursor: "pointer",
          overflow: "hidden",
          order: reversed ? 1 : 2,
          borderRadius: "0 12px 12px 0",
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
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(20%)" }}
            />
          </picture>
        </div>
      </figure>
    </div>
  );
}

export default function AboutNos4({ locale = "fr" }: AboutNos4Props) {
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

      {/* ============== NOS VALEURS — Variation 1 : Texte | Image, carte or ============== */}
      <section style={{ padding: "5rem 0", background: "#0a1120" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-kicker" style={{ color: "#d4af37", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.75rem", display: "inline-block" }}>
              {t.pillarsKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.3, color: "#ffffff", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>{t.pillarsTitle}</h2>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#9ca3af", maxWidth: 700, margin: "0 auto" }}>{t.pillarsIntro}</p>
          </div>

          <CorporatePair img="qui_1" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <div style={{ width: "40px", height: "40px", background: "#d4af37", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={2} style={{ width: "1.25rem", height: "1.25rem" }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar1Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#d1d5db", margin: 0 }}>{t.pillar1Text}</p>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_7" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <div style={{ width: "40px", height: "40px", background: "#d4af37", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={2} style={{ width: "1.25rem", height: "1.25rem" }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar2Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#d1d5db", margin: 0 }}>{t.pillar2Text}</p>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_11" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <div style={{ width: "40px", height: "40px", background: "#d4af37", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={2} style={{ width: "1.25rem", height: "1.25rem" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar3Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#d1d5db", margin: 0 }}>{t.pillar3Text}</p>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_8" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <div style={{ width: "40px", height: "40px", background: "#d4af37", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={2} style={{ width: "1.25rem", height: "1.25rem" }}>
                  <path d="M3 21h18" />
                  <path d="M5 21V8l7-5 7 5v13" />
                  <path d="M9 21v-5h6v5" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.pillar4Title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#d1d5db", margin: 0 }}>{t.pillar4Text}</p>
            </div>
          </CorporatePair>
        </div>
      </section>

      {/* ============== NOTRE SAVOIR-FAIRE — Variation 2 : Texte | Image, bordure or ============== */}
      <section style={{ padding: "5rem 0", background: "#0a1120" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-kicker" style={{ color: "#d4af37", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.75rem", display: "inline-block" }}>
              {t.expertiseKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.3, color: "#ffffff", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>{t.expertiseTitle}</h2>
          </div>

          <CorporatePair img="qui_10" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>{t.pole1Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#d1d5db", fontStyle: "italic" }}>{t.pole1Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#d1d5db", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole1Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole1Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole1Item3}</li>
              </ul>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_4" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>{t.pole2Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#d1d5db", fontStyle: "italic" }}>{t.pole2Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#d1d5db", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole2Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole2Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole2Item3}</li>
              </ul>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_5" reversed={false} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>{t.pole3Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#d1d5db", fontStyle: "italic" }}>{t.pole3Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#d1d5db", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole3Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole3Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole3Item3}</li>
              </ul>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_2" reversed={true} locale={locale} onOpen={openLightbox}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>{t.pole4Title}</h3>
              <span style={{ display: "block", marginBottom: "1rem", fontSize: "0.875rem", color: "#d1d5db", fontStyle: "italic" }}>{t.pole4Obj}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#d1d5db", fontSize: "0.95rem", lineHeight: 1.7 }}>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole4Item1}</li>
                <li style={{ marginBottom: "0.4rem", paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole4Item2}</li>
                <li style={{ marginBottom: 0, paddingLeft: "1rem", position: "relative", color: "#ffffff" }}>:: {t.pole4Item3}</li>
              </ul>
            </div>
          </CorporatePair>
        </div>
      </section>

      {/* ============== NOTRE DIFFÉRENCE — Variation 3 : Texte | Image, blocs or ============== */}
      <section style={{ padding: "5rem 0", background: "#0a1120" }}>
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-kicker" style={{ color: "#d4af37", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.75rem", display: "inline-block" }}>
              {t.compareKicker}
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.3, color: "#ffffff", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>{t.compareTitle}</h2>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#9ca3af", maxWidth: 700, margin: "0 auto" }}>{t.compareIntro}</p>
          </div>

          <CorporatePair img="qui_3" reversed={false} locale={locale} onOpen={openLightbox}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "1.5rem", background: "rgba(212, 175, 55, 0.08)", borderRadius: 8, border: "1px solid rgba(212, 175, 55, 0.2)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadTradition}</h4>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#9ca3af", margin: 0 }}>{t.row1Tradition}</p>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#9ca3af", marginTop: "0.75rem", marginBottom: 0 }}>{t.row2Tradition}</p>
              </div>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_9" reversed={true} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "rgba(212, 175, 55, 0.12)", borderRadius: 8, border: "1px solid #d4af37" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#d4af37", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadFedpawa}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#ffffff", margin: 0 }}>{t.row1Fedpawa}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#ffffff", marginTop: "0.75rem", marginBottom: 0 }}>{t.row2Fedpawa}</p>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_12" reversed={false} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "rgba(212, 175, 55, 0.08)", borderRadius: 8, border: "1px solid rgba(212, 175, 55, 0.2)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadCriteria}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#9ca3af", margin: 0 }}>{t.row3Criteria}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#9ca3af", marginTop: "0.75rem", marginBottom: 0 }}>{t.row4Criteria}</p>
            </div>
          </CorporatePair>

          <CorporatePair img="qui_6" reversed={true} locale={locale} onOpen={openLightbox}>
            <div style={{ padding: "1.5rem", background: "rgba(212, 175, 55, 0.12)", borderRadius: 8, border: "1px solid #d4af37" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#d4af37", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t.compareHeadFedpawa}</h4>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#ffffff", margin: 0 }}>{t.row3Fedpawa}</p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#ffffff", marginTop: "0.75rem", marginBottom: 0 }}>{t.row4Fedpawa}</p>
            </div>
          </CorporatePair>
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

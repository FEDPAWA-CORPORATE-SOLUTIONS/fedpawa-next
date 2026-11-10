// ============================================================
// FEDPAWA — Nos Valeurs / Savoir-Faire / Différence (nos-3)
// Design A : "Minimaliste Élégante"
// Composant ActiveSection : grand carré (80% hauteur, côté courbé)
// + 3 cercles de sélection + bloc texte actif
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import ActiveSection from "@/components/qui-sommes-nous/ActiveSection";

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

  // ========== DONNÉES SECTION NOS VALEURS (3 piliers) ==========
  const valeursItems = [
    {
      img: "qui_1",
      title: t.pillar1Title,
      text: t.pillar1Text,
      caption: "Valeur 1",
      color: "#d4af37",
    },
    {
      img: "qui_7",
      title: t.pillar2Title,
      text: t.pillar2Text,
      caption: "Valeur 2",
      color: "#d4af37",
    },
    {
      img: "qui_11",
      title: t.pillar3Title,
      text: t.pillar3Text,
      caption: "Valeur 3",
      color: "#d4af37",
    },
  ];

  // ========== DONNÉES SECTION SAVOIR-FAIRE (3 pôles) ==========
  const savoirFaireItems = [
    {
      img: "qui_10",
      title: t.pole1Title,
      text: `${t.pole1Obj}. ${t.pole1Item1} ${t.pole1Item2} ${t.pole1Item3}`,
      caption: "Pôle 1",
      color: "#d4af37",
    },
    {
      img: "qui_4",
      title: t.pole2Title,
      text: `${t.pole2Obj}. ${t.pole2Item1} ${t.pole2Item2} ${t.pole2Item3}`,
      caption: "Pôle 2",
      color: "#d4af37",
    },
    {
      img: "qui_5",
      title: t.pole3Title,
      text: `${t.pole3Obj}. ${t.pole3Item1} ${t.pole3Item2} ${t.pole3Item3}`,
      caption: "Pôle 3",
      color: "#d4af37",
    },
  ];

  // ========== DONNÉES SECTION NOTRE DIFFÉRENCE (3 comparaisons) ==========
  const differenceItems = [
    {
      img: "qui_3",
      title: t.compareHeadTradition,
      text: `${t.row1Tradition} ${t.row2Tradition}`,
      caption: "Tradition",
      color: "#6b7280",
    },
    {
      img: "qui_9",
      title: t.compareHeadFedpawa,
      text: `${t.row1Fedpawa} ${t.row2Fedpawa}`,
      caption: "FEDPAWA",
      color: "#d4af37",
    },
    {
      img: "qui_12",
      title: t.compareHeadCriteria,
      text: `${t.row3Criteria} ${t.row4Criteria}`,
      caption: "Critères",
      color: "#6b7280",
    },
  ];

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

      {/* ============== NOS VALEURS — ActiveSection Variation 1 ============== */}
      <section style={{ padding: "5rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ActiveSection
            locale={locale}
            sectionTitle={t.pillarsTitle}
            items={valeursItems}
          />
        </div>
      </section>

      {/* ============== NOTRE SAVOIR-FAIRE — ActiveSection Variation 2 ============== */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ActiveSection
            locale={locale}
            sectionTitle={t.expertiseTitle}
            items={savoirFaireItems}
          />
        </div>
      </section>

      {/* ============== NOTRE DIFFÉRENCE — ActiveSection Variation 3 ============== */}
      <section style={{ padding: "5rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ActiveSection
            locale={locale}
            sectionTitle={t.compareTitle}
            items={differenceItems}
          />
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

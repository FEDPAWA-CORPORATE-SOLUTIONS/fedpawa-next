// ============================================================
// FEDPAWA — Nos Valeurs / Savoir-Faire / Différence (nos-3)
// 3 variantes de transition entre la v3 "Stacked Timeline"
// et le design minimaliste "About Us" (cartes, lignes fines,
// images en haut, icônes, texte épuré).
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import ActiveSectionNos3Transition from "@/components/qui-sommes-nous/ActiveSectionNos3Transition";

export default function Nos3Page({ locale = "fr" }: { locale?: Locale }) {
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

  const valeursItems = [
    {
      number: "01",
      title: t.pillar1Title,
      text: t.pillar1Text,
      image: "qui_1",
      icon: "building",
      color: "#d4af37",
    },
    {
      number: "02",
      title: t.pillar2Title,
      text: t.pillar2Text,
      image: "qui_7",
      icon: "document",
      color: "#111827",
    },
    {
      number: "03",
      title: t.pillar3Title,
      text: t.pillar3Text,
      image: "qui_11",
      icon: "users",
      color: "#d4af37",
    },
  ];

  const savoirFaireItems = [
    {
      number: "01",
      title: t.pole1Title,
      text: `${t.pole1Obj}. ${t.pole1Item1} ${t.pole1Item2} ${t.pole1Item3}`,
      image: "qui_10",
      icon: "camera",
      color: "#111827",
    },
    {
      number: "02",
      title: t.pole2Title,
      text: `${t.pole2Obj}. ${t.pole2Item1} ${t.pole2Item2} ${t.pole2Item3}`,
      image: "qui_4",
      icon: "printer",
      color: "#d4af37",
    },
    {
      number: "03",
      title: t.pole3Title,
      text: `${t.pole3Obj}. ${t.pole3Item1} ${t.pole3Item2} ${t.pole3Item3}`,
      image: "qui_5",
      icon: "phone",
      color: "#111827",
    },
  ];

  const differenceItems = [
    {
      number: "01",
      title: t.compareHeadTradition,
      text: `${t.row1Tradition} ${t.row2Tradition}`,
      image: "qui_3",
      icon: "document",
      color: "#6b7280",
    },
    {
      number: "02",
      title: t.compareHeadFedpawa,
      text: `${t.row1Fedpawa} ${t.row2Fedpawa}`,
      image: "qui_9",
      icon: "building",
      color: "#d4af37",
    },
    {
      number: "03",
      title: t.compareHeadCriteria,
      text: `${t.row3Criteria} ${t.row4Criteria}`,
      image: "qui_12",
      icon: "camera",
      color: "#6b7280",
    },
  ];

  return (
    <>
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

      {/* TRANSITION 1 : Stacked Minimal (proche de v3) — Nos Valeurs */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <ActiveSectionNos3Transition
            locale={locale}
            sectionTitle={t.pillarsTitle}
            items={valeursItems}
            transition={1}
          />
        </div>
      </section>

      {/* TRANSITION 2 : Card Center (intermédiaire) — Savoir-Faire */}
      <section style={{ padding: "5rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <ActiveSectionNos3Transition
            locale={locale}
            sectionTitle={t.expertiseTitle}
            items={savoirFaireItems}
            transition={2}
          />
        </div>
      </section>

      {/* TRANSITION 3 : About Us Style (proche de l'image) — Différence */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <ActiveSectionNos3Transition
            locale={locale}
            sectionTitle={t.compareTitle}
            items={differenceItems}
            transition={3}
          />
        </div>
      </section>

      <section className="cta-banner-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <Link href={routes.contact} className="btn btn-gold">{t.ctaButton}</Link>
        </div>
      </section>

      <div className={`lightbox${lightboxSrc ? " open" : ""}`} id="lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightboxSrc(null); }}>
        <span className="lightbox-close">&times;</span>
        <img src={lightboxSrc ?? "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} id="lightboxImg" alt={t.galleryLightboxAlt} />
      </div>

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

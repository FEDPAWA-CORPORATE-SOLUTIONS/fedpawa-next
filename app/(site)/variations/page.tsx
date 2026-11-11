// ============================================================
// FEDPAWA — Page /variations
// 4 variantes de présentation basées sur l'image de référence
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import ActiveSectionRemix from "@/components/qui-sommes-nous/ActiveSectionRemix";

export default function VariationsPage({ locale = "fr" }: { locale?: Locale }) {
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
    { number: "01", title: t.pillar1Title, text: t.pillar1Text, image: "qui_1", color: "#d4af37" },
    { number: "02", title: t.pillar2Title, text: t.pillar2Text, image: "qui_7", color: "#111827" },
    { number: "03", title: t.pillar3Title, text: t.pillar3Text, image: "qui_11", color: "#d4af37" },
  ];

  const savoirFaireItems = [
    { number: "01", title: t.pole1Title, text: `${t.pole1Obj}. ${t.pole1Item1} ${t.pole1Item2} ${t.pole1Item3}`, image: "qui_10", color: "#111827" },
    { number: "02", title: t.pole2Title, text: `${t.pole2Obj}. ${t.pole2Item1} ${t.pole2Item2} ${t.pole2Item3}`, image: "qui_4", color: "#d4af37" },
    { number: "03", title: t.pole3Title, text: `${t.pole3Obj}. ${t.pole3Item1} ${t.pole3Item2} ${t.pole3Item3}`, image: "qui_5", color: "#111827" },
  ];

  const differenceItems = [
    { number: "01", title: t.compareHeadTradition, text: `${t.row1Tradition} ${t.row2Tradition}`, image: "qui_3", color: "#6b7280" },
    { number: "02", title: t.compareHeadFedpawa, text: `${t.row1Fedpawa} ${t.row2Fedpawa}`, image: "qui_9", color: "#d4af37" },
    { number: "03", title: t.compareHeadCriteria, text: `${t.row3Criteria} ${t.row4Criteria}`, image: "qui_12", color: "#6b7280" },
  ];

  return (
    <>
      {/* HERO */}
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

      {/* VARIANTE 1 : Split Line Timeline */}
      <section style={{ padding: "6rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.75rem" }}>
              Variante 1 — Split Line Timeline
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0", lineHeight: 1.25 }}>{t.pillarsTitle}</h2>
          </div>
          <ActiveSectionRemix locale={locale} sectionTitle="" items={valeursItems} variant={1} />
        </div>
      </section>

      {/* VARIANTE 2 : Radial Orbit */}
      <section style={{ padding: "6rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.75rem" }}>
              Variante 2 — Radial Orbit
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0", lineHeight: 1.25 }}>{t.expertiseTitle}</h2>
          </div>
          <ActiveSectionRemix locale={locale} sectionTitle="" items={savoirFaireItems} variant={2} />
        </div>
      </section>

      {/* VARIANTE 3 : Stacked Timeline */}
      <section style={{ padding: "6rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.75rem" }}>
              Variante 3 — Stacked Timeline
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0", lineHeight: 1.25 }}>{t.compareTitle}</h2>
          </div>
          <ActiveSectionRemix locale={locale} sectionTitle="" items={differenceItems} variant={3} />
        </div>
      </section>

      {/* VARIANTE 4 : Grid Focus */}
      <section style={{ padding: "6rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.75rem" }}>
              Variante 4 — Grid Focus
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0", lineHeight: 1.25 }}>{t.ctaTitle}</h2>
          </div>
          <ActiveSectionRemix locale={locale} sectionTitle="" items={valeursItems} variant={4} />
        </div>
      </section>

      <section className="cta-banner-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <Link href={routes.contact} className="btn btn-gold">{t.ctaButton}</Link>
        </div>
      </section>

      {/* LIGHTBOX */}
      <div className={`lightbox${lightboxSrc ? " open" : ""}`} id="lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightboxSrc(null); }}>
        <span className="lightbox-close">&times;</span>
        <img src={lightboxSrc ?? "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="} id="lightboxImg" alt={t.galleryLightboxAlt} />
      </div>

      {/* MODALE RENDEZ-VOUS */}
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

// ============================================================
// FEDPAWA — /variations
// Variations du style "about-vision-box" (fond bleu #1A237E,
// bordure gauche or, texte blanc, padding 40px).
// Chaque variante modifie UN détail du style original.
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import ActiveSectionAboutVisionVariants from "@/components/qui-sommes-nous/ActiveSectionAboutVisionVariants";

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

  // Même jeu de 4 éléments (Nos Valeurs) pour chaque variation,
  // afin de comparer uniquement le style du bloc.
  const valeursItems = [
    { img: "qui_1", title: t.pillar1Title, text: t.pillar1Text },
    { img: "qui_7", title: t.pillar2Title, text: t.pillar2Text },
    { img: "qui_11", title: t.pillar3Title, text: t.pillar3Text },
    { img: "qui_8", title: t.pillar4Title, text: t.pillar4Text },
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

      {/* INTRODUCTION */}
      <section style={{ padding: "4rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0", lineHeight: 1.25 }}>
              Variations du style « About Vision Box »
            </h2>
            <p style={{ fontSize: "1rem", color: "#6b7280", maxWidth: 700, margin: "0 auto" }}>
              Chaque variante présente le même contenu (4 éléments de « Nos Valeurs ») mais modifie un détail
              du style original « about-vision-box » : bordure, fond, texte, shadow, coins, etc.
            </p>
          </div>
        </div>
      </section>

      {/* VARIANTE 1 : Original */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 1 — Original
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Bleu foncé, bordure gauche or, shadow
            </h3>
          </div>
          <ActiveSectionAboutVisionVariants
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            visionVariant={1}
          />
        </div>
      </section>

      {/* VARIANTE 2 : Bordure complète */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 2 — Bordure complète
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Or tout autour au lieu de gauche seulement
            </h3>
          </div>
          <ActiveSectionAboutVisionVariants
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            visionVariant={2}
          />
        </div>
      </section>

      {/* VARIANTE 3 : Inversé */}
      <section style={{ padding: "5rem 0", background: "#fafaf9" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 3 — Inversé
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Fond blanc, texte noir, sans shadow
            </h3>
          </div>
          <ActiveSectionAboutVisionVariants
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            visionVariant={3}
          />
        </div>
      </section>

      {/* VARIANTE 4 : Bordure bas uniquement */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 4 — Bordure bas
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Or en dessous uniquement
            </h3>
          </div>
          <ActiveSectionAboutVisionVariants
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            visionVariant={4}
          />
        </div>
      </section>

      {/* VARIANTE 5 : Sans bordure */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 5 — Sans bordure
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Bleu, shadow seulement, coins arrondis, padding réduit
            </h3>
          </div>
          <ActiveSectionAboutVisionVariants
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            visionVariant={5}
          />
        </div>
      </section>

      {/* VARIANTE 6 : Double bordure */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 6 — Double bordure
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Gauche + bas, padding réduit
            </h3>
          </div>
          <ActiveSectionAboutVisionVariants
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            visionVariant={6}
          />
        </div>
      </section>

      {/* CTA */}
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

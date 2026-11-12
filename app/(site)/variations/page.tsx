// ============================================================
// FEDPAWA — /variations
// 6 variantes de RESTRUCTURATION complète du composant
// "about-vision-box" : chaque variante change la disposition,
// les rapports de taille, la structure HTML et les animations.
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import ActiveSectionAboutVisionRestructured from "@/components/qui-sommes-nous/ActiveSectionAboutVisionRestructured";

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
  // afin de comparer uniquement la structure du bloc.
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
              Restructurations du composant « About Vision Box »
            </h2>
            <p style={{ fontSize: "1rem", color: "#6b7280", maxWidth: 700, margin: "0 auto" }}>
              Chaque variante restructure complètement la disposition : rapports de taille,
              structure HTML, position de l'image et du texte, animations. Même contenu (4 éléments
              de « Nos Valeurs »), structure différente.
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
              Image en haut, titre et texte en dessous, bloc bleu avec bordure gauche or
            </h3>
          </div>
          <ActiveSectionAboutVisionRestructured
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            variant={1}
          />
        </div>
      </section>

      {/* VARIANTE 2 : Côte à côte */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 2 — Côte à côte
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Image 40% à gauche | Texte 60% à droite
            </h3>
          </div>
          <ActiveSectionAboutVisionRestructured
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            variant={2}
          />
        </div>
      </section>

      {/* VARIANTE 3 : Image cercle */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 3 — Image cercle
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Photo ronde au centre, titre et texte en dessous
            </h3>
          </div>
          <ActiveSectionAboutVisionRestructured
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            variant={3}
          />
        </div>
      </section>

      {/* VARIANTE 4 : Image en fond + overlay */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 4 — Image en fond
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Image pleine avec texte en overlay (dégradé en bas)
            </h3>
          </div>
          <ActiveSectionAboutVisionRestructured
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            variant={4}
          />
        </div>
      </section>

      {/* VARIANTE 5 : Deux colonnes asymétriques */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 5 — Colonnes asymétriques
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Image 60% à gauche | Texte 40% à droite avec fond coloré
            </h3>
          </div>
          <ActiveSectionAboutVisionRestructured
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            variant={5}
          />
        </div>
      </section>

      {/* VARIANTE 6 : Carte journal */}
      <section style={{ padding: "5rem 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.5rem" }}>
              Variation 6 — Carte journal
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 1rem 0" }}>
              Petite image en haut, titre en gros, texte en dessous
            </h3>
          </div>
          <ActiveSectionAboutVisionRestructured
            locale={locale}
            sectionTitle=""
            items={valeursItems}
            variant={6}
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

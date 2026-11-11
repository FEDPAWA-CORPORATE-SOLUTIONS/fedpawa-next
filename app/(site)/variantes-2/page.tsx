// ============================================================
// FEDPAWA — /variantes-2
// Disposition verticale inspirée de l'image :
//   Grande image en haut
//   Titre avec icône (cible) en dessous
//   Texte de mission/ambition en bas
// ==========================================================

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";

export default function Variantes2Page({ locale = "fr" }: { locale?: Locale }) {
  const t = getPageDictionary(locale, "qui-sommes-nous");
  const routes = routesFor(locale);

  const [rdvOpen, setRdvOpenState] = useState(false);
  const [rdvSent, setRdvSentState] = useState(false);
  useEffect(() => {
    document.body.style.overflow = rdvOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [rdvOpen]);

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

      {/* SECTION VERTICALE — Mission & Ambition */}
      <section
        style={{
          background: "#1e293b",
          color: "#ffffff",
          padding: "0",
          position: "relative",
        }}
      >
        {/* Grande image en haut */}
        <div
          style={{
            width: "100%",
            maxWidth: 1150,
            margin: "0 auto",
            height: 340,
            overflow: "hidden",
            borderRadius: 12,
            border: "3px solid #d4af37",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <img
            src="/assets/images/qui_1.jpg"
            alt="Équipe travaillant sur des documents"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* Contenu texte centré */}
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "3rem 1.5rem 4rem 1.5rem",
            textAlign: "left",
          }}
        >
          {/* Titre avec icône */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#d4af37",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 800,
              }}
            >
              🎯
            </div>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Notre Mission &amp; Ambition
            </h2>
          </div>

          {/* Texte de mission */}
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: "#e2e8f0",
              margin: 0,
              maxWidth: 800,
              fontWeight: 400,
            }}
          >
            Être le guichet unique de référence pour tout entrepreneur ou groupe souhaitant s&rsquo;implanter, se prot&egrave;ger et se d&eacute;velopper au Cameroun et dans l&rsquo;espace OHADA/OAPI. Nous faisons de la conformit&eacute; un bouclier protecteur et de la fiscalit&eacute; un outil d&rsquo;optimisation l&eacute;gale.
          </p>
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

      {/* MODALE RENDEZ-VOUS */}
      <div className={`modal-overlay${rdvOpen ? " open" : ""}`} id="appointmentModal" onClick={(e) => { if (e.target === e.currentTarget) setRdvOpenState(false); }}>
        <div className="modal-box">
          <button type="button" className="modal-close" aria-label="Fermer" onClick={() => setRdvOpenState(false)}>&times;</button>
          <div className="modal-header"><h3>Prendre rendez-vous</h3><p>Contactez-nous pour discuter de votre projet.</p></div>
          <form onSubmit={(e) => { e.preventDefault(); window.alert("Message envoy&eacute; avec succ&egrave;s !"); setRdvSentState(true); setRdvOpenState(false); }}>
            <div className="form-group"><label>Motif</label><select className="form-control" required><option value="">{t.modalReasonPlaceholder}</option><option>Domiciliation</option><option>Création d&rsquo;entreprise</option><option>Fiscalit&eacute;</option><option>Autre</option></select></div>
            <div className="form-group"><label>Nom</label><input type="text" className="form-control" required /></div>
            <div className="form-group"><label>Téléphone</label><input type="tel" className="form-control" required /></div>
            <button type="submit" className="btn btn-primary btn-block">Envoyer</button>
          </form>
        </div>
      </div>
    </>
  );
}

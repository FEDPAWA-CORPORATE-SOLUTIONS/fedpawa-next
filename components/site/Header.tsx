// Header FEDPAWA — conversion de templates/partials/site-header.php (vague A).
// barres top-bar + navigation + menu mobile. Interactivité = menu burger
// + toggles → "use client" requis. Textes via lib/i18n.ts, liens via lib/routes.ts.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";

export interface HeaderProps {
  locale?: Locale;
  /** Section active (réplique $active du PHP) : "" = aucune. */
  active?:
    | ""
    | "index"
    | "domiciliation"
    | "creation"
    | "fiscalite"
    | "oapi"
    | "contrats"
    | "about"
    | "contact";
}

export default function Header({ locale = "fr", active = "" }: HeaderProps) {
  const { shared } = getDictionary(locale);
  const routes = routesFor(locale);
  const [mobileOpen, setMobileOpen] = useState(false);

  const servicesActive = [
    "services",
    "domiciliation",
    "creation",
    "fiscalite",
    "oapi",
    "contrats",
  ].includes(active);

  // Fermeture du menu mobile au resize >= desktop (comportement fedpawa-ui.js).
  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 993) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  // body.classList "no-scroll" quand menu ouvert (comportement source).
  useEffect(() => {
    document.body.classList.toggle("no-scroll", mobileOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [mobileOpen]);

  const langHref = locale === "en" ? "/" : "/en";

  return (
    <>
      {/* ============== TOP BAR ============== */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-info">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>{" "}
              {shared.topBar.address}
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>{" "}
              {shared.topBar.hours}
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="m22 6-10 7L2 6" />
              </svg>{" "}
              contact@fedpawa.com
            </span>
          </div>
        </div>
      </div>

      {/* ============== HEADER ============== */}
      <header className="site-header" id="siteHeader">
        <div className="container header-inner">
          <Link
            className="brand"
            href={routes.home}
            aria-label="FEDPAWA CORPORATE SOLUTIONS"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- <Image> interdit: dimensions source inconnues en vague A */}
            <img
              className="brand-logo"
              src="/assets/images/logo.jpg"
              alt="Logo FEDPAWA Corporate Solutions"
            />
            <span className="brand-copy">
              <strong>FEDPAWA</strong>
              <small>Corporate Solutions</small>
            </span>
          </Link>
          <nav className="main-nav">
            <ul className="nav-list">
              <li>
                <Link
                  className={`nav-link${active === "index" ? " is-active" : ""}`}
                  href={routes.home}
                >
                  {shared.nav.home}
                </Link>
              </li>
              <li className="nav-dropdown">
                <a
                  className={`nav-link${servicesActive ? " is-active" : ""}`}
                  href="#"
                >
                  {shared.nav.services}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      className={active === "domiciliation" ? "is-active" : ""}
                      href={routes.domiciliation}
                    >
                      {shared.nav.domiciliation}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={active === "creation" ? "is-active" : ""}
                      href={routes.creationEntreprise}
                    >
                      {shared.nav.companyFormation}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={active === "fiscalite" ? "is-active" : ""}
                      href={routes.fiscalite}
                    >
                      {shared.nav.taxLegalAdvisory}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={active === "oapi" ? "is-active" : ""}
                      href={routes.oapi}
                    >
                      {shared.nav.oapiProtection}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={active === "contrats" ? "is-active" : ""}
                      href={routes.contrats}
                    >
                      {shared.nav.contracts}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  className={`nav-link${active === "about" ? " is-active" : ""}`}
                  href={routes.aboutUs}
                >
                  {shared.nav.aboutUs}
                </Link>
              </li>
              <li>
                <Link
                  className={`nav-link${active === "contact" ? " is-active" : ""}`}
                  href={routes.contact}
                >
                  {shared.nav.contact}
                </Link>
              </li>
            </ul>
          </nav>
          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label={shared.footer.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          {/* nav-actions : état de connexion géré en vague C (auth) */}
          <div className="nav-actions" id="navActions"></div>
        </div>
      </header>

      {/* ============== MOBILE NAVIGATION ============== */}
      <div
        className={`mobile-nav${mobileOpen ? " is-open" : ""}`}
        id="mobileNav"
        data-open={mobileOpen ? "true" : undefined}
      >
        <nav>
          <Link href={routes.home} onClick={() => setMobileOpen(false)}>
            {shared.nav.home}
          </Link>
          <Link href={routes.domiciliation} onClick={() => setMobileOpen(false)}>
            {shared.nav.domiciliation}
          </Link>
          <Link
            href={routes.creationEntreprise}
            onClick={() => setMobileOpen(false)}
          >
            {shared.nav.companyFormation}
          </Link>
          <Link href={routes.fiscalite} onClick={() => setMobileOpen(false)}>
            {shared.nav.taxLegalAdvisory}
          </Link>
          <Link href={routes.oapi} onClick={() => setMobileOpen(false)}>
            {shared.nav.oapiProtection}
          </Link>
          <Link href={routes.contrats} onClick={() => setMobileOpen(false)}>
            {shared.nav.contracts}
          </Link>
          <Link href={routes.aboutUs} onClick={() => setMobileOpen(false)}>
            {shared.nav.aboutUs}
          </Link>
          <Link href={routes.contact} onClick={() => setMobileOpen(false)}>
            {shared.nav.contact}
          </Link>

          {/* CTA mobile : état de connexion géré en vague C (auth) */}
          <Link
            className="mobile-cta"
            href={routes.auth}
            onClick={() => setMobileOpen(false)}
          >
            {locale === "en" ? "Sign in" : "Se Connecter"}
          </Link>

          <div className="mobile-nav-toggles">
            <button
              className="mode-toggle mobile-mode-toggle"
              id="mobileModeToggle"
              aria-label="Basculer en mode sombre/clair"
              title="Light / dark mode"
            >
              <svg
                className="sun-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <svg
                className="moon-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <button
              className="lang-toggle mobile-lang-toggle"
              id="mobileLangToggle"
              aria-label="Switch language / Changer de langue"
              title="FR / EN"
              onClick={() => {
                window.location.href = langHref;
              }}
            >
              {locale === "en" ? "FR" : "EN"}
            </button>
            <button
              className="mobile-close-btn"
              aria-label="Fermer le menu"
              title="Fermer le menu"
              onClick={() => setMobileOpen(false)}
            >
              ×
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

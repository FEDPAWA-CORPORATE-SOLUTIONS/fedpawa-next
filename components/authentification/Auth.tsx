"use client";

// ==========================================================
// FEDPAWA — Authentification : panneau visuel + onglets
// Connexion/Inscription (auth.js répliqué en React) :
// - POST /api/v1/login { email, mot_de_passe, remember }
//   → redirect ?next= ou data.redirect ou /espace-client
// - POST /api/v1/register { nom, entreprise, email, telephone,
//   mot_de_passe } → bascule sur Connexion après succès
// - validation regex mdp (8+, 1 maj, 1 chiffre), CGU requise
// - toggles visibilité mdp, toasts, global loader
// ==========================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { apiPost, ApiError } from "@/lib/api";
import { routesFor } from "@/lib/routes";

export interface AuthProps {
  locale?: Locale;
}

type Tab = "login" | "signup";

interface AuthToast {
  message: string;
  type: "success" | "error";
}

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const EYE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EYE_OFF = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function Auth({ locale = "fr" }: AuthProps) {
  const t = getPageDictionary(locale, "authentification");
  const routes = routesFor(locale);

  const [tab, setTab] = useState<Tab>("login");
  const [toast, setToast] = useState<AuthToast | null>(null);
  const [loading, setLoading] = useState(false);
  const [pwdVisible, setPwdVisible] = useState<Record<string, boolean>>({});

  // Login state
  const [login, setLogin] = useState({ email: "", motDePasse: "", remember: false });
  // Signup state
  const [signup, setSignup] = useState({
    civility: "",
    nom: "",
    entreprise: "",
    forme: "",
    email: "",
    telephone: "",
    motDePasse: "",
    confirm: "",
    cgu: false,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });

  const setPwd = (field: string, value: string) =>
    setLogin((s) => ({ ...s, [field]: value }));

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const email = login.email.trim();
    const mot_de_passe = login.motDePasse;
    if (!email || !mot_de_passe) {
      showToast(t.toastFillAll, "error");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost<{ redirect?: string; error?: string }>(
        "/api/v1/login",
        { email, mot_de_passe, remember: login.remember },
      );
      showToast(t.toastLoginOk, "success");
      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      setTimeout(() => {
        const base = data.redirect || routes.espaceClient;
        window.location.href = next ? next : base;
      }, 800);
    } catch (err) {
      if (err instanceof ApiError && err.status > 0) {
        const b = err.body as { error?: string } | null;
        showToast(b?.error || t.toastLoginKo, "error");
      } else {
        showToast(t.toastServerKo, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!signup.cgu) {
      showToast(t.toastCguMissing, "error");
      return;
    }
    if (signup.motDePasse !== signup.confirm) {
      showToast(t.toastPwdMismatch, "error");
      return;
    }
    if (!PWD_REGEX.test(signup.motDePasse)) {
      showToast(t.toastPwdWeak, "error");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/api/v1/register", {
        nom: signup.nom.trim(),
        entreprise: signup.entreprise.trim(),
        email: signup.email.trim(),
        telephone: signup.telephone.trim(),
        mot_de_passe: signup.motDePasse,
      });
      showToast(t.toastSignupOk, "success");
      setSignup({
        civility: "",
        nom: "",
        entreprise: "",
        forme: "",
        email: "",
        telephone: "",
        motDePasse: "",
        confirm: "",
        cgu: false,
      });
      setTab("login");
    } catch (err) {
      if (err instanceof ApiError && err.status > 0) {
        const b = err.body as { error?: string } | null;
        showToast(b?.error || t.toastSignupKo, "error");
      } else {
        showToast(t.toastServerKo, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  const pwdToggle = (id: string) => (
    <button
      type="button"
      className="pwd-toggle"
      aria-label={t.showPwd}
      onClick={() => setPwdVisible((v) => ({ ...v, [id]: !v[id] }))}
    >
      {pwdVisible[id] ? EYE_OFF : EYE}
    </button>
  );

  return (
    <div className="auth-wrapper">
      {/* ============== VERSO VISUEL ============== */}
      <aside className="auth-visual">
        <div className="auth-content">
          <h1 dangerouslySetInnerHTML={{ __html: t.heroTitle }} />
          <p>{t.heroDesc}</p>
          <ul className="auth-features">
            {["feat1", "feat2", "feat3"].map((k) => (
              <li key={k} className="auth-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4 12 14.01l-3-3" />
                </svg>{" "}
                {t[k]}
              </li>
            ))}
          </ul>
        </div>
        <div className="auth-footer-info">
          {t.addrLine}
          <br />
          {t.copyright}
          <br />
          <Link href={routes.cgu} target="_blank" rel="noopener">
            {t.legalCgu}
          </Link>{" "}
          ·{" "}
          <Link href={routes.privacy} target="_blank" rel="noopener">
            {t.legalPrivacy}
          </Link>
        </div>
      </aside>

      {/* ============== FORMULAIRES ============== */}
      <section className="auth-forms">
        <div className="form-container">
          <div className="form-header">
            <h2>{t.authHeader}</h2>
            <p>{t.authSubheader}</p>
          </div>
          <div className="auth-tabs">
            <div
              className={"auth-tab" + (tab === "login" ? " active" : "")}
              onClick={() => setTab("login")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setTab("login")}
            >
              {t.tabLogin}
            </div>
            <div
              className={"auth-tab" + (tab === "signup" ? " active" : "")}
              onClick={() => setTab("signup")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setTab("signup")}
            >
              {t.tabSignup}
            </div>
          </div>

          {/* ---------- LOGIN ---------- */}
          <div className={"form-wrapper" + (tab === "login" ? " active" : "")} id="loginForm">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login_email">{t.lblEmail}</label>
                <input
                  type="email"
                  id="login_email"
                  name="email"
                  className="form-control"
                  placeholder="vous@entreprise.com"
                  autoComplete="email"
                  required
                  value={login.email}
                  onChange={(e) => setPwd("email", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="login_password">{t.lblPassword}</label>
                <div className="pwd-input-wrapper">
                  <input
                    type={pwdVisible.login_password ? "text" : "password"}
                    id="login_password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={login.motDePasse}
                    onChange={(e) => setPwd("motDePasse", e.target.value)}
                  />
                  {pwdToggle("login_password")}
                </div>
              </div>
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={login.remember}
                    onChange={(e) => setLogin((s) => ({ ...s, remember: e.target.checked }))}
                  />{" "}
                  <span>{t.remember}</span>
                </label>
                <Link href={routes.forgotPassword} className="forgot-link">
                  {t.forgot}
                </Link>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {t.btnLogin}
              </button>
            </form>
            <p className="form-switch">
              <span>{t.noAccount}</span>{" "}
              <a
                href="#"
                className="switch-link"
                onClick={(e) => {
                  e.preventDefault();
                  setTab("signup");
                }}
              >
                {t.gotoSignup}
              </a>
            </p>
          </div>

          {/* ---------- SIGNUP ---------- */}
          <div className={"form-wrapper" + (tab === "signup" ? " active" : "")} id="signupForm">
            <form onSubmit={handleSignup}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="civility">{t.lblCivility}</label>
                  <select
                    id="civility"
                    className="form-control"
                    required
                    value={signup.civility}
                    onChange={(e) => setSignup((s) => ({ ...s, civility: e.target.value }))}
                  >
                    <option value="">{t.selSelect}</option>
                    <option value="m">{t.selMr}</option>
                    <option value="mme">{t.selMme}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fullname">{t.lblFullname}</label>
                  <input
                    type="text"
                    id="fullname"
                    className="form-control"
                    placeholder="Jean Dupont"
                    required
                    value={signup.nom}
                    onChange={(e) => setSignup((s) => ({ ...s, nom: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company">{t.lblCompany}</label>
                  <input
                    type="text"
                    id="company"
                    className="form-control"
                    placeholder="Mon Entreprise SARL"
                    value={signup.entreprise}
                    onChange={(e) => setSignup((s) => ({ ...s, entreprise: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="legal-form">{t.lblLegal}</label>
                  <select
                    id="legal-form"
                    className="form-control"
                    value={signup.forme}
                    onChange={(e) => setSignup((s) => ({ ...s, forme: e.target.value }))}
                  >
                    <option value="">{t.selSelect}</option>
                    <option>SARL</option>
                    <option>SAS</option>
                    <option>EI</option>
                    <option>SA</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="signup_email">{t.lblEmail}</label>
                <input
                  type="email"
                  id="signup_email"
                  name="signup-email"
                  className="form-control"
                  placeholder="vous@entreprise.com"
                  autoComplete="email"
                  required
                  value={signup.email}
                  onChange={(e) => setSignup((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">{t.lblPhone}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  placeholder="+237 6XX XX XX XX"
                  autoComplete="tel"
                  required
                  value={signup.telephone}
                  onChange={(e) => setSignup((s) => ({ ...s, telephone: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="signup_password">{t.lblPassword}</label>
                  <div className="pwd-input-wrapper">
                    <input
                      type={pwdVisible.signup_password ? "text" : "password"}
                      id="signup_password"
                      name="new-password"
                      className="form-control"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      value={signup.motDePasse}
                      onChange={(e) => setSignup((s) => ({ ...s, motDePasse: e.target.value }))}
                    />
                    {pwdToggle("signup_password")}
                  </div>
                  <span className="pwd-hint">{t.pwdHint}</span>
                </div>
                <div className="form-group">
                  <label htmlFor="confirm_password">{t.lblConfirm}</label>
                  <div className="pwd-input-wrapper">
                    <input
                      type={pwdVisible.confirm_password ? "text" : "password"}
                      id="confirm_password"
                      name="confirm-password"
                      className="form-control"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      value={signup.confirm}
                      onChange={(e) => setSignup((s) => ({ ...s, confirm: e.target.value }))}
                    />
                    {pwdToggle("confirm_password")}
                  </div>
                </div>
              </div>
              <div className="form-disclaimer">
                <input
                  type="checkbox"
                  id="cgu"
                  required
                  checked={signup.cgu}
                  onChange={(e) => setSignup((s) => ({ ...s, cgu: e.target.checked }))}
                />
                <label htmlFor="cgu" dangerouslySetInnerHTML={{ __html: t.cguLabel }} />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {t.btnSignup}
              </button>
            </form>
            <p className="form-switch">
              <span>{t.hasAccount}</span>{" "}
              <a
                href="#"
                className="switch-link"
                onClick={(e) => {
                  e.preventDefault();
                  setTab("login");
                }}
              >
                {t.gotoLogin}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ============== TOAST ============== */}
      {toast && (
        <div
          className={`auth-toast auth-toast-${toast.type}`}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 99999,
            padding: "14px 20px",
            borderRadius: 8,
            color: "#fff",
            background: toast.type === "success" ? "#28a745" : "#dc3545",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: "0.9rem",
            transition: "opacity 0.3s ease",
          }}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {/* ============== GLOBAL LOADER ============== */}
      {loading && (
        <div className="global-loader active">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}

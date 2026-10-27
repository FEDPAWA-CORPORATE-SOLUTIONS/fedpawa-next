"use client";

// ==========================================================
// FEDPAWA — Tunnel de souscription : wizard 4 étapes
// (tunnel.js répliqué en React) :
// 1. Projet    : formulaires par service (création, fiscalité,
//                OAPI, contrats, recouvrement) + blocs communs
//                représentant/contact + smart banner/modale.
//                Domiciliation → redirection vers
//                /souscription-domiciliation (comportement source).
// 2. Options   : 4 cartes optionnelles (toggleOption).
// 3. Pièces KYC: 3 dropzones (skip si KYC déjà fourni).
// 4. Paiement  : récap (2% frais inclus) + PayModal MoMo.
// Routing ?service=…&pack=… via selectService/applyPlan.
// Pas de service → redirection accueil#services (source).
// ==========================================================

import { useEffect, useMemo, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { apiPost, ApiError } from "@/lib/api";
import { apiAuthPost } from "@/lib/auth";
import { routesFor } from "@/lib/routes";
import PayModal from "@/components/souscription-domiciliation/PayModal";
import { PLANS, SERVICE_NAME_KEYS, OPTION_CARDS, type ServiceId } from "./plans";
import { COUNTRIES } from "@/components/souscription-domiciliation/plans";

export interface TunnelProps {
  locale?: Locale;
  /** ?service= transmis par la page (SSR) — préselection du panier. */
  service?: string;
  /** ?pack= transmis par la page (SSR). */
  pack?: string;
}

const TOTAL_STEPS = 4;

interface Cart {
  service: ServiceId | null;
  serviceName: string;
  price: number;
  planId: string | null;
  planLabel: string;
  planPrice: number;
  planUnit: string;
  options: { name: string; price: number }[];
}

const EMPTY_CART: Cart = {
  service: null,
  serviceName: "",
  price: 0,
  planId: null,
  planLabel: "",
  planPrice: 0,
  planUnit: "",
  options: [],
};

interface Common {
  civilite: string;
  nomComplet: string;
  fonction: string;
  nationalite: string;
  typePiece: string;
  numPiece: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
}

const INITIAL_COMMON: Common = {
  civilite: "Monsieur",
  nomComplet: "",
  fonction: "Gérant / Co-gérant",
  nationalite: "Camerounaise",
  typePiece: "Carte Nationale d'Identité (CNI)",
  numPiece: "",
  email: "",
  telephone: "",
  adresse: "",
  ville: "",
  pays: "Cameroun",
};

export default function Tunnel({ locale = "fr" }: TunnelProps) {
  const t = getPageDictionary(locale, "tunnel_souscription");
  const routes = routesFor(locale);
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [common, setCommon] = useState<Common>(INITIAL_COMMON);
  const [serviceData, setServiceData] = useState<Record<string, Record<string, string | boolean>>>({
    creation: {},
    fiscalite: {},
    oapi: {},
    contrats: {},
    recouvrement: {},
  });
  const [files, setFiles] = useState<{ identite?: File; domicile?: File; visuel?: File }>({});
  const [hint, setHint] = useState("");
  const [kycDone, setKycDone] = useState<string | null>(null);
  const [smartModal, setSmartModal] = useState<{ from: string } | null>(null);
  const [smartBlocked, setSmartBlocked] = useState(false);
  const [banner, setBanner] = useState<{ key: string; msg: string } | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [chkCgv, setChkCgv] = useState(false);
  const [chkCadre, setChkCadre] = useState(false);

  const lang = locale === "en" ? "En" : "Fr";

  const setSvc = (svc: string, field: string, value: string | boolean) =>
    setServiceData((s) => ({ ...s, [svc]: { ...s[svc], [field]: value } }));
  const svcVal = (svc: string, field: string): string =>
    (serviceData[svc]?.[field] as string) ?? "";
  const svcBool = (svc: string, field: string): boolean =>
    (serviceData[svc]?.[field] as boolean) ?? false;

  // Démarche « entreprise existante » (Transformation/Restructuration/
  // Légalisation) → bloc RCCM/NIU actuels visible ET required (parité
  // tunnel.js initServiceFormConditionals : démarche vide = création).
  const isExistingCreationDemarche = (): boolean => {
    const demarche =
      svcVal("creation", "demarche") || "Création d'une nouvelle structure";
    return !/Création d'une nouvelle structure/i.test(demarche);
  };

  const setCom = (k: keyof Common, v: string) => setCommon((c) => ({ ...c, [k]: v }));

  // ---------- Routing ?service=&pack= + SKIP KYC (client, cf. tunnel.js) ----------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlService = params.get("service");
    const urlPack = params.get("pack");
    if (urlService === "domiciliation") {
      // Source : la domiciliation a son tunnel dédié.
      window.location.href =
        routes.souscription + (urlPack ? `?pack=${encodeURIComponent(urlPack)}` : "");
      return;
    }
    if (urlService && urlService in PLANS) {
      selectService(urlService as ServiceId, urlPack);
    } else {
      // Aucun service ciblé → accueil #services (comportement source).
      window.location.replace(routes.home + "#services");
      return;
    }
    // SKIP KYC si déjà fourni (/api/v1/auth/me → kyc_status).
    (async () => {
      try {
        const me = await apiPost<{ authenticated?: boolean; kyc_status?: string }>("/api/v1/auth/me", {});
        if (me && me.authenticated && me.kyc_status) setKycDone(me.kyc_status);
      } catch {
        /* dégradation : étape KYC normale */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectService(serviceId: ServiceId, planId: string | null) {
    const plans = PLANS[serviceId];
    const chosen = planId && plans[planId] ? planId : Object.keys(plans)[0];
    const plan = plans[chosen];
    setCart((c) => ({
      ...c,
      service: serviceId,
      serviceName: t[SERVICE_NAME_KEYS[serviceId]],
      ...planToCart(plan, chosen),
    }));
  }

  function planToCart(
    plan: { labelFr: string; labelEn: string; price: number; unit?: string },
    chosen: string,
  ) {
    return {
      planId: chosen,
      planLabel: locale === "en" ? plan.labelEn : plan.labelFr,
      planPrice: plan.price,
      planUnit: plan.unit ?? "",
      price: plan.price,
    };
  }

  function applyPlan(planId: string) {
    if (!cart.service) return;
    const plan = PLANS[cart.service][planId];
    if (!plan) return;
    setCart((c) => ({ ...c, ...planToCart(plan, planId) }));
  }

  // ---------- Navigation ----------
  function goToStep(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Validation d'une étape (validateStep) : required du formulaire actif.
  function validateStep(from: number, to: number) {
    if (from === 1 && cart.service) {
      const svc = cart.service;
      const missing: string[] = [];
      const req = (v: string, label: string) => {
        if (!v.trim()) missing.push(label);
      };
      if (svc === "creation") {
        req(svcVal("creation", "denomination"), t.creationDenomination);
        if (!svcBool("creation", "existante")) {
          // démarche ≠ création → RCCM/NIU actuels requis.
          // Parité tunnel.js (initServiceFormConditionals) : les champs du
          // bloc conditionnel replié ne sont required QUE si visible —
          // démarche vide au 1er chargement = « création » = bloc caché.
          if (isExistingCreationDemarche()) {
            req(svcVal("creation", "rccmActuel"), t.rccmActuel);
            req(svcVal("creation", "niuActuel"), t.niuActuel);
          }
        }
      } else if (svc === "fiscalite") {
        req(svcVal("fiscalite", "denomination"), t.fDenomination);
        // Parité tunnel.js : NIU/RCCM requis seulement si l'utilisateur
        // n'a PAS coché « je ne dispose pas encore de NIU » (bloc visible).
        if (!svcBool("fiscalite", "noNiu")) {
          req(svcVal("fiscalite", "rccm"), t.fRccm);
          req(svcVal("fiscalite", "niu"), t.fNiu);
        }
      } else if (svc === "oapi") {
        req(svcVal("oapi", "nomSigne"), t.oNomSigne);
        req(svcVal("oapi", "classes"), t.oClasses);
      } else if (svc === "contrats") {
        req(svcVal("contrats", "situation"), t.cSituation);
      }
      // Blocs communs (représentant + contact)
      req(common.nomComplet, t.bNomComplet);
      req(common.numPiece, t.bNumPiece);
      req(common.email, t.bEmail);
      if (common.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(common.email)) missing.push(t.bEmail);
      req(common.telephone, t.bTel);
      req(common.adresse, t.bAdresse);
      req(common.ville, t.bVille);
      if (missing.length) {
        setHint(
          missing.length === 1 ? t.hintOne : `${missing.length} ${t.hintMany}`,
        );
        return;
      }
    }
    setHint("");
    goToStep(to);
  }

  // ---------- Smart flows ----------
  function smartStrong(from: string, checked: boolean) {
    if (checked) {
      setSmartModal({ from });
      setSmartBlocked(true);
    } else {
      setSmartModal(null);
      setSmartBlocked(false);
    }
  }

  function smartSoft(targetKey: string) {
    setBanner({
      key: targetKey,
      msg: targetKey === "creation" ? t.bannerCreation : t.bannerDomiciliation,
    });
  }

  const smartText = () =>
    smartModal?.from === "fiscalite"
      ? t.smartTextFiscalite
      : smartModal?.from === "options"
        ? t.smartTextOptions
        : smartBlocked && smartModal
          ? t.smartTextBlocked
          : t.smartTextDomiciliation;

  // ---------- Récap / totaux (updateSummary) ----------
  const baseTotal = cart.price + cart.options.reduce((s, o) => s + o.price, 0);
  const fee = Math.floor(baseTotal * 0.02);
  const totalAvecFrais = Math.floor(baseTotal * 1.02);
  const devisOnly = cart.price === 0 && cart.options.every((o) => o.price === 0);
  const fmt = (v: number) => v.toLocaleString("fr-FR") + " FCFA";

  // ---------- Paiement (finalPayBtn) ----------
  async function submitSouscription(pay: { phone: string; operator: string }): Promise<{
    ok: boolean;
    message?: string;
    subscription_ref?: string | null;
    api?: Record<string, unknown>;
  }> {
    if (!cart.service) return { ok: false, message: t.noService };
    try {
      const data = await apiAuthPost<Record<string, unknown>>("/api/v1/souscription", {
        service: cart.service,
        plan: cart.planId,
        pack: cart.planId,
        planLabel: cart.planLabel,
        prix: totalAvecFrais,
        options: cart.options,
        paymentMethod: "momo",
        momo_phone: pay.phone,
        momo_operator: pay.operator,
        nom: common.nomComplet,
        name: common.nomComplet,
        email: common.email,
        telephone: common.telephone || pay.phone,
        ...serviceData[cart.service],
        civilite: common.civilite,
        fonction: common.fonction,
        nationalite: common.nationalite,
        type_piece: common.typePiece,
        num_piece: common.numPiece,
        adresse: common.adresse,
        ville: common.ville,
        pays: common.pays,
      });
      const status = data.status as string | undefined;
      if (status === "error") {
        return {
          ok: false,
          message: (data.message as string) || (data.error as string) || t.submitKo,
        };
      }
      const apiPayload =
        status === "payment_pending"
          ? {
              status,
              subscription_id: data.subscription_id,
              client_id: data.client_id,
              transaction_id: data.transaction_id,
              signature_otp: data.signature_otp,
              subscription_ref: data.subscription_ref || data.transaction_id,
              client_name: common.nomComplet,
            }
          : undefined;
      return {
        ok: true,
        message: (data.message as string) || t.submitOk,
        subscription_ref:
          (data.subscription_ref as string) || (data.transaction_id as string) || null,
        api: apiPayload,
      };
    } catch (err) {
      if (err instanceof ApiError) {
        const b = err.body as { message?: string; error?: string } | null;
        return { ok: false, message: b?.message || b?.error || t.submitKo };
      }
      return { ok: false, message: t.submitKo };
    }
  }

  function handleFinalPay() {
    if (!cart.service) {
      setHint(t.noService);
      goToStep(1);
      return;
    }
    setShowPayModal(true);
  }

  // ---------- Dropzone générique (étape 3) ----------
  function Dropzone3({ id, title }: { id: "identite" | "domicile" | "visuel"; title: string }) {
    const file = files[id];
    return (
      <div
        className="dropzone"
        onClick={() => document.getElementById("dz3-" + id)?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = e.dataTransfer.files;
          if (dropped && dropped.length) setFiles((f) => ({ ...f, [id]: dropped[0] }));
        }}
        style={{ cursor: "pointer" }}
      >
        <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <h5>{file ? file.name : title}</h5>
        <p style={file ? { color: "var(--color-success)" } : undefined}>
          {file
            ? `${(file.size / 1024 / 1024).toFixed(2)} ${t.fileReplaceMo}`
            : t.dzDropGeneric}
        </p>
        <input
          id={"dz3-" + id}
          type="file"
          hidden
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => {
            const list = e.target.files;
            if (list && list.length) setFiles((f) => ({ ...f, [id]: list[0] }));
          }}
        />
      </div>
    );
  }

  const inputRow = (label: string, value: string, onChange: (v: string) => void, ph = "", type = "text") => (
    <div className="form-group">
      <label>
        {label} <em className="req">*</em>
      </label>
      <input
        type={type}
        className="form-control"
        placeholder={ph}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const selectRow = (label: string, value: string, onChange: (v: string) => void, options: { value: string; label: string; smart?: string }[]) => (
    <div className="form-group">
      <label>
        {label} <em className="req">*</em>
      </label>
      <select
        className="form-control"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          const opt = options.find((o) => o.value === e.target.value);
          if (opt?.smart) smartSoft(opt.smart);
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const stepLabels = [t.step1, t.step2, t.step3, t.step4];

  return (
    <>
      {/* ============== STEPPER ============== */}
      <div className="progress-wrapper">
        <div className="container">
          <div className="progress-container">
            <div className="progress-line">
              <div
                className="progress-line-fill"
                id="progressFill"
                style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
              />
            </div>
            {stepLabels.map((label, i) => {
              const n = i + 1;
              return (
                <div
                  key={n}
                  className={"progress-step" + (n === step ? " active" : n < step ? " completed" : "")}
                  data-step={n}
                >
                  <div className="progress-dot">{n}</div>
                  <span className="progress-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="tunnel-layout-v2">
          <div className="tunnel-card" style={{ padding: 40, boxShadow: "none", border: "1px solid var(--color-border)" }}>
            {/* ---------- ÉTAPE 1 : PROJET ---------- */}
            <div className={"tunnel-step-content" + (step === 1 ? " active" : "")} id="step-1">
              {hint && (
                <div
                  id="step-validation-hint"
                  role="alert"
                  aria-live="assertive"
                  style={{
                    display: "block",
                    marginBottom: 14,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--color-primary)",
                    background: "var(--color-bg-alt)",
                    fontSize: "0.88rem",
                  }}
                >
                  {hint}
                </div>
              )}
              <div className="step-header">
                <h2>{t.s1Title}</h2>
                <p>{t.s1Intro}</p>
              </div>

              {/* Smart banner */}
              {banner && (
                <div
                  id="smart-banner"
                  style={{
                    marginBottom: 20,
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: "1px solid var(--color-primary)",
                    background: "var(--color-bg-alt)",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  <span id="smart-banner-text">{banner.msg}</span>{" "}
                  <a
                    id="smart-banner-link"
                    href={
                      banner.key === "creation"
                        ? routes.creationEntreprise
                        : routes.domiciliation
                    }
                    style={{ fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    {t.bannerDiscover} →
                  </a>
                  <button
                    type="button"
                    onClick={() => setBanner(null)}
                    style={{ float: "right", background: "none", border: "none", fontSize: "1rem", cursor: "pointer", color: "var(--color-text-muted)", padding: "0 4px" }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ===== CRÉATION ===== */}
              {cart.service === "creation" && (
                <div className="form-block" id="form-creation" style={{ display: "block" }}>
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2A</span> {t.creation2A}
                    </h2>
                    <div className="form-row">
                      {selectRow(t.creationDemarche, svcVal("creation", "demarche") || "Création d'une nouvelle structure", (v) => setSvc("creation", "demarche", v), [
                        { value: "Création d'une nouvelle structure", label: "Création d'une nouvelle structure" },
                        { value: "Transformation", label: "Transformation" },
                        { value: "Restructuration", label: "Restructuration" },
                        { value: "Légalisation", label: "Légalisation" },
                      ])}
                      {selectRow(t.creationForme, svcVal("creation", "forme") || "EI", (v) => setSvc("creation", "forme", v), [
                        { value: "EI", label: "EI" },
                        { value: "SARL/SARLU", label: "SARL/SARLU" },
                        { value: "SAS/SASU", label: "SAS/SASU" },
                        { value: "SA", label: "SA" },
                        { value: "Indécis", label: "Indécis" },
                      ])}
                    </div>
                    <div className="form-row">
                      {inputRow(t.creationDenomination, svcVal("creation", "denomination"), (v) => setSvc("creation", "denomination", v), t.creationDenominationPh)}
                      {inputRow(t.creationAlternatives, svcVal("creation", "alternatives"), (v) => setSvc("creation", "alternatives", v), t.creationAlternativesPh)}
                    </div>
                    {selectRow(t.creationVille, svcVal("creation", "ville") || "Douala", (v) => setSvc("creation", "ville", v), [
                      { value: "Douala", label: "Douala" },
                      { value: "Yaoundé", label: "Yaoundé" },
                    ])}
                  </div>
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2B</span> {t.creation2B}
                    </h2>
                    <div className="form-row">
                      {inputRow(t.capitalMontant, svcVal("creation", "capital"), (v) => setSvc("creation", "capital", v), "1000000", "number")}
                      {inputRow(t.capitalAssociés, svcVal("creation", "associes") || "1", (v) => setSvc("creation", "associes", v), "1", "number")}
                    </div>
                    <div className="form-group">
                      <label>{t.capitalNoms}</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder={t.capitalNomsPh}
                        value={svcVal("creation", "nomsAssocies")}
                        onChange={(e) => setSvc("creation", "nomsAssocies", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2C</span> {t.creation2C}
                    </h2>
                    <div className="form-row">
                      {inputRow(t.apportsNumeraires, svcVal("creation", "apportsNumeraires"), (v) => setSvc("creation", "apportsNumeraires", v), "", "number")}
                      <div className="form-group">
                        <label>{t.apportsNature}</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder={t.apportsNaturePh}
                          value={svcVal("creation", "apportsNature")}
                          onChange={(e) => setSvc("creation", "apportsNature", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2D</span> {t.creation2D}
                    </h2>
                    <div className="form-row">
                      {inputRow(t.dirigeant, svcVal("creation", "dirigeant"), (v) => setSvc("creation", "dirigeant", v), t.dirigeantPh)}
                      <div className="form-group">
                        <label>{t.clauses}</label>
                        <div className="checkbox-line">
                          <input type="checkbox" checked={svcBool("creation", "blocage")} onChange={(e) => setSvc("creation", "blocage", e.target.checked)} />{" "}
                          {t.clauseBlocage}
                        </div>
                        <div className="checkbox-line">
                          <input type="checkbox" checked={svcBool("creation", "autresClauses")} onChange={(e) => setSvc("creation", "autresClauses", e.target.checked)} />{" "}
                          {t.clauseAutres}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!svcBool("creation", "existante") && !isExistingCreationDemarche() && (
                    <div
                      id="creation-existante"
                      style={{ marginTop: 20, padding: 12, background: "var(--color-bg-alt)", borderRadius: 8, border: "1px dashed var(--color-border)" }}
                    >
                      <h4>{t.creationExistante}</h4>
                      <div className="form-row">
                        {inputRow(t.rccmActuel, svcVal("creation", "rccmActuel"), (v) => setSvc("creation", "rccmActuel", v), "RCCM/DL/2024/B/1234")}
                        {inputRow(t.niuActuel, svcVal("creation", "niuActuel"), (v) => setSvc("creation", "niuActuel", v), "M123456789")}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== FISCALITÉ ===== */}
              {cart.service === "fiscalite" && (
                <div className="form-block" id="form-fiscalite" style={{ display: "block" }}>
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2E</span> {t.fiscalite2E}
                    </h2>
                    <div className="form-row">
                      {inputRow(t.fDenomination, svcVal("fiscalite", "denomination"), (v) => setSvc("fiscalite", "denomination", v))}
                      {inputRow(t.fRccm, svcVal("fiscalite", "rccm"), (v) => setSvc("fiscalite", "rccm", v))}
                    </div>
                    <div className="form-row">
                      {inputRow(t.fNiu, svcVal("fiscalite", "niu"), (v) => setSvc("fiscalite", "niu", v))}
                      <div
                        className="form-group"
                        style={{ background: "var(--color-bg-alt)", padding: "12px 14px", borderRadius: 8, border: "1px dashed var(--color-border)" }}
                      >
                        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            id="opt-no-niu-fiscal"
                            style={{ marginTop: 3 }}
                            checked={svcBool("fiscalite", "noNiu")}
                            onChange={(e) => {
                              setSvc("fiscalite", "noNiu", e.target.checked);
                              smartStrong("fiscalite", e.target.checked);
                            }}
                          />
                          <span>{t.fNoNiu}</span>
                        </label>
                      </div>
                    </div>
                    {selectRow(t.fForme, svcVal("fiscalite", "forme") || "SARL", (v) => setSvc("fiscalite", "forme", v), [
                      { value: "SARL", label: "SARL" },
                      { value: "SAS", label: "SAS" },
                      { value: "SA", label: "SA" },
                      { value: "EI", label: "EI" },
                      { value: "Autre", label: "Autre" },
                    ])}
                    {selectRow(t.fSecteur, svcVal("fiscalite", "secteur") || "Commerce", (v) => setSvc("fiscalite", "secteur", v), [
                      { value: "Commerce", label: "Commerce" },
                      { value: "BTP", label: "BTP" },
                      { value: "Services", label: "Services" },
                      { value: "Industriel", label: "Industriel" },
                      { value: "Autre", label: "Autre" },
                    ])}
                  </div>
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2F</span> {t.fiscalite2F}
                    </h2>
                    <div className="form-row">
                      {selectRow(t.fRegime, svcVal("fiscalite", "regime") || "simplifie", (v) => applyPlan(v), [
                        { value: "simplifie", label: t.fRegimeSimplifie },
                        { value: "reel", label: t.fRegimeReel },
                        { value: "simplifie-nouveau", label: t.fRegimeNouveau },
                      ])}
                      {selectRow(t.fCentre, svcVal("fiscalite", "centre") || "CIME", (v) => setSvc("fiscalite", "centre", v), [
                        { value: "CIME", label: "CIME" },
                        { value: "CDI", label: "CDI" },
                        { value: "DGE", label: "DGE" },
                      ])}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          {t.fAcf} <em className="req">*</em>
                        </label>
                        <div className="radio-row">
                          <label className="radio-pill">
                            <input type="radio" name="acf" checked={svcVal("fiscalite", "acf") !== "non"} onChange={() => setSvc("fiscalite", "acf", "oui")} /> {t.fOui}
                          </label>
                          <label className="radio-pill">
                            <input type="radio" name="acf" checked={svcVal("fiscalite", "acf") === "non"} onChange={() => setSvc("fiscalite", "acf", "non")} /> {t.fNon}
                          </label>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>
                          {t.fDeclarations} <em className="req">*</em>
                        </label>
                        <div className="radio-row">
                          <label className="radio-pill">
                            <input type="radio" name="declarations" checked={svcVal("fiscalite", "declarations") !== "en_retard"} onChange={() => setSvc("fiscalite", "declarations", "ajour")} /> {t.fAjour}
                          </label>
                          <label className="radio-pill">
                            <input type="radio" name="declarations" checked={svcVal("fiscalite", "declarations") === "en_retard"} onChange={() => setSvc("fiscalite", "declarations", "en_retard")} /> {t.fRetard}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2G</span> {t.fiscalite2G}
                    </h2>
                    {["fPerim1", "fPerim2", "fPerim3", "fPerim4"].map((k) => (
                      <div className="checkbox-line" key={k}>
                        <input
                          type="checkbox"
                          checked={svcBool("fiscalite", k)}
                          onChange={(e) => setSvc("fiscalite", k, e.target.checked)}
                        />{" "}
                        {t[k]}
                      </div>
                    ))}
                  </div>
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2H</span> {t.fiscalite2H}
                    </h2>
                    <div className="form-row">
                      {selectRow(t.fComptable, svcVal("fiscalite", "comptable") || "Interne", (v) => setSvc("fiscalite", "comptable", v), [
                        { value: "Interne", label: "Interne" },
                        { value: "Expert externe", label: "Expert externe" },
                        { value: "Personne", label: "Personne" },
                      ])}
                      {inputRow(t.fVolume, svcVal("fiscalite", "volume"), (v) => setSvc("fiscalite", "volume", v), t.fVolumePh, "number")}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== OAPI ===== */}
              {cart.service === "oapi" && (
                <div className="form-block" id="form-oapi" style={{ display: "block" }}>
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2I</span> {t.oapi2I}
                    </h2>
                    {selectRow(t.oType, svcVal("oapi", "actifType") || "marque", (v) => { setSvc("oapi", "actifType", v); if (v === "brevets") applyPlan("brevets"); else if (v === "anteriorite") applyPlan("anteriorite"); else applyPlan("protect_brand"); }, [
                      { value: "marque", label: t.oTypeMarque },
                      { value: "application", label: t.oTypeApplication },
                      { value: "dessin", label: t.oTypeDessin },
                      { value: "brevets", label: t.oTypeBrevets },
                    ])}
                    {inputRow(t.oNomSigne, svcVal("oapi", "nomSigne"), (v) => setSvc("oapi", "nomSigne", v), t.oNomSignePh)}
                    {inputRow(t.oClasses, svcVal("oapi", "classes"), (v) => setSvc("oapi", "classes", v), t.oClassesPh)}
                    <div className="form-group">
                      <label>{t.oDescription}</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder={t.oDescriptionPh}
                        value={svcVal("oapi", "description")}
                        onChange={(e) => setSvc("oapi", "description", e.target.value)}
                      />
                    </div>
                  </div>
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2J</span> {t.oapi2J}
                    </h2>
                    <div className="radio-row">
                      <label className="radio-pill">
                        <input
                          type="radio"
                          name="titulaire"
                          checked={svcVal("oapi", "titulaire") !== "personne_physique"}
                          onChange={() => setSvc("oapi", "titulaire", "personne_morale")}
                        />{" "}
                        {t.oTitulaireMorale}
                      </label>
                    </div>
                    <div className="radio-row">
                      <label className="radio-pill">
                        <input
                          type="radio"
                          name="titulaire"
                          checked={svcVal("oapi", "titulaire") === "personne_physique"}
                          onChange={() => setSvc("oapi", "titulaire", "personne_physique")}
                        />{" "}
                        {t.oTitulairePhysique}
                      </label>
                    </div>
                    <small className="text-muted">{t.oTitulaireNote}</small>
                  </div>
                  <hr className="form-divider" />
                  {svcVal("oapi", "titulaire") !== "personne_physique" && (
                    <div className="form-section">
                      <h2 className="form-section-title">{t.oMorale}</h2>
                      <div className="form-row">
                        {inputRow(t.oMoraleDenomination, svcVal("oapi", "moraleDenomination"), (v) => setSvc("oapi", "moraleDenomination", v))}
                        {inputRow(t.oMoraleRccm, svcVal("oapi", "moraleRccm"), (v) => setSvc("oapi", "moraleRccm", v))}
                      </div>
                    </div>
                  )}
                  {svcVal("oapi", "titulaire") === "personne_physique" && (
                    <div className="form-section">
                      <h2 className="form-section-title">{t.oPhysique}</h2>
                      <div className="form-row">
                        {inputRow(t.oPhysiqueNom, svcVal("oapi", "physiqueNom"), (v) => setSvc("oapi", "physiqueNom", v), "Ex: Jean Dupont")}
                        {inputRow(t.oPhysiqueNationalite, svcVal("oapi", "physiqueNationalite") || "Camerounaise", (v) => setSvc("oapi", "physiqueNationalite", v))}
                      </div>
                      {selectRow(t.oPhysiquePiece, svcVal("oapi", "physiquePiece") || "CNI", (v) => setSvc("oapi", "physiquePiece", v), [
                        { value: "CNI", label: "CNI" },
                        { value: "Passeport", label: "Passeport" },
                      ])}
                      {inputRow(t.oPhysiqueNumPiece, svcVal("oapi", "physiqueNumPiece"), (v) => setSvc("oapi", "physiqueNumPiece", v))}
                    </div>
                  )}
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">{t.oVisuel}</h2>
                    <small className="text-muted">{t.oVisuelNote}</small>
                  </div>
                </div>
              )}

              {/* ===== CONTRATS ===== */}
              {cart.service === "contrats" && (
                <div className="form-block" id="form-contrats" style={{ display: "block" }}>
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2K</span> {t.contrats2K}
                    </h2>
                    {selectRow(t.cCategorie, svcVal("contrats", "categorie") || "commercial", (v) => {
                      setSvc("contrats", "categorie", v);
                      if (v === "audit") applyPlan("audit");
                      else if (v === "bail" || v === "social") applyPlan("standard");
                      else if (v === "statuts") applyPlan("complexe");
                    }, [
                      { value: "commercial", label: t.cCatCommercial },
                      { value: "travail", label: t.cCatTravail },
                      { value: "social", label: t.cCatSocial },
                      { value: "NDA", label: t.cCatNda },
                      { value: "bail", label: t.cCatBail },
                      { value: "statuts", label: t.cCatStatuts },
                      { value: "audit", label: t.cCatAudit },
                      { value: "archivage", label: t.cCatArchivage },
                    ])}
                    <div className="form-textarea">
                      <label>
                        {t.cSituation} <em className="req">*</em>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder={t.cSituationPh}
                        value={svcVal("contrats", "situation")}
                        onChange={(e) => setSvc("contrats", "situation", e.target.value)}
                      />
                    </div>
                    {selectRow(t.cFormule, svcVal("contrats", "formule") || cart.planId || "standard", (v) => applyPlan(v), [
                      { value: "standard", label: t.cFormuleStandard },
                      { value: "complexe", label: t.cFormuleComplexe },
                      { value: "audit", label: t.cFormuleAudit },
                    ])}
                    <small className="text-muted">{t.cFormuleNote}</small>
                  </div>
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">2L</span> {t.contrats2L}
                    </h2>
                    {inputRow(t.cTypePrecis, svcVal("contrats", "typePrecis"), (v) => setSvc("contrats", "typePrecis", v), t.cTypePrecisPh)}
                    {selectRow(t.cLangue, svcVal("contrats", "langue") || "fr", (v) => setSvc("contrats", "langue", v), [
                      { value: "fr", label: "FR" },
                      { value: "en", label: "EN" },
                    ])}
                    {["cNonConcurrence", "cNdaStrict", "cDedit", "cPenalites"].map((k) => (
                      <div className="checkbox-line" key={k}>
                        <input
                          type="checkbox"
                          checked={svcBool("contrats", k)}
                          onChange={(e) => {
                            setSvc("contrats", k, e.target.checked);
                            if (e.target.checked) setSmartModal({ from: "contrats" });
                          }}
                        />{" "}
                        {t[k]}
                      </div>
                    ))}
                  </div>
                  {svcVal("contrats", "categorie") === "audit" && (
                    <div className="form-section">
                      <h2 className="form-section-title">{t.cAuditTitle}</h2>
                      <div className="dropzone" style={{ border: "1px dashed var(--color-border)", padding: 12, margin: "8px 0", cursor: "pointer" }} onClick={() => document.getElementById("dz-audit")?.click()}>
                        <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <h5>{files.visuel ? files.visuel.name : t.cAuditDz}</h5>
                        <p>{t.cDzDrop}</p>
                        <input id="dz-audit" type="file" hidden accept=".pdf" onChange={(e) => { const list = e.target.files; if (list && list.length) setFiles((f) => ({ ...f, visuel: list[0] })); }} />
                      </div>
                    </div>
                  )}
                  <hr className="form-divider" />
                  <div className="form-section">
                    <h2 className="form-section-title">{t.cEntreprise}</h2>
                    <div className="form-row">
                      {inputRow(t.cVotreDenomination, svcVal("contrats", "votreDenomination"), (v) => setSvc("contrats", "votreDenomination", v), "Ex: FEDPAWA CORPORATE SOLUTIONS SARL")}
                      {inputRow(t.cCocontractant, svcVal("contrats", "cocontractant"), (v) => setSvc("contrats", "cocontractant", v), t.cCocontractantPh)}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== RECOUVREMENT ===== */}
              {cart.service === "recouvrement" && (
                <div className="form-block" id="form-recouvrement" style={{ display: "block" }}>
                  <div className="form-row">
                    {inputRow(t.rMontant, svcVal("recouvrement", "montant"), (v) => setSvc("recouvrement", "montant", v), t.rMontantPh, "number")}
                    {inputRow(t.rDebiteurs, svcVal("recouvrement", "debitteurs") || "3", (v) => setSvc("recouvrement", "debitteurs", v), t.rDebiteursPh, "number")}
                  </div>
                  {selectRow(t.rNature, svcVal("recouvrement", "nature") || "Facture impayée", (v) => setSvc("recouvrement", "nature", v), [
                    { value: "Facture impayée", label: t.rNatureFacture },
                    { value: "Loyers impayés", label: t.rNatureLoyers },
                    { value: "Prêt / avance non remboursée", label: t.rNaturePret },
                    { value: "Jugement non exécuté", label: t.rNatureJugement },
                    { value: "Autre (précisez)", label: t.rNatureAutre },
                  ])}
                  <div className="form-group">
                    <label>{t.rHistorique}</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={t.rHistoriquePh}
                      value={svcVal("recouvrement", "historique")}
                      onChange={(e) => setSvc("recouvrement", "historique", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ===== BLOCS COMMUNS (2M/2N) ===== */}
              <div className="form-section" style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid var(--color-border)" }}>
                <h3 className="form-section-title">
                  <span className="form-section-num">2M</span> {t.bloc2M}
                </h3>
                <div className="form-row">
                  {selectRow(t.bCivilite, common.civilite, setCom.bind(null, "civilite"), [
                    { value: "Monsieur", label: "Monsieur" },
                    { value: "Madame", label: "Madame" },
                  ])}
                  {inputRow(t.bNomComplet, common.nomComplet, (v) => setCom("nomComplet", v), t.bNomCompletPh)}
                </div>
                <div className="form-row">
                  {selectRow(t.bFonction, common.fonction, setCom.bind(null, "fonction"), [
                    { value: "Gérant / Co-gérant", label: "Gérant / Co-gérant" },
                    { value: "Président / Director", label: "Président / Director" },
                    { value: "Directeur Général", label: "Directeur Général" },
                    { value: "Fondateur / Promoteur", label: "Fondateur / Promoteur" },
                    { value: "Mandataire / Fondé de pouvoir", label: "Mandataire / Fondé de pouvoir" },
                  ])}
                  {inputRow(t.bNationalite, common.nationalite, (v) => setCom("nationalite", v), t.bNationalitePh)}
                </div>
                <div className="form-row">
                  {selectRow(t.bTypePiece, common.typePiece, setCom.bind(null, "typePiece"), [
                    { value: "Carte Nationale d'Identité (CNI)", label: "Carte Nationale d'Identité (CNI)" },
                    { value: "Passeport", label: "Passeport" },
                    { value: "Carte de Séjour / Titre de Résidence", label: "Carte de Séjour / Titre de Résidence" },
                  ])}
                  {inputRow(t.bNumPiece, common.numPiece, (v) => setCom("numPiece", v))}
                </div>
              </div>

              <div className="form-section" style={{ marginTop: 24 }}>
                <h3 className="form-section-title">
                  <span className="form-section-num">2N</span> {t.bloc2N}
                </h3>
                <div className="form-row">
                  {inputRow(t.bEmail, common.email, (v) => setCom("email", v), t.bEmailPh, "email")}
                  {inputRow(t.bTel, common.telephone, (v) => setCom("telephone", v), t.bTelPh, "tel")}
                </div>
                <div className="form-row">
                  {inputRow(t.bAdresse, common.adresse, (v) => setCom("adresse", v), t.bAdressePh)}
                  {inputRow(t.bVille, common.ville, (v) => setCom("ville", v), t.bVillePh)}
                </div>
                <div className="form-group">
                  <label htmlFor="pays">
                    {t.bPays} <em className="req">*</em>
                  </label>
                  <select id="pays" className="form-control" value={common.pays} onChange={(e) => setCom("pays", e.target.value)}>
                    <option value="" disabled>
                      {t.bPaysPh}
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="btn-group">
                <button className="btn btn-primary" onClick={() => validateStep(1, 2)}>
                  {t.btnContinueDocs}
                </button>
              </div>
            </div>

            {/* ---------- ÉTAPE 2 : OPTIONS ---------- */}
            <div className={"tunnel-step-content" + (step === 2 ? " active" : "")} id="step-2">
              <div className="step-header">
                <h2>{t.s2Title}</h2>
                <p>{t.s2Intro}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {OPTION_CARDS.map((opt) => {
                  const name = locale === "en" ? opt.nameEn : opt.nameFr;
                  const checked = cart.options.some((o) => o.name === name);
                  return (
                    <label
                      key={opt.titleKey}
                      className={"selectable-card option-card" + (checked ? " selected" : "")}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        style={{ display: "none" }}
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCart((c) => ({ ...c, options: [...c.options, { name, price: 0 }] }));
                            if (opt.titleKey === "optAssistanceT") setSmartModal({ from: "options" });
                          } else {
                            setCart((c) => ({ ...c, options: c.options.filter((o) => o.name !== name) }));
                          }
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4>{t[opt.titleKey]}</h4>
                          <p className="card-desc">{t[opt.descKey]}</p>
                        </div>
                        <div className="card-price">{t.optPrix}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => goToStep(1)}>
                  ← {t.step1}
                </button>
                <button className="btn btn-primary" onClick={() => validateStep(2, 3)}>
                  {t.btnContinueDocs}
                </button>
              </div>
            </div>

            {/* ---------- ÉTAPE 3 : PIÈCES KYC ---------- */}
            <div className={"tunnel-step-content" + (step === 3 ? " active" : "")} id="step-3">
              <div className="step-header">
                <h2>{t.s3Title}</h2>
                <p>{t.s3Intro}</p>
              </div>
              {kycDone && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    background: "rgba(16,185,129,.08)",
                    border: "1px solid #10b981",
                    borderRadius: 12,
                    padding: "18px 20px",
                    marginBottom: 18,
                  }}
                >
                  <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#10b981" strokeWidth="2.5" style={{ flex: "0 0 26px" }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div>
                    <strong>{t.kycDoneTitle}</strong>
                    <div style={{ fontSize: "0.86rem", color: "var(--color-text-muted)", marginTop: 4 }}>
                      {t.kycDoneText} {kycDone}
                      {t.kycDoneEnd}
                    </div>
                  </div>
                </div>
              )}
              {!kycDone && (
                <>
                  <Dropzone3 id="identite" title={t.dzIdentite} />
                  <Dropzone3 id="domicile" title={t.dzDomicile} />
                </>
              )}
              <Dropzone3 id="visuel" title={t.dzVisuel} />
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "20px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>{" "}
                {t.kycNote}
              </p>
              <div className="btn-group">
                <button className="btn btn-outline" onClick={() => goToStep(2)}>
                  ← {t.step2}
                </button>
                <button className="btn btn-primary" onClick={() => goToStep(4)}>
                  {t.btnRecap}
                </button>
              </div>
            </div>

            {/* ---------- ÉTAPE 4 : RÉCAP & PAIEMENT ---------- */}
            <div className={"tunnel-step-content" + (step === 4 ? " active" : "")} id="step-4">
              <div className="step-header">
                <h2>{t.s4Title}</h2>
                <p>{t.s4Intro}</p>
              </div>

              <table className="cost-table">
                <thead>
                  <tr>
                    <th>{t.tableDesignation}</th>
                    <th style={{ textAlign: "right" }}>{t.tableMontant}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {cart.serviceName}
                      {cart.planLabel ? ` — ${cart.planLabel}` : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {cart.price > 0 ? `${fmt(cart.price)}${cart.planUnit}` : t.sumDevis}
                    </td>
                  </tr>
                  <tr>
                    <td>{t.tableOptions}</td>
                    <td style={{ textAlign: "right" }}>
                      {cart.options.length
                        ? cart.options.some((o) => o.price > 0)
                          ? fmt(cart.options.reduce((s, o) => s + o.price, 0))
                          : t.sumDevis
                        : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td>{t.tableFees}</td>
                    <td style={{ textAlign: "right" }}>{fee > 0 ? fmt(fee) : "—"}</td>
                  </tr>
                  <tr style={{ background: "var(--color-bg-alt)" }}>
                    <td colSpan={2} style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                      {t.tableDebours}
                    </td>
                  </tr>
                  <tr className="total-row">
                    <td>{t.tableTotal}</td>
                    <td style={{ textAlign: "right" }}>
                      {devisOnly && baseTotal === 0 ? t.sumTotalDevis : fmt(totalAvecFrais)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <h3 style={{ fontSize: "1.1rem", marginBottom: 16 }}>{t.payMode}</h3>
              <div
                className="pay-method-unique"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 18,
                  border: "2px solid var(--color-primary)",
                  borderRadius: 12,
                  background: "var(--color-primary-soft, var(--color-bg-alt))",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 46px",
                  }}
                >
                  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--color-heading)" }}>{t.payMoMoT}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{t.payMoMoD}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label" style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.85rem" }}>
                  <input type="checkbox" required checked={chkCgv} onChange={(e) => setChkCgv(e.target.checked)} style={{ marginTop: 3 }} />{" "}
                  <span dangerouslySetInnerHTML={{ __html: t.chkCgv }} />
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label" style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.85rem" }}>
                  <input type="checkbox" required checked={chkCadre} onChange={(e) => setChkCadre(e.target.checked)} style={{ marginTop: 3 }} />{" "}
                  <span dangerouslySetInnerHTML={{ __html: t.chkCadre }} />
                </label>
              </div>

              <button
                id="finalPayBtn"
                className="btn btn-primary btn-block"
                disabled={!chkCgv || !chkCadre || smartBlocked}
                onClick={handleFinalPay}
              >
                {devisOnly && baseTotal === 0
                  ? t.finalPayDevis
                  : `${t.finalPay} (${totalAvecFrais.toLocaleString("fr-FR")} FCFA)`}
              </button>
            </div>
          </div>

          {/* ============== SIDEBAR COMMANDE ============== */}
          <aside className={"order-summary" + (step === TOTAL_STEPS ? " invoice-final" : "")}>
            <div className="summary-header">
              <h3>{t.sumTitle}</h3>
            </div>
            <div id="summaryItems">
              {cart.serviceName ? (
                <>
                  <div className="summary-item">
                    <span>
                      {cart.serviceName}
                      {cart.planLabel ? ` — ${cart.planLabel}` : ""}
                    </span>
                    <span>
                      {cart.price > 0
                        ? `${t.sumPrixHt} ${fmt(cart.price)}${cart.planUnit}`
                        : t.sumDevis}
                    </span>
                  </div>
                  {cart.options.map((o) => (
                    <div className="summary-item" key={o.name}>
                      <span>{o.name}</span>
                      <span>{o.price ? fmt(o.price) + " HT" : t.sumDevis}</span>
                    </div>
                  ))}
                  <div className="summary-divider" />
                  <div className="summary-item muted">
                    <span>{t.sumDebours}</span>
                    <span>{t.sumDeboursVal}</span>
                  </div>
                </>
              ) : (
                <div className="summary-item muted">{t.sumAucune}</div>
              )}
            </div>
            <div className="summary-total">
              <span>{t.sumTotal}</span>
              <span id="summaryTotal">
                {devisOnly && baseTotal === 0 ? t.sumTotalDevis : fmt(totalAvecFrais)}
              </span>
            </div>
            <div className="summary-secure-badge">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>{" "}
              {t.sumSecure}
            </div>
          </aside>
        </div>
      </div>

      {/* ============== MODALE SMART (création recommandée) ============== */}
      {smartModal && (
        <div
          id="smart-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,12,24,0.55)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            id="smart-modal"
            role="dialog"
            aria-modal="true"
            style={{
              background: "var(--color-bg-main)",
              borderRadius: 14,
              maxWidth: 520,
              width: "100%",
              padding: 28,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "grid",
                placeItems: "center",
                marginBottom: 16,
              }}
            >
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2-6-4.8-6 4.8L8.8 14 2.8 9.2h7.6z" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: 10 }}>{t.smartModalTitle}</h3>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 22 }}>
              {smartText()}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => (window.location.href = routes.creationEntreprise)}
              >
                {t.smartYes}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: "100%" }}
                onClick={() => {
                  setSmartBlocked(true);
                  setSmartModal({ from: "blocked" });
                }}
              >
                {t.smartNo}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============== PAYMODAL ============== */}
      {showPayModal && (
        <PayModal
          config={{
            label:
              (cart.serviceName || "") + (cart.planLabel ? " — " + cart.planLabel : ""),
            priceFCFA: totalAvecFrais,
            contract: cart.service === "domiciliation",
            onSubmit: submitSouscription,
            onSuccessCloseUrl: routes.espaceClient,
            labels: t,
          }}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </>
  );
}

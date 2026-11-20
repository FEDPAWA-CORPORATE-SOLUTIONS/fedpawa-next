"use client";

// ============================================================
// FEDPAWA — Souscription Conseil et Suivi Juridique et Fiscal : wizard dynamique
// Logique : 6 étapes, brouillon persistant, auto-remplissage,
// validation incrémentale, flux de paiement sans contrat.
// ============================================================

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { apiAuthPost, fetchMe } from "@/lib/auth";
import { isEmailNonVerifieError } from "@/lib/verification";
import { useEmailVerification } from "@/components/verification/EmailVerificationProvider";
import { routesFor } from "@/lib/routes";
import PayModal from "../souscription-domiciliation/PayModal";
import { ApiError } from "@/lib/api";

export interface SouscriptionConseilFiscalState {
  regimeFiscal: string;
  caEstime: string;
  secteur: string;
  description: string;
  nbSalaries: string;
  nbDeclarationsMensuelles: string;
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
  formule: string;
  periodicite: string;
  options: string[];
  chkCgv: boolean;
  chkCadre: boolean;
  chkExactitude: boolean;
}

const INITIAL: SouscriptionConseilFiscalState = {
  regimeFiscal: "",
  caEstime: "",
  secteur: "",
  description: "",
  nbSalaries: "",
  nbDeclarationsMensuelles: "",
  civilite: "",
  nomComplet: "",
  fonction: "",
  nationalite: "",
  typePiece: "",
  numPiece: "",
  email: "",
  telephone: "",
  adresse: "",
  ville: "",
  pays: "Cameroun",
  formule: "",
  periodicite: "",
  options: [],
  chkCgv: false,
  chkCadre: false,
  chkExactitude: false,
};

const TOTAL_STEPS = 6;

const MONTHS_BY_PERIODICITE: Record<string, number> = {
  mensuel: 1,
  semestriel: 6,
  annuel: 12,
};

const PRICE_SIMPLIFIE_FCFA = 35000; // par mois

const DRAFT_KEY = "souscription_conseil_fiscal_draft_v1";
type Draft = Omit<SouscriptionConseilFiscalState, never> & { step: number; savedAt: string };

const DRAFT_FIELDS: (keyof SouscriptionConseilFiscalState)[] = [
  "regimeFiscal", "caEstime", "secteur", "description", "nbSalaries", "nbDeclarationsMensuelles",
  "civilite", "nomComplet", "fonction", "nationalite", "typePiece", "numPiece",
  "email", "telephone", "adresse", "ville", "pays", "formule", "periodicite", "options",
  "chkCgv", "chkCadre", "chkExactitude",
];

function draftHasContent(d: Draft): boolean {
  if (d.step > 1) return true;
  return DRAFT_FIELDS.some((k) => {
    const v = d[k];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" ? v.trim() !== "" : !!v;
  });
}

const PAY_LABELS_FR = {
  payLoginTitle: "Connexion requise",
  payLoginText: "Connectez-vous pour finaliser votre souscription.",
  payLoginEmail: "E-mail",
  payLoginPwd: "Mot de passe",
  payLoginBtn: "Se connecter",
  payLoginAlt: "Pas encore de compte ?",
  payLoginAltLink: "Créer un compte",
  payLoginForgot: "Mot de passe oublié ?",
  payPhoneLabel: "Numéro Mobile Money",
  payOrange: "Orange Money",
  payMtn: "MTN MoMo",
  payNote: "Une invite de confirmation USSD sera envoyée sur ce numéro.",
  payBtn: "Payer",
  payCancel: "Annuler",
  payProcessing: "Traitement...",
  payVerifTitle: "Vérification du paiement",
  payVerifRef: "Référence :",
  payVerifNote: "Composez le code USSD reçu sur votre téléphone pour valider le paiement Mobile Money, puis cliquez sur Vérifier.",
  payVerifBtn: "Vérifier",
  payVerifLater: "Plus tard",
  payContractTitle: "Paiement reçu",
  payContractDocTitle: "FEDPAWA CORPORATE SOLUTIONS SARL",
  payContractDocSub: "Siège social : Immeuble Pharmacie de Logpom, Douala — Cameroun",
  payContractDocHead: "Confirmation de souscription",
  payContractBetween: "Entre les soussignés :",
  payContractCompany: "FEDPAWA CORPORATE SOLUTIONS SARL",
  payContractAnd: "et :",
  payContractFait: "Fait à Douala, le :",
  payContractMore: "Détails du contrat",
  payViewContract: "Voir le document",
  paySignNote: "Votre souscription est enregistrée.",
  payOtpLabel: "Code de confirmation",
  paySignBtn: "Valider",
  paySignedTitle: "Souscription confirmée",
  paySignedText: "Votre dossier a été transmis avec succès.",
  payDownload: "Télécharger le reçu",
  payGoClient: "Aller à mon Espace Client",
  payLoginKo: "Identifiants invalides.",
  payNetworkKo: "Erreur de réseau. Réessayez.",
  payVerifKo: "Erreur lors de la vérification.",
  payVerifNotPaid: "Paiement non confirmé.",
  payPreviewKo: "Aperçu indisponible.",
  paySignKo: "Code invalide.",
  successTitle: "Souscription enregistrée",
};

const PAY_LABELS_EN = {
  payLoginTitle: "Login required",
  payLoginText: "Log in to finalize your subscription.",
  payLoginEmail: "Email",
  payLoginPwd: "Password",
  payLoginBtn: "Log In",
  payLoginAlt: "Don't have an account?",
  payLoginAltLink: "Create an account",
  payLoginForgot: "Forgot password?",
  payPhoneLabel: "Mobile Money Number",
  payOrange: "Orange Money",
  payMtn: "MTN MoMo",
  payNote: "A USSD confirmation will be sent to this number.",
  payBtn: "Pay",
  payCancel: "Cancel",
  payProcessing: "Processing...",
  payVerifTitle: "Payment verification",
  payVerifRef: "Reference:",
  payVerifNote: "Dial the USSD code received on your phone to validate the Mobile Money payment, then click Verify.",
  payVerifBtn: "Verify",
  payVerifLater: "Later",
  payContractTitle: "Payment received",
  payContractDocTitle: "FEDPAWA CORPORATE SOLUTIONS SARL",
  payContractDocSub: "Head office: Pharmacie de Logpom Building, Douala — Cameroon",
  payContractDocHead: "Subscription confirmation",
  payContractBetween: "Between the undersigned:",
  payContractCompany: "FEDPAWA CORPORATE SOLUTIONS SARL",
  payContractAnd: "and:",
  payContractFait: "Made in Douala, on:",
  payContractMore: "Contract details",
  payViewContract: "View document",
  paySignNote: "Your subscription is recorded.",
  payOtpLabel: "Confirmation code",
  paySignBtn: "Confirm",
  paySignedTitle: "Subscription confirmed",
  paySignedText: "Your file has been transmitted successfully.",
  payDownload: "Download receipt",
  payGoClient: "Go to my Client Area",
  payLoginKo: "Invalid credentials.",
  payNetworkKo: "Network error. Try again.",
  payVerifKo: "Error during verification.",
  payVerifNotPaid: "Payment not confirmed.",
  payPreviewKo: "Preview unavailable.",
  paySignKo: "Invalid code.",
  successTitle: "Subscription recorded",
};

export default function SouscriptionConseilFiscal({ locale = "fr" }: { locale?: string }) {
  const t = getPageDictionary(locale, "souscriptionConseilFiscal");
  const routes = routesFor(locale);
  const verif = useEmailVerification();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SouscriptionConseilFiscalState>(INITIAL);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [smartModal, setSmartModal] = useState<"closed" | "open" | "blocked">("closed");
  const [showPayModal, setShowPayModal] = useState(false);
  const [kycDone, setKycDone] = useState<string | null>(null);
  const [savedDraft, setSavedDraft] = useState<Draft | null>(null);
  const [draftResolved, setDraftResolved] = useState(false);
  const meRef = useRef<Record<string, string | undefined> | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const set = <K extends keyof SouscriptionConseilFiscalState>(
    key: K,
    value: SouscriptionConseilFiscalState[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const applyMeFill = (me: Record<string, string | undefined>) => {
    const fill = (key: keyof SouscriptionConseilFiscalState, src?: string) => {
      if (!src) return;
      setForm((f) => (f[key] ? f : ({ ...f, [key]: src } as SouscriptionConseilFiscalState)));
    };
    fill("nomComplet", me.fullName);
    fill("civilite", me.civilite);
    fill("nationalite", me.nationality);
    fill("email", me.email);
    fill("telephone", me.phone);
    fill("adresse", me.address);
    fill("ville", me.city);
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        if (me && me.authenticated) {
          meRef.current = me as unknown as Record<string, string | undefined>;
          applyMeFill(meRef.current);
          if (me.kyc_status) setKycDone(me.kyc_status);
        }
      } catch {
        /* dégradation : étape KYC normale */
      }
    })();
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw || draftResolved) return;
    try {
      const d = JSON.parse(raw) as Draft;
      if (draftHasContent(d)) {
        setSavedDraft(d);
        setSmartModal("open");
      }
    } catch {
      /* ignore corrupted draft */
    }
  }, [draftResolved]);

  const resolveDraft = (action: "use" | "delete" | "ignore") => {
    if (action === "use" && savedDraft) {
      setForm((prev) => ({ ...prev, ...savedDraft }));
      setStep(savedDraft.step);
    }
    localStorage.removeItem(DRAFT_KEY);
    setSavedDraft(null);
    setDraftResolved(true);
    setSmartModal("closed");
  };

  const persistDraft = () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...form, step, savedAt: new Date().toISOString() })
    );
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  // Prix dynamique selon formule et périodicité
  const paymentPrice = useMemo(() => {
    if (form.formule === "forfait-simplifie") {
      const months = MONTHS_BY_PERIODICITE[form.periodicite] || 1;
      return PRICE_SIMPLIFIE_FCFA * months;
    }
    return 0; // sur devis
  }, [form.formule, form.periodicite]);

  const canPay = useMemo(() => paymentPrice > 0, [paymentPrice]);

  const validateStep = (stepNo: number): string[] => {
    const f = form;
    const errs: string[] = [];
    const fieldErr: Record<string, string[]> = {};

    switch (stepNo) {
      case 1:
        if (!f.regimeFiscal.trim()) fieldErr.regimeFiscal = ["Le régime fiscal est requis"];
        if (!f.caEstime.trim()) fieldErr.caEstime = ["Le chiffre d'affaires estimé est requis"];
        if (!f.secteur.trim()) fieldErr.secteur = ["Le secteur est requis"];
        if (!f.description.trim()) fieldErr.description = ["La description est requise"];
        break;
      case 2:
        if (!f.nbSalaries.trim()) fieldErr.nbSalaries = ["Le nombre de salariés est requis"];
        if (!f.nbDeclarationsMensuelles.trim()) fieldErr.nbDeclarationsMensuelles = ["Le nombre de déclarations mensuelles est requis"];
        break;
      case 3:
        if (!f.civilite.trim()) fieldErr.civilite = ["La civilité est requise"];
        if (!f.nomComplet.trim()) fieldErr.nomComplet = ["Le nom complet est requis"];
        if (!f.fonction.trim()) fieldErr.fonction = ["La fonction est requise"];
        if (!f.typePiece.trim()) fieldErr.typePiece = ["Le type de pièce est requis"];
        if (!f.numPiece.trim()) fieldErr.numPiece = ["Le numéro de pièce est requis"];
        break;
      case 4:
        if (!f.email.trim()) fieldErr.email = ["L'email est requis"];
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) fieldErr.email = ["Email invalide"];
        if (!f.telephone.trim()) fieldErr.telephone = ["Le téléphone est requis"];
        else if (!/^\+?[0-9\s]{9,16}$/.test(f.telephone)) fieldErr.telephone = ["Téléphone invalide"];
        if (!f.adresse.trim()) fieldErr.adresse = ["L'adresse est requise"];
        if (!f.ville.trim()) fieldErr.ville = ["La ville est requise"];
        break;
      case 5:
        if (!f.formule.trim()) fieldErr.formule = ["La formule est requise"];
        if (!f.periodicite.trim()) fieldErr.periodicite = ["La périodicité est requise"];
        break;
      case 6:
        if (!f.chkCgv) fieldErr.chkCgv = ["Vous devez accepter les CGV"];
        if (!f.chkCadre) fieldErr.chkCadre = ["Vous devez accepter le cadre contractuel"];
        if (!f.chkExactitude) fieldErr.chkExactitude = ["Vous devez certifier l'exactitude des informations"];
        break;
    }

    setFieldErrors(fieldErr);
    return errs;
  };

  const validateFinal = (): string[] => {
    return validateStep(1)
      .concat(validateStep(2))
      .concat(validateStep(3))
      .concat(validateStep(4))
      .concat(validateStep(5))
      .concat(validateStep(6));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateFinal();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setFieldErrors({});

    try {
      const res = await apiAuthPost<{ ok: boolean; message?: string; subscription_ref?: string }>(
        "/api/v1/souscription/conseil-fiscal",
        {
          regimeFiscal: form.regimeFiscal,
          caEstime: form.caEstime,
          secteur: form.secteur,
          description: form.description,
          nbSalaries: form.nbSalaries,
          nbDeclarationsMensuelles: form.nbDeclarationsMensuelles,
          civilite: form.civilite,
          nomComplet: form.nomComplet,
          fonction: form.fonction,
          nationalite: form.nationalite,
          typePiece: form.typePiece,
          numPiece: form.numPiece,
          email: form.email,
          telephone: form.telephone,
          adresse: form.adresse,
          ville: form.ville,
          pays: form.pays,
          formule: form.formule,
          periodicite: form.periodicite,
          options: form.options,
        }
      );
      if (res.ok) {
        clearDraft();
        setShowSuccess(true);
        setStep(TOTAL_STEPS);
      }
    } catch (err: any) {
      if (isEmailNonVerifieError(err)) {
        verif.requestGate();
        return;
      }
      setErrors([err?.message || "Erreur lors de la soumission"]);
    }
  };

  // --- Flux de paiement via PayModal (sans contrat) ---
  const handlePaySubmit = async (pay: { phone: string; operator: string; price: number }) => {
    setPayError(null);
    try {
      const res = await apiAuthPost<{ ok: boolean; message?: string; subscription_ref?: string; transaction_id?: string; subscription_id?: number; client_id?: number }>(
        "/api/v1/souscription/conseil-fiscal",
        {
          regimeFiscal: form.regimeFiscal,
          caEstime: form.caEstime,
          secteur: form.secteur,
          description: form.description,
          nbSalaries: form.nbSalaries,
          nbDeclarationsMensuelles: form.nbDeclarationsMensuelles,
          civilite: form.civilite,
          nomComplet: form.nomComplet,
          fonction: form.fonction,
          nationalite: form.nationalite,
          typePiece: form.typePiece,
          numPiece: form.numPiece,
          email: form.email,
          telephone: pay.phone,
          adresse: form.adresse,
          ville: form.ville,
          pays: form.pays,
          formule: form.formule,
          periodicite: form.periodicite,
          options: form.options,
          prix: pay.price,
        }
      );
      if (res.ok) {
        clearDraft();
        return {
          ok: true,
          message: res.message || "Paiement effectué avec succès.",
          subscription_ref: res.transaction_id || res.subscription_ref || null,
        };
      }
      return { ok: false, message: res.message || "Échec du paiement." };
    } catch (err: any) {
      if (isEmailNonVerifieError(err)) {
        verif.requestGate();
        return { ok: false, message: "Email non vérifié." };
      }
      if (err instanceof ApiError) {
        return { ok: false, message: err.message || "Erreur lors du paiement." };
      }
      return { ok: false, message: "Erreur réseau lors du paiement." };
    }
  };

  const openPayModal = () => {
    const errs = validateStep(6);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setFieldErrors({});
    setShowPayModal(true);
  };

  const closePayModal = () => {
    setShowPayModal(false);
    setPayError(null);
  };

  const payLabels = locale === "en" ? PAY_LABELS_EN : PAY_LABELS_FR;

  const nextStep = () => {
    const errs = validateStep(step);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setFieldErrors({});
    persistDraft();
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleOption = (value: string) => {
    set("options", form.options.includes(value)
      ? form.options.filter((o) => o !== value)
      : [...form.options, value]);
  };

  // Scroll en haut à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">Conseil & Suivi Juridique et Fiscal</div>
            <h1>Souscription Conseil Juridique et Fiscal</h1>
            <p className="subtitle">Sécurisez votre entreprise avec FEDPAWA</p>
            <p>Remplissez ce formulaire pour souscrire à notre service de conseil et suivi juridique et fiscal. Nos experts vous accompagnent dans toutes vos obligations fiscales et juridiques.</p>
            <p>Un processus en 6 étapes, de la situation de l'entreprise à la validation juridique, avec accompagnement par nos experts fiscaux.</p>
          </div>
        </div>
      </div>

      {showPayModal ? (
        <PayModal
          config={{
            label: "Conseil Juridique et Fiscal — Souscription",
            priceFCFA: paymentPrice,
            contract: false,
            onSubmit: handlePaySubmit,
            onSuccessCloseUrl: routes.espaceClient,
            labels: payLabels,
          }}
          onClose={closePayModal}
        />
      ) : showSuccess ? (
        <div className="container py-24 text-center">
          <div className="success-card" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2>Demande enregistrée</h2>
            <p>Votre dossier de conseil juridique et fiscal a bien été transmis à nos équipes.</p>
            <Link className="btn btn-primary btn-block" href={routes.espaceClient}>
              Aller à mon Espace Client
            </Link>
          </div>
        </div>
      ) : (
        <div className="container px-4 py-8">
          <div className="progress-bar" style={{ marginBottom: 32 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className={`step-indicator ${n <= step ? "active" : ""} ${n === step ? "current" : ""}`}
              >
                <span className="step-number">{n}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="creation-form" style={{ maxWidth: 640, margin: "0 auto" }}>
            {errors.length > 0 && (
              <div className="error-alert" role="alert">
                {errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}

            {/* ÉTAPE 1 — Situation de l'entreprise */}
            {step === 1 && (
              <div className={`step-panel ${step === 1 ? "active" : "hidden"}`}>
                <h2 className="step-title">1. Situation de l'entreprise</h2>
                <p className="step-desc">Définissez le régime fiscal et l'activité de votre entreprise.</p>
                <div className="form-grid">
                  <div className="field">
                    <label>Régime fiscal</label>
                    <select
                      value={form.regimeFiscal}
                      onChange={(e) => set("regimeFiscal", e.target.value)}
                      className={`form-control ${fieldErrors.regimeFiscal ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner le régime fiscal</option>
                      <option value="simplifie">Régime Simplifié</option>
                      <option value="reel">Régime du Réel / Corporate</option>
                    </select>
                    {fieldErrors.regimeFiscal && <span className="error-text">{fieldErrors.regimeFiscal[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Chiffre d'affaires estimé (FCFA)</label>
                    <input
                      type="number"
                      value={form.caEstime}
                      onChange={(e) => set("caEstime", e.target.value)}
                      className={`form-control ${fieldErrors.caEstime ? "error" : ""}`}
                      placeholder="Exemple : 15 000 000"
                      required
                    />
                    {fieldErrors.caEstime && <span className="error-text">{fieldErrors.caEstime[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Secteur d'activité principal</label>
                    <select
                      value={form.secteur}
                      onChange={(e) => set("secteur", e.target.value)}
                      className={`form-control ${fieldErrors.secteur ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner le secteur</option>
                      <option value="commerce">Commerce et distribution</option>
                      <option value="services">Services aux entreprises / Conseil</option>
                      <option value="btp">Bâtiment et travaux publics (BTP)</option>
                      <option value="agro">Agroalimentaire & Agriculture</option>
                      <option value="tech">Technologie, Numérique & E-commerce</option>
                      <option value="sante">Santé, Pharmacie & Bien-être</option>
                      <option value="education">Éducation, Formation & Coaching</option>
                      <option value="transport">Transport, Logistique & Import-Export</option>
                      <option value="finance">Finance, Assurance & Immobilier</option>
                      <option value="autre">Autre</option>
                    </select>
                    {fieldErrors.secteur && <span className="error-text">{fieldErrors.secteur[0]}</span>}
                  </div>
                  <div className="field full-width">
                    <label>Description synthétique des activités</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      className={`form-control ${fieldErrors.description ? "error" : ""}`}
                      placeholder="Décrivez brièvement l'objet social de votre entreprise."
                      rows={4}
                      required
                    />
                    {fieldErrors.description && <span className="error-text">{fieldErrors.description[0]}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 — Activité */}
            {step === 2 && (
              <div className={`step-panel ${step === 2 ? "active" : "hidden"}`}>
                <h2 className="step-title">2. Activité</h2>
                <p className="step-desc">Précisez la taille de votre entreprise et vos obligations déclaratives.</p>
                <div className="form-grid">
                  <div className="field">
                    <label>Nombre de salariés</label>
                    <input
                      type="number"
                      value={form.nbSalaries}
                      onChange={(e) => set("nbSalaries", e.target.value)}
                      className={`form-control ${fieldErrors.nbSalaries ? "error" : ""}`}
                      placeholder="Exemple : 5"
                      required
                    />
                    {fieldErrors.nbSalaries && <span className="error-text">{fieldErrors.nbSalaries[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Nombre de déclarations mensuelles</label>
                    <input
                      type="number"
                      value={form.nbDeclarationsMensuelles}
                      onChange={(e) => set("nbDeclarationsMensuelles", e.target.value)}
                      className={`form-control ${fieldErrors.nbDeclarationsMensuelles ? "error" : ""}`}
                      placeholder="Exemple : 12"
                      required
                    />
                    {fieldErrors.nbDeclarationsMensuelles && <span className="error-text">{fieldErrors.nbDeclarationsMensuelles[0]}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 — Représentant légal */}
            {step === 3 && (
              <div className={`step-panel ${step === 3 ? "active" : "hidden"}`}>
                <h2 className="step-title">3. Représentant Légal</h2>
                <p className="step-desc">Désignez le ou les représentants légaux de votre entreprise.</p>
                <div className="form-grid">
                  <div className="field">
                    <label>Civilité</label>
                    <select
                      value={form.civilite}
                      onChange={(e) => set("civilite", e.target.value)}
                      className={`form-control ${fieldErrors.civilite ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="Monsieur">Monsieur</option>
                      <option value="Madame">Madame</option>
                    </select>
                    {fieldErrors.civilite && <span className="error-text">{fieldErrors.civilite[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Nom complet (Nom et Prénoms)</label>
                    <input
                      type="text"
                      value={form.nomComplet}
                      onChange={(e) => set("nomComplet", e.target.value)}
                      className={`form-control ${fieldErrors.nomComplet ? "error" : ""}`}
                      placeholder="Exemple : Jean Dupont"
                      required
                    />
                    {fieldErrors.nomComplet && <span className="error-text">{fieldErrors.nomComplet[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Fonction / Qualité</label>
                    <select
                      value={form.fonction}
                      onChange={(e) => set("fonction", e.target.value)}
                      className={`form-control ${fieldErrors.fonction ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="gerant">Gérant / Co-gérant</option>
                      <option value="president">Président / Director</option>
                      <option value="directeur-general">Directeur Général</option>
                      <option value="fondateur">Fondateur / Promoteur</option>
                      <option value="mandataire">Mandataire / Fondé de pouvoir</option>
                    </select>
                    {fieldErrors.fonction && <span className="error-text">{fieldErrors.fonction[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Nationalité</label>
                    <input
                      type="text"
                      value={form.nationalite}
                      onChange={(e) => set("nationalite", e.target.value)}
                      className={`form-control ${fieldErrors.nationalite ? "error" : ""}`}
                      placeholder="Exemple : Camerounaise"
                    />
                  </div>
                  <div className="field">
                    <label>Type de pièce d'identité</label>
                    <select
                      value={form.typePiece}
                      onChange={(e) => set("typePiece", e.target.value)}
                      className={`form-control ${fieldErrors.typePiece ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="CNI">Carte Nationale d'Identité (CNI)</option>
                      <option value="Passeport">Passeport</option>
                      <option value="CarteSejour">Carte de Séjour / Titre de Résidence</option>
                    </select>
                    {fieldErrors.typePiece && <span className="error-text">{fieldErrors.typePiece[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Numéro de la pièce d'identité</label>
                    <input
                      type="text"
                      value={form.numPiece}
                      onChange={(e) => set("numPiece", e.target.value)}
                      className={`form-control ${fieldErrors.numPiece ? "error" : ""}`}
                      placeholder="Numéro de la pièce d'identité"
                      required
                    />
                    {fieldErrors.numPiece && <span className="error-text">{fieldErrors.numPiece[0]}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 — Coordonnées & Notification */}
            {step === 4 && (
              <div className={`step-panel ${step === 4 ? "active" : "hidden"}`}>
                <h2 className="step-title">4. Coordonnées & Notification</h2>
                <p className="step-desc">Fournissez vos coordonnées pour le suivi de votre dossier.</p>
                <div className="form-grid">
                  <div className="field">
                    <label>Adresse e-mail professionnelle</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={`form-control ${fieldErrors.email ? "error" : ""}`}
                      placeholder="vous@entreprise.com"
                      required
                    />
                    {fieldErrors.email && <span className="error-text">{fieldErrors.email[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Téléphone principal (WhatsApp)</label>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => set("telephone", e.target.value)}
                      className={`form-control ${fieldErrors.telephone ? "error" : ""}`}
                      placeholder="+237 6XX XXX XXX"
                      required
                    />
                    {fieldErrors.telephone && <span className="error-text">{fieldErrors.telephone[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Adresse de résidence / Siège actuel</label>
                    <input
                      type="text"
                      value={form.adresse}
                      onChange={(e) => set("adresse", e.target.value)}
                      className={`form-control ${fieldErrors.adresse ? "error" : ""}`}
                      placeholder="Exemple : Immeuble X, Quartier Y, Douala"
                      required
                    />
                    {fieldErrors.adresse && <span className="error-text">{fieldErrors.adresse[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Ville</label>
                    <input
                      type="text"
                      value={form.ville}
                      onChange={(e) => set("ville", e.target.value)}
                      className={`form-control ${fieldErrors.ville ? "error" : ""}`}
                      placeholder="Douala"
                      required
                    />
                    {fieldErrors.ville && <span className="error-text">{fieldErrors.ville[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Pays</label>
                    <select
                      value={form.pays}
                      onChange={(e) => set("pays", e.target.value)}
                      className={`form-control ${fieldErrors.pays ? "error" : ""}`}
                      required
                    >
                      <option value="Cameroun">Cameroun</option>
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 5 — Choix de la formule */}
            {step === 5 && (
              <div className={`step-panel ${step === 5 ? "active" : "hidden"}`}>
                <h2 className="step-title">5. Choix de la formule</h2>
                <p className="step-desc">Sélectionnez le forfait adapté à votre régime fiscal et à votre volume d'activité.</p>
                <div className="form-grid">
                  <div className="field">
                    <label>Formule</label>
                    <select
                      value={form.formule}
                      onChange={(e) => set("formule", e.target.value)}
                      className={`form-control ${fieldErrors.formule ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner la formule</option>
                      <option value="forfait-simplifie">Forfait Régime Simplifié — 35 000 FCFA / mois</option>
                      <option value="forfait-reel">Forfait Régime du Réel / Corporate — Sur devis personnalisé</option>
                    </select>
                    {fieldErrors.formule && <span className="error-text">{fieldErrors.formule[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Périodicité</label>
                    <select
                      value={form.periodicite}
                      onChange={(e) => set("periodicite", e.target.value)}
                      className={`form-control ${fieldErrors.periodicite ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner la périodicité</option>
                      <option value="mensuel">Mensuel (Paiement chaque mois)</option>
                      <option value="semestriel">Semestriel (6 mois)</option>
                      <option value="annuel">Annuel (12 mois — Bénéficiez de remises exclusives)</option>
                    </select>
                    {fieldErrors.periodicite && <span className="error-text">{fieldErrors.periodicite[0]}</span>}
                  </div>
                </div>
                <div className="options-grid">
                  <label className="option-label">Options complémentaires :</label>
                  <div className="options-list">
                    <label className="option-item">
                      <input
                        type="checkbox"
                        value="heures-supplementaires"
                        checked={form.options.includes("heures-supplementaires")}
                        onChange={(e) => toggleOption("heures-supplementaires")}
                      />
                      Heures de bureau supplémentaires
                    </label>
                    <label className="option-item">
                      <input
                        type="checkbox"
                        value="ligne-telephonique"
                        checked={form.options.includes("ligne-telephonique")}
                        onChange={(e) => toggleOption("ligne-telephonique")}
                      />
                      Attribution de ligne téléphonique / Standard dédié
                    </label>
                    <label className="option-item">
                      <input
                        type="checkbox"
                        value="salle-reunion"
                        checked={form.options.includes("salle-reunion")}
                        onChange={(e) => toggleOption("salle-reunion")}
                      />
                      Réservation de salle de réunion / Conférence
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 6 — Validation & Paiement */}
            {step === 6 && (
              <div className={`step-panel ${step === 6 ? "active" : "hidden"}`}>
                <h2 className="step-title">6. Validation & Paiement</h2>
                <p className="step-desc">Confirmez votre demande, validez les conditions et procédez au paiement.</p>
                <div className="checkbox-group">
                  <label className="checkbox-line validation-line">
                    <input
                      type="checkbox"
                      id="chk-cgv"
                      required
                      checked={form.chkCgv}
                      onChange={() => set("chkCgv", !form.chkCgv)}
                    />
                    {" "}
                    <span>J'accepte expressément les Conditions Générales de Vente et la Politique de Confidentialité de FEDPAWA CORPORATE SOLUTIONS SARL.</span>
                  </label>
                  <label className="checkbox-line validation-line">
                    <input
                      type="checkbox"
                      id="chk-cadre"
                      required
                      checked={form.chkCadre}
                      onChange={() => set("chkCadre", !form.chkCadre)}
                    />
                    {" "}
                    <span>Je reconnais que la prestation de conseil juridique et fiscal est régie par une convention de prestation de services.</span>
                  </label>
                  <label className="checkbox-line validation-line">
                    <input
                      type="checkbox"
                      id="chk-exactitude"
                      required
                      checked={form.chkExactitude}
                      onChange={() => set("chkExactitude", !form.chkExactitude)}
                    />
                    {" "}
                    <span>Je certifie sur l'honneur que les informations et documents fournis sont exacts, authentiques et sincères.</span>
                  </label>
                </div>
                {(fieldErrors.chkCgv || fieldErrors.chkCadre || fieldErrors.chkExactitude) && (
                  <span className="error-text">
                    {fieldErrors.chkCgv?.[0] || ""}
                    {fieldErrors.chkCadre?.[0] || ""}
                    {fieldErrors.chkExactitude?.[0] || ""}
                  </span>
                )}
                {!canPay ? (
                  <div className="invoice-summary" style={{ marginTop: 24, padding: 16, background: "#fdfcf9", borderRadius: 8, border: "1px solid rgba(212,175,55,0.2)" }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Devis personnalisé</div>
                    <p style={{ margin: 0, fontSize: "0.85rem" }}>
                      La formule "Régime du Réel / Corporate" est établie sur devis personnalisé. Nos équipes vous contacteront pour finaliser le montant et les modalités de paiement.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="invoice-summary" style={{ marginTop: 24, padding: 16, background: "#fdfcf9", borderRadius: 8, border: "1px solid rgba(212,175,55,0.2)" }}>
                      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Facture proforma</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                        <span>Date :</span>
                        <span>{new Date().toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                        <span>Prestation :</span>
                        <span>Conseil juridique et fiscal — {form.formule === "forfait-simplifie" ? "Forfait Régime Simplifié" : "Forfait Régime du Réel"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                        <span>Périodicité :</span>
                        <span>{form.periodicite}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 8 }}>
                        <span>Montant :</span>
                        <span>{paymentPrice.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={openPayModal}
                      style={{ marginTop: 16 }}
                    >
                      Payer {paymentPrice.toLocaleString("fr-FR")} FCFA (Mobile Money)
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="step-nav">
              {step > 1 && (
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  ← Précédent
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Suivant →
                </button>
              ) : null}
            </div>
          </form>
        </div>
      )}
    </>
  );
}

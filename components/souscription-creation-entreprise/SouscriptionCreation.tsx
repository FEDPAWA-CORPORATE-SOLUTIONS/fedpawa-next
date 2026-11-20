"use client";

// ============================================================
// FEDPAWA — Souscription Création d'Entreprise : wizard dynamique
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

export interface SouscriptionCreationState {
  denomination: string;
  formeJuridique: string;
  secteur: string;
  description: string;
  capital: string;
  apportsNumeraires: string;
  apportsNature: string;
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
  chkCgv: boolean;
  chkCadre: boolean;
  chkExactitude: boolean;
}

const INITIAL: SouscriptionCreationState = {
  denomination: "",
  formeJuridique: "",
  secteur: "",
  description: "",
  capital: "",
  apportsNumeraires: "",
  apportsNature: "",
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
  chkCgv: false,
  chkCadre: false,
  chkExactitude: false,
};

const TOTAL_STEPS = 6;
const PAYMENT_PRICE_FCFA = 100000; // Prix fixe création d'entreprise

const DRAFT_KEY = "souscription_creation_draft_v1";
type Draft = Omit<SouscriptionCreationState, never> & { step: number; savedAt: string };

const DRAFT_FIELDS: (keyof SouscriptionCreationState)[] = [
  "denomination", "formeJuridique", "secteur", "description", "capital", "apportsNumeraires",
  "apportsNature", "civilite", "nomComplet", "fonction", "nationalite", "typePiece", "numPiece",
  "email", "telephone", "adresse", "ville", "pays", "chkCgv", "chkCadre", "chkExactitude",
];

function draftHasContent(d: Draft): boolean {
  if (d.step > 1) return true;
  return DRAFT_FIELDS.some((k) => {
    const v = d[k];
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

export default function SouscriptionCreation({ locale = "fr" }: { locale?: string }) {
  const t = getPageDictionary(locale, "souscriptionCreation");
  const routes = routesFor(locale);
  const verif = useEmailVerification();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SouscriptionCreationState>(INITIAL);
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

  const set = <K extends keyof SouscriptionCreationState>(
    key: K,
    value: SouscriptionCreationState[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const applyMeFill = (me: Record<string, string | undefined>) => {
    const fill = (key: keyof SouscriptionCreationState, src?: string) => {
      if (!src) return;
      setForm((f) => (f[key] ? f : ({ ...f, [key]: src } as SouscriptionCreationState)));
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

  const validateStep = (stepNo: number): string[] => {
    const f = form;
    const errs: string[] = [];
    const fieldErr: Record<string, string[]> = {};

    switch (stepNo) {
      case 1:
        if (!f.denomination.trim()) fieldErr.denomination = ["La dénomination est requise"];
        if (!f.formeJuridique.trim()) fieldErr.formeJuridique = ["La forme juridique est requise"];
        if (!f.secteur.trim()) fieldErr.secteur = ["Le secteur est requis"];
        if (!f.description.trim()) fieldErr.description = ["La description est requise"];
        break;
      case 2:
        if (!f.capital.trim()) fieldErr.capital = ["Le capital social est requis"];
        if (!f.apportsNumeraires.trim()) fieldErr.apportsNumeraires = ["Les apports en numéraire sont requis"];
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
        "/api/v1/souscription/creation-entreprise",
        {
          denomination: form.denomination,
          formeJuridique: form.formeJuridique,
          secteur: form.secteur,
          description: form.description,
          capital: form.capital,
          apportsNumeraires: form.apportsNumeraires,
          apportsNature: form.apportsNature,
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
        "/api/v1/souscription/creation-entreprise",
        {
          denomination: form.denomination,
          formeJuridique: form.formeJuridique,
          secteur: form.secteur,
          description: form.description,
          capital: form.capital,
          apportsNumeraires: form.apportsNumeraires,
          apportsNature: form.apportsNature,
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

  // Scroll en haut à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">Constitution d'Entreprise</div>
            <h1>Création d'Entreprise — Souscription en Ligne</h1>
            <p className="subtitle">Constituez votre société en toute simplicité avec FEDPAWA</p>
            <p>Remplissez ce formulaire pour créer votre entreprise au Cameroun en toute sécurité juridique. FEDPAWA prend en charge l'intégralité de vos démarches de constitution auprès des autorités camerounaises.</p>
            <p>Un processus en 6 étapes, de la situation de l'entreprise à la validation juridique, avec accompagnement par nos experts.</p>
          </div>
        </div>
      </div>

      {showPayModal ? (
        <PayModal
          config={{
            label: "Création d'entreprise — Souscription",
            priceFCFA: PAYMENT_PRICE_FCFA,
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
            <p>Votre dossier de création d'entreprise a bien été transmis à nos équipes.</p>
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
                <p className="step-desc">Définissez l'identité et l'activité de votre entreprise.</p>
                <div className="form-grid">
                  <div className="field">
                    <label>Dénomination sociale / Nom commercial</label>
                    <input
                      type="text"
                      value={form.denomination}
                      onChange={(e) => set("denomination", e.target.value)}
                      className={`form-control ${fieldErrors.denomination ? "error" : ""}`}
                      placeholder="Exemple : FEDPAWA CORPORATE SOLUTIONS SARL"
                      required
                    />
                    {fieldErrors.denomination && <span className="error-text">{fieldErrors.denomination[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Forme juridique</label>
                    <select
                      value={form.formeJuridique}
                      onChange={(e) => set("formeJuridique", e.target.value)}
                      className={`form-control ${fieldErrors.formeJuridique ? "error" : ""}`}
                      required
                    >
                      <option value="">Sélectionner la forme juridique</option>
                      <option value="SARL">SARL</option>
                      <option value="SARLU">SARLU</option>
                      <option value="SAS">SAS</option>
                      <option value="SASU">SASU</option>
                      <option value="SA">SA</option>
                      <option value="etablissement">Établissement (Nom propre)</option>
                      <option value="GIE">GIE (Groupement d'Intérêt Économique)</option>
                      <option value="succursale">Succursale / Filiale</option>
                      <option value="autre">Autre</option>
                    </select>
                    {fieldErrors.formeJuridique && <span className="error-text">{fieldErrors.formeJuridique[0]}</span>}
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

            {/* ÉTAPE 2 — Capital et apports */}
            {step === 2 && (
              <div className={`step-panel ${step === 2 ? "active" : "hidden"}`}>
                <h2 className="step-title">2. Capital et Apports</h2>
                <p className="step-desc">Définissez le capital social et la répartition des apports.</p>
                <div className="form-grid">
                  <div className="field">
                    <label>Capital social (FCFA)</label>
                    <input
                      type="number"
                      value={form.capital}
                      onChange={(e) => set("capital", e.target.value)}
                      className={`form-control ${fieldErrors.capital ? "error" : ""}`}
                      placeholder="Exemple : 1 000 000"
                      required
                    />
                    {fieldErrors.capital && <span className="error-text">{fieldErrors.capital[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Apports en numéraire (FCFA)</label>
                    <input
                      type="number"
                      value={form.apportsNumeraires}
                      onChange={(e) => set("apportsNumeraires", e.target.value)}
                      className={`form-control ${fieldErrors.apportsNumeraires ? "error" : ""}`}
                      placeholder="Exemple : 500 000"
                      required
                    />
                    {fieldErrors.apportsNumeraires && <span className="error-text">{fieldErrors.apportsNumeraires[0]}</span>}
                  </div>
                  <div className="field">
                    <label>Apports en nature</label>
                    <textarea
                      value={form.apportsNature}
                      onChange={(e) => set("apportsNature", e.target.value)}
                      className="form-control"
                      placeholder="Matériel, fonds de commerce, etc."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 — Représentant légal */}
            {step === 3 && (
              <div className={`step-panel ${step === 3 ? "active" : "hidden"}`}>
                <h2 className="step-title">3. Représentant légal</h2>
                <p className="step-desc">Désignez le représentant légal de l'entreprise.</p>
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
                    <label>Nom complet</label>
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
                    <label>Numéro de pièce d'identité</label>
                    <input
                      type="text"
                      value={form.numPiece}
                      onChange={(e) => set("numPiece", e.target.value)}
                      className={`form-control ${fieldErrors.numPiece ? "error" : ""}`}
                      placeholder="Numéro de la pièce"
                      required
                    />
                    {fieldErrors.numPiece && <span className="error-text">{fieldErrors.numPiece[0]}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 — Coordonnées & notification */}
            {step === 4 && (
              <div className={`step-panel ${step === 4 ? "active" : "hidden"}`}>
                <h2 className="step-title">4. Coordonnées & notification</h2>
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

            {/* ÉTAPE 5 — Conformité & KYC */}
            {step === 5 && (
              <div className={`step-panel ${step === 5 ? "active" : "hidden"}`}>
                <h2 className="step-title">5. Conformité & KYC</h2>
                <p className="step-desc">Téléchargez les documents requis pour votre dossier KYC.</p>
                <div className="kyc-dropzones">
                  <div className="dropzone">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      required
                    />
                    <div className="dropzone-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2V15M12 17l5 5M7 17l5-5" />
                      </svg>
                    </div>
                    <p>Pièce d'identité (CNI ou Passeport)</p>
                  </div>
                  <div className="dropzone">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      required
                    />
                    <div className="dropzone-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M12 18v-6" />
                        <path d="M9 15h6" />
                      </svg>
                    </div>
                    <p>Statuts de l'entreprise</p>
                  </div>
                  <div className="kyc-note">
                    <p>Les documents KYC sont obligatoires pour ouvrir votre dossier. Ils seront traités conformément à notre dispositif de protection des données.</p>
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
                    <span>J'accepte les Conditions Générales de Vente</span>
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
                    <span>J'accepte le cadre contractuel</span>
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
                    <span>Je certifie l'exactitude des informations</span>
                  </label>
                </div>
                {(fieldErrors.chkCgv || fieldErrors.chkCadre || fieldErrors.chkExactitude) && (
                  <span className="error-text">
                    {fieldErrors.chkCgv?.[0] || ""}
                    {fieldErrors.chkCadre?.[0] || ""}
                    {fieldErrors.chkExactitude?.[0] || ""}
                  </span>
                )}
                <div className="invoice-summary" style={{ marginTop: 24, padding: 16, background: "#fdfcf9", borderRadius: 8, border: "1px solid rgba(212,175,55,0.2)" }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Facture proforma</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span>Date :</span>
                    <span>{new Date().toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span>Prestation :</span>
                    <span>Création d'entreprise — Constitution juridique</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 8 }}>
                    <span>Montant :</span>
                    <span>{PAYMENT_PRICE_FCFA.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={openPayModal}
                  style={{ marginTop: 16 }}
                >
                  Payer {PAYMENT_PRICE_FCFA.toLocaleString("fr-FR")} FCFA (Mobile Money)
                </button>
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

// ==========================================================
// FEDPAWA — Souscription Rédaction de Contrats : wizard 6 étapes
// Conversion du formulaire de souscription de domiciliation
// adapté pour la rédaction de contrats.
//
// Étapes :
// 1. Sélection du type de contrat
// 2. Questionnaire détaillé (questions spécifiques au type choisi)
// 3. Options et personnalisation (clauses optionnelles)
// 4. Représentant légal (civilité, nom, fonction, pièce d'identité)
// 5. Coordonnées & notification (email, téléphone, adresse, ville, pays)
// 6. Validation juridique (cases, bouton générer)
// ==========================================================

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { ApiError } from "@/lib/api";
import { apiAuthPost, fetchMe } from "@/lib/auth";
import { emailNonVerifieMessage, isEmailNonVerifieError } from "@/lib/verification";
import { useEmailVerification } from "@/components/verification/EmailVerificationProvider";
import { routesFor } from "@/lib/routes";
import PayModal from "../souscription-domiciliation/PayModal";

export interface SouscriptionContratsProps {
  locale?: Locale;
}

type TypeContrat = "commercial" | "travail" | "prestation" | "confidentialite" | "bail" | "distribution" | "franchise" | "sous-traitance";

interface SouscriptionContratsState {
  typeContrat: TypeContrat;
  // Étape 2 — Questionnaire détaillé (champs spécifiques par type)
  nomEntreprise: string;
  objetSocial: string;
  formeJuridique: string;
  rccm: string;
  niu: string;
  nbSalaries?: string;
  // Étape 3 — Options
  clausesOptionnelles: string[];
  formule?: string;
  options: string[];
  // Étape 4 — Représentant légal
  civilite: string;
  nomComplet: string;
  fonction: string;
  nationalite: string;
  typePiece: string;
  numPiece: string;
  // Étape 5 — Coordonnées
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  // Étape 6 — Validation
  periodicite: string;
  files: { identite?: File; statuts?: File; contrat?: File };
  chkCgv: boolean;
  chkCadre: boolean;
  chkExactitude: boolean;
}

const INITIAL: SouscriptionContratsState = {
  typeContrat: "commercial",
  nomEntreprise: "",
  objetSocial: "",
  formeJuridique: "",
  rccm: "",
  niu: "",
  nbSalaries: "",
  clausesOptionnelles: [],
  formule: "",
  options: [],
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
  periodicite: "mensuel",
  files: {},
  chkCgv: false,
  chkCadre: false,
  chkExactitude: false,
};

const TOTAL_STEPS = 6;

const DRAFT_KEY = "souscription_contrats_draft_v1";
type Draft = Omit<SouscriptionContratsState, "files"> & { step: number; savedAt: string };

const DRAFT_FIELDS: (keyof Omit<SouscriptionContratsState, "files">)[] = [
  "typeContrat", "nomEntreprise", "objetSocial", "formeJuridique", "rccm", "niu",
  "civilite", "nomComplet", "fonction", "nationalite", "typePiece", "numPiece",
  "email", "telephone", "adresse", "ville", "pays", "formule", "periodicite", "options",
  "chkCgv", "chkCadre", "chkExactitude",
];

function draftHasContent(d: Draft): boolean {
  if (d.step > 1) return true;
  if (Array.isArray(d.options) && d.options.length) return true;
  if (d.chkCgv || d.chkCadre || d.chkExactitude) return true;
  return DRAFT_FIELDS.some((k) => {
    const v = d[k];
    return typeof v === "string" && v.trim() !== "";
  });
}

export default function SouscriptionContrats({ locale = "fr" }: SouscriptionContratsProps) {
  const t = getPageDictionary(locale, "souscriptionContrats");
  const routes = routesFor(locale);
  const verif = useEmailVerification();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SouscriptionContratsState>(INITIAL);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [smartModal, setSmartModal] = useState<"closed" | "open" | "blocked">("closed");
  const [showPayModal, setShowPayModal] = useState(false);
  const [kycDone, setKycDone] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [savedDraft, setSavedDraft] = useState<Draft | null>(null);
  const [draftResolved, setDraftResolved] = useState(false);
  const meRef = useRef<Record<string, string | undefined> | null>(null);

  const set = <K extends keyof SouscriptionContratsState>(key: K, value: SouscriptionContratsState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (step: number): string[] => {
    const f = form;
    const errs: string[] = [];
    const fieldErr: Record<string, string[]> = {};

    switch (step) {
      case 1:
        if (!f.typeContrat.trim()) fieldErrors.typeContrat = ["Le type de contrat est requis"];
        break;
      case 2:
        if (!f.nomEntreprise.trim()) fieldErrors.nomEntreprise = ["Le nom de l'entreprise est requis"];
        if (!f.objetSocial.trim()) fieldErrors.objetSocial = ["L'objet social est requis"];
        break;
      case 3:
        if (f.clausesOptionnelles.length === 0) fieldErrors.clausesOptionnelles = ["Sélectionnez au moins une option"];
        break;
      case 4:
        if (!f.civilite.trim()) fieldErrors.civilite = ["La civilité est requise"];
        if (!f.nomComplet.trim()) fieldErrors.nomComplet = ["Le nom complet est requis"];
        if (!f.fonction.trim()) fieldErrors.fonction = ["La fonction est requise"];
        if (!f.typePiece.trim()) fieldErrors.typePiece = ["Le type de pièce est requis"];
        if (!f.numPiece.trim()) fieldErrors.numPiece = ["Le numéro de pièce est requis"];
        break;
      case 5:
        if (!f.email.trim()) fieldErrors.email = ["L'email est requis"];
        if (!f.telephone.trim()) fieldErrors.telephone = ["Le téléphone est requis"];
        if (!f.adresse.trim()) fieldErrors.adresse = ["L'adresse est requise"];
        if (!f.ville.trim()) fieldErrors.ville = ["La ville est requise"];
        break;
      case 6:
        if (!f.chkCgv) fieldErrors.chkCgv = ["Vous devez accepter les CGV"];
        if (!f.chkCadre) fieldErrors.chkCadre = ["Vous devez accepter le cadre contractuel"];
        if (!f.chkExactitude) fieldErrors.chkExactitude = ["Vous devez certifier l'exactitude des informations"];
        break;
    }

    setFieldErrors(fieldErr);
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep(step);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setFieldErrors({});

    try {
      const res = await apiAuthPost<{ ok: boolean; message?: string }>(
        "/api/v1/souscription/contrats",
        {
          typeContrat: form.typeContrat,
          nomEntreprise: form.nomEntreprise,
          objetSocial: form.objetSocial,
          formeJuridique: form.formeJuridique,
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
          options: form.options,
          periodicite: form.periodicite,
        }
      );
      if (res.ok) {
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

  const nextStep = () => {
    if (step < TOTAL_STEPS) {
      const errs = validateStep(step);
      if (errs.length > 0) {
        setErrors(errs);
        return;
      }
      setErrors([]);
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleDrop = (e: React.DragEvent, field: keyof SouscriptionContratsState["files"]) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) setForm((f) => ({ ...f, files: { ...f.files, [field]: files[0] } }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver("drag");
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof SouscriptionContratsState["files"]) => {
    const files = e.target.files;
    if (files?.length) setForm((f) => ({ ...f, files: { ...f.files, [field]: files[0] } }));
  };

  const removeFile = (field: keyof SouscriptionContratsState["files"]) => {
    setForm((f) => ({ ...f, files: { ...f.files, [field]: undefined } }));
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">{t.subHeroBadge}</div>
            <h1>{t.subHeroTitle}</h1>
            <p className="subtitle">{t.subHeroSubtitle}</p>
            <p>{t.subHeroText1}</p>
            <p>{t.subHeroText2}</p>
          </div>
        </div>
      </div>

      {showSuccess ? (
        <div className="container py-24 text-center">
          <div className="success-card" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2>{t.subSuccessTitle}</h2>
            <p>{t.subSuccessMessage}</p>
            <Link className="btn btn-primary btn-block" href={routes.espaceClient}>
              {t.subBtnEspaceClient}
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

            {/* ÉTAPE 1 — Sélection du type de contrat */}
            {step === 1 && (
              <div className={`step-panel ${step === 1 ? "active" : "hidden"}`}>
                <h2 className="step-title">{t.subStep1Title}</h2>
                <p className="step-desc">{t.subStep1Text}</p>
                <div className="contrat-types">
                  {[
                    { id: "commercial", label: t.typeCommercial, desc: t.descCommercial },
                    { id: "travail", label: t.typeTravail, desc: t.descTravail },
                    { id: "prestation", label: t.typePrestation, desc: t.descPrestation },
                    { id: "confidentialite", label: t.typeConfidentialite, desc: t.descConfidentialite },
                    { id: "bail", label: t.typeBail, desc: t.descBail },
                    { id: "distribution", label: t.typeDistribution, desc: t.descDistribution },
                    { id: "franchise", label: t.typeFranchise, desc: t.descFranchise },
                    { id: "sous-traitance", label: t.typeSousTraitance, desc: t.descSousTraitance },
                  ].map((tc) => (
                    <label key={tc.id} className={`contrat-option ${form.typeContrat === tc.id ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="typeContrat"
                        value={tc.id}
                        checked={form.typeContrat === tc.id}
                        onChange={(e) => set("typeContrat", e.target.value as TypeContrat)}
                      />
                      <span className="contrat-label">{tc.label}</span>
                      <span className="contrat-desc">{tc.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ÉTAPE 2 — Questionnaire détaillé */}
            {step === 2 && (
              <div className={`step-panel ${step === 2 ? "active" : "hidden"}`}>
                <h2 className="step-title">{t.subStep2Title}</h2>
                <p className="step-desc">{t.subStep2Text}</p>
                <div className="form-grid">
                  <div className="field">
                    <label>{t.subFieldNomEntreprise}</label>
                    <input
                      type="text"
                      value={form.nomEntreprise}
                      onChange={(e) => set("nomEntreprise", e.target.value)}
                      className={`form-control ${fieldErrors.nomEntreprise ? "error" : ""}`}
                      placeholder={t.subPlaceholderNomEntreprise}
                    />
                    {fieldErrors.nomEntreprise && <span className="error-text">{fieldErrors.nomEntreprise[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldObjetSocial}</label>
                    <textarea
                      value={form.objetSocial}
                      onChange={(e) => set("objetSocial", e.target.value)}
                      className={`form-control ${fieldErrors.objetSocial ? "error" : ""}`}
                      placeholder={t.subPlaceholderObjetSocial}
                      rows={4}
                    />
                    {fieldErrors.objetSocial && <span className="error-text">{fieldErrors.objetSocial[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldFormeJuridique}</label>
                    <select
                      value={form.formeJuridique}
                      onChange={(e) => set("formeJuridique", e.target.value)}
                      className={`form-control ${fieldErrors.formeJuridique ? "error" : ""}`}
                    >
                      <option value="">{t.subPlaceholderFormeJuridique}</option>
                      <option value="SARL">SARL</option>
                      <option value="SARLU">SARLU</option>
                      <option value="SAS">SAS</option>
                      <option value="SASU">SASU</option>
                      <option value="SA">SA</option>
                      <option value="etablissement">Établissement (Nom propre)</option>
                      <option value="GIE">GIE (Groupement d'Intérêt Économique)</option>
                    </select>
                    {fieldErrors.formeJuridique && <span className="error-text">{fieldErrors.formeJuridique[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldRCCM}</label>
                    <input
                      type="text"
                      value={form.rccm}
                      onChange={(e) => set("rccm", e.target.value)}
                      className={`form-control ${fieldErrors.rccm ? "error" : ""}`}
                      placeholder={t.subPlaceholderRCCM}
                    />
                    {fieldErrors.rccm && <span className="error-text">{fieldErrors.rccm[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldNIU}</label>
                    <input
                      type="text"
                      value={form.niu}
                      onChange={(e) => set("niu", e.target.value)}
                      className={`form-control ${fieldErrors.niu ? "error" : ""}`}
                      placeholder={t.subPlaceholderNIU}
                    />
                    {fieldErrors.niu && <span className="error-text">{fieldErrors.niu[0]}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 — Options et personnalisation */}
            {step === 3 && (
              <div className={`step-panel ${step === 3 ? "active" : "hidden"}`}>
                <h2 className="step-title">{t.subStep3Title}</h2>
                <p className="step-desc">{t.subStep3Text}</p>
                <div className="options-grid">
                  {[
                    { id: "non-concurrence", label: t.optionNonConcurrence, desc: t.descNonConcurrence },
                    { id: "confidentialite", label: t.optionConfidentialite, desc: t.descConfidentialiteOpt },
                    { id: "droit-resiliation", label: t.optionDroitResiliation, desc: t.descDroitResiliation },
                    { id: "garantie", label: t.optionGarantie, desc: t.descGarantie },
                    { id: "penalites", label: t.optionPenalites, desc: t.descPenalites },
                  ].map((opt) => (
                    <label key={opt.id} className="option-item">
                      <input
                        type="checkbox"
                        value={opt.id}
                        checked={form.options.includes(opt.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          set("options", checked ? [...form.options, opt.id] : form.options.filter((o) => o !== opt.id));
                        }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ÉTAPE 4 — Représentant légal */}
            {step === 4 && (
              <div className={`step-panel ${step === 4 ? "active" : "hidden"}`}>
                <h2 className="step-title">{t.subStep4Title}</h2>
                <p className="step-desc">{t.subStep4Text}</p>
                <div className="form-grid">
                  <div className="field">
                    <label>{t.subFieldCivilite}</label>
                    <select
                      value={form.civilite}
                      onChange={(e) => set("civilite", e.target.value)}
                      className={`form-control ${fieldErrors.civilite ? "error" : ""}`}
                    >
                      <option value="">{t.subPlaceholderCivilite}</option>
                      <option value="Monsieur">Monsieur</option>
                      <option value="Madame">Madame</option>
                    </select>
                    {fieldErrors.civilite && <span className="error-text">{fieldErrors.civilite[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldNomComplet}</label>
                    <input
                      type="text"
                      value={form.nomComplet}
                      onChange={(e) => set("nomComplet", e.target.value)}
                      className={`form-control ${fieldErrors.nomComplet ? "error" : ""}`}
                      placeholder={t.subPlaceholderNomComplet}
                    />
                    {fieldErrors.nomComplet && <span className="error-text">{fieldErrors.nomComplet[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldFonction}</label>
                    <select
                      value={form.fonction}
                      onChange={(e) => set("fonction", e.target.value)}
                      className={`form-control ${fieldErrors.fonction ? "error" : ""}`}
                    >
                      <option value="">{t.subPlaceholderFonction}</option>
                      <option value="gerant">Gérant / Co-gérant</option>
                      <option value="president">Président / Director</option>
                      <option value="directeur-general">Directeur Général</option>
                      <option value="fondateur">Fondateur / Promoteur</option>
                      <option value="mandataire">Mandataire / Fondé de pouvoir</option>
                    </select>
                    {fieldErrors.fonction && <span className="error-text">{fieldErrors.fonction[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldNationalite}</label>
                    <input
                      type="text"
                      value={form.nationalite}
                      onChange={(e) => set("nationalite", e.target.value)}
                      className={`form-control ${fieldErrors.nationalite ? "error" : ""}`}
                      placeholder={t.subPlaceholderNationalite}
                    />
                    {fieldErrors.nationalite && <span className="error-text">{fieldErrors.nationalite[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldTypePiece}</label>
                    <select
                      value={form.typePiece}
                      onChange={(e) => set("typePiece", e.target.value)}
                      className={`form-control ${fieldErrors.typePiece ? "error" : ""}`}
                    >
                      <option value="">{t.subPlaceholderTypePiece}</option>
                      <option value="CNI">Carte Nationale d'Identité (CNI)</option>
                      <option value="Passeport">Passeport</option>
                      <option value="CarteSejour">Carte de Séjour / Titre de Résidence</option>
                    </select>
                    {fieldErrors.typePiece && <span className="error-text">{fieldErrors.typePiece[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldNumPiece}</label>
                    <input
                      type="text"
                      value={form.numPiece}
                      onChange={(e) => set("numPiece", e.target.value)}
                      className={`form-control ${fieldErrors.numPiece ? "error" : ""}`}
                      placeholder={t.subPlaceholderNumPiece}
                    />
                    {fieldErrors.numPiece && <span className="error-text">{fieldErrors.numPiece[0]}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 5 — Coordonnées & notification */}
            {step === 5 && (
              <div className={`step-panel ${step === 5 ? "active" : "hidden"}`}>
                <h2 className="step-title">{t.subStep4Title}</h2>
                <p className="step-desc">{t.subStep4Text}</p>
                <div className="form-grid">
                  <div className="field">
                    <label>{t.subFieldEmail}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={`form-control ${fieldErrors.email ? "error" : ""}`}
                      placeholder={t.subPlaceholderEmail}
                    />
                    {fieldErrors.email && <span className="error-text">{fieldErrors.email[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldTelephone}</label>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => set("telephone", e.target.value)}
                      className={`form-control ${fieldErrors.telephone ? "error" : ""}`}
                      placeholder={t.subPlaceholderTelephone}
                    />
                    {fieldErrors.telephone && <span className="error-text">{fieldErrors.telephone[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldAdresse}</label>
                    <input
                      type="text"
                      value={form.adresse}
                      onChange={(e) => set("adresse", e.target.value)}
                      className={`form-control ${fieldErrors.adresse ? "error" : ""}`}
                      placeholder={t.subPlaceholderAdresse}
                    />
                    {fieldErrors.adresse && <span className="error-text">{fieldErrors.adresse[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldVille}</label>
                    <input
                      type="text"
                      value={form.ville}
                      onChange={(e) => set("ville", e.target.value)}
                      className={`form-control ${fieldErrors.ville ? "error" : ""}`}
                      placeholder={t.subPlaceholderVille}
                    />
                    {fieldErrors.ville && <span className="error-text">{fieldErrors.ville[0]}</span>}
                  </div>
                  <div className="field">
                    <label>{t.subFieldPays}</label>
                    <select
                      value={form.pays}
                      onChange={(e) => set("pays", e.target.value)}
                      className={`form-control ${fieldErrors.pays ? "error" : ""}`}
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

            {/* ÉTAPE 6 — Validation */}
            {step === 6 && (
              <div className={`step-panel ${step === 6 ? "active" : "hidden"}`}>
                <h2 className="step-title">{t.subStep6Title}</h2>
                <p className="step-desc">{t.subStep6Text}</p>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.chkCgv}
                      onChange={() => set("chkCgv", !form.chkCgv)}
                    />
                    {t.subChkCgv}
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.chkCadre}
                      onChange={() => set("chkCadre", !form.chkCadre)}
                    />
                    {t.subChkCadre}
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.chkExactitude}
                      onChange={() => set("chkExactitude", !form.chkExactitude)}
                    />
                    {t.subChkExactitude}
                  </label>
                </div>
                {(fieldErrors.chkCgv || fieldErrors.chkCadre || fieldErrors.chkExactitude) && (
                  <span className="error-text">
                    {fieldErrors.chkCgv?.[0] || ""}
                    {fieldErrors.chkCadre?.[0] || ""}
                    {fieldErrors.chkExactitude?.[0] || ""}
                  </span>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="step-nav">
              {step > 1 && (
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  {t.subBtnPrecedent}
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  {t.subBtnSuivant}
                </button>
              ) : (
                <button type="submit" className="btn btn-primary btn-block">
                  {t.subBtnValider}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}

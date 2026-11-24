"use client";

/**
 * FEDPAWA — Formulaire Générique Malléable (v4)
 * Corrigé : IDs uniques par étape, attributs name sur tous les champs,
 * logique RCCM/NIU conditionnelle, stepper avec espace, étapes masquées
 * quand inactives.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { apiAuthPost, fetchMe } from "@/lib/auth";
import { isEmailNonVerifieError } from "@/lib/verification";
import { useEmailVerification } from "@/components/verification/EmailVerificationProvider";
import { routesFor } from "@/lib/routes";

// ---------------------------------------------------------------------------
// Types de spécification
// ---------------------------------------------------------------------------

type FieldType = "text" | "number" | "email" | "tel" | "textarea" | "select" | "date" | "checkbox";

type FieldSpec = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  options?: string[];
  errorRequired?: string;
  errorPattern?: string;
  rows?: number;
  default?: string;
  accept?: string;
  dependsOn?: { field: string; value: string };
  requiredIf?: { field: string; value: string };
  hint?: string;
};

type FileDropzoneSpec = {
  id: string;
  title: string;
  hint: string;
  accept: string;
  required?: boolean;
};

type CheckboxSpec = {
  name: string;
  label: string;
  required?: boolean;
  errorRequired?: string;
  hint?: string;
};

type RadioSpec = {
  id: string;
  label: string;
  desc?: string;
  hint?: string;
};

type OptionSpec = {
  id: string;
  label: string;
  desc?: string;
};

type PackSpec = {
  id: string;
  label: string;
  priceFCFA: number;
  badge?: string;
  usd?: number;
  features?: Record<string, string[]>;
};

type GammeSpec = {
  id: string;
  label: string;
  badge?: string;
  title?: string;
  desc?: string;
  packs?: PackSpec[];
};

type PeriodiciteSpec = {
  id: string;
  label: string;
  months: number;
};

type InvoiceDetailSpec = {
  label: string;
  serviceLine: string;
  amountFCFA: number;
  companyName?: string;
  companyNiu?: string;
  companyRccm?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  invoiceLabel?: string;
  invoiceNumLabel?: string;
  invoiceDateLabel?: string;
  billedToLabel?: string;
  serviceLabel?: string;
  periodLabel?: string;
  designationLabel?: string;
  amountLabel?: string;
  totalLabel?: string;
  footer?: string;
  footerEnd?: string;
};

type KycCheckSpec = {
  title: string;
  text: string;
  alreadyText: string;
  alreadyEnd: string;
};

type PayButtonSpec = { label: string };

type FormSpec = {
  serviceId: string;
  serviceName: string;
  endpoint: string;
  priceFixedFCFA?: number;
  priceLabel?: string;
  contract?: boolean;
  hideStepper?: boolean;
  totalSteps: number;
  formTitle: string;
  formSubtitle?: string;
  steps: StepSpec[];
  gammes?: GammeSpec[];
  packs?: PackSpec[];
  packDetails?: Record<string, PackSpec>;
  periodicites?: PeriodiciteSpec[];
  invoice?: InvoiceDetailSpec;
  invoiceDetail?: InvoiceDetailSpec;
  payButton?: PayButtonSpec;
  checkboxes?: CheckboxSpec[];
  localStorageKey: string;
  successMessage: string;
  successLink: string;
  autoFillFromMe?: string[];
  devisMessage?: string;
  kycCheck?: KycCheckSpec;
  statutStructure?: boolean;
  formeAutre?: boolean;
  rccmNiuConditional?: boolean;
  noImmat?: boolean;
  smartDetection?: boolean;
  thirdDropzone?: boolean;
  kycAlready?: boolean;
  urlPackParam?: boolean;
  lockScroll?: boolean;
  successWithClient?: boolean;
};

type StepSpec = {
  id: number;
  title: string;
  description?: string;
  fields?: FieldSpec[];
  files?: FileDropzoneSpec[];
  radios?: RadioSpec[];
  options?: OptionSpec[];
  checkboxes?: CheckboxSpec[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyState(spec: FormSpec): Record<string, any> {
  const state: Record<string, any> = { options: [], files: {} };
  spec.steps.forEach((step) => {
    step.fields?.forEach((f) => {
      state[f.name] = f.default ?? "";
    });
    step.checkboxes?.forEach((cb) => {
      state[cb.name] = false;
    });
    step.radios?.forEach((r) => {
      if (state["_radio_" + step.id] === undefined) state["_radio_" + step.id] = r.id;
    });
  });
  state.chkCgv = false;
  state.chkCadre = false;
  state.chkExactitude = false;
  state.noImmat = false;
  state.gamme = spec.gammes?.[0]?.id ?? "";
  state.pack = "";
  state.periodicite = spec.periodicites?.[0]?.id ?? "mensuel";
  state.statutStructure = spec.statutStructure ? "existante" : "";
  state.formeAutre = "";
  state.rccm = "";
  state.niu = "";
  state.kycDone = false;
  return state;
}

function fmtFCFA(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function meKeyFor(fieldName: string): string {
  const map: Record<string, string> = {
    nomComplet: "fullName",
    civilite: "civilite",
    nationalite: "nationality",
    email: "email",
    telephone: "phone",
    adresse: "address",
    ville: "city",
    rccm: "rccm",
    niu: "niu",
  };
  return map[fieldName] ?? fieldName;
}

function isFieldVisible(field: FieldSpec, form: Record<string, any>): boolean {
  if (!field.dependsOn) return true;
  return form[field.dependsOn.field] === field.dependsOn.value;
}

function isFieldRequired(field: FieldSpec, form: Record<string, any>): boolean {
  if (field.requiredIf) {
    return form[field.requiredIf.field] === field.requiredIf.value;
  }
  return field.required ?? false;
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

interface GeneriqueFormulaireProps {
  locale?: Locale;
  spec: FormSpec;
}

export default function GeneriqueFormulaire({ locale = "fr", spec }: GeneriqueFormulaireProps) {
  const t = getPageDictionary(locale, "generiqueFormulaire");
  const routes = routesFor(locale);
  const verif = useEmailVerification();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Record<string, any>>(emptyState(spec));
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [smartModal, setSmartModal] = useState<"closed" | "open" | "blocked">("closed");
  const [otpStep, setOtpStep] = useState<"idle" | "pending" | "verified" | "error">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [savedDraft, setSavedDraft] = useState<any | null>(null);
  const [draftResolved, setDraftResolved] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [kycDoneServer, setKycDoneServer] = useState<string | null>(null);
  const meRef = useRef<Record<string, string | undefined> | null>(null);
  const [invoice, setInvoice] = useState<{ dateStr: string; num: string } | null>(null);
  const [isCreationStructure, setIsCreationStructure] = useState(spec.statutStructure ? false : true);

  const TOTAL_STEPS = spec.totalSteps;
  const DRAFT_KEY = spec.localStorageKey;
  const stepLabels = spec.steps.map((s) => s.title);

  const set = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ---------- Facture : numéro et date ----------
  useEffect(() => {
    if (!spec.invoiceDetail) return;
    const now = new Date();
    setInvoice({
      dateStr: now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      num: "F-" + now.getFullYear() + "-" + String(now.getTime()).slice(-6),
    });
  }, [spec.invoiceDetail]);

  // ---------- Pré-remplissage depuis /me (incluant RCCM/NIU) ----------
  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        if (me && (me as any).authenticated) {
          meRef.current = me as unknown as Record<string, string | undefined>;
          spec.autoFillFromMe?.forEach((key) => {
            const src = meRef.current![meKeyFor(key)];
            if (!src) return;
            if (!form[key]) set(key, src);
          });
          if (me.kyc_status) setKycDoneServer(me.kyc_status);
        }
      } catch {
        /* dégradation silencieuse */
      }
    })();
  }, []);

  // ---------- Paramètre URL ?pack= ----------
  useEffect(() => {
    if (!spec.urlPackParam) return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlPack = searchParams.get("pack");
      if (urlPack && spec.packDetails && spec.packDetails[urlPack]) {
        const gamme = urlPack.startsWith("national-") ? "nationale" : "internationale";
        set("gamme", gamme);
        set("pack", urlPack);
      }
    } catch {
      /* ignoré */
    }
  }, [spec.urlPackParam]);

  // ---------- Chargement brouillon ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      const hasContent =
        d.step > 1 ||
        (Array.isArray(d.options) && d.options.length > 0) ||
        Object.values(d).some((v: any) => typeof v === "string" && v.trim() !== "");
      if (hasContent) setSavedDraft(d);
      else localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignoré */
    }
  }, []);

  useEffect(() => {
    if (!draftResolved) return;
    try {
      const draft: any = { ...form, step, savedAt: new Date().toISOString() };
      delete draft.files;
      delete draft.options;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* quota / navigation privée */
    }
  }, [form, step, draftResolved, DRAFT_KEY]);

  // ---------- Verrou du scroll pendant modale de reprise ----------
  useEffect(() => {
    if (!spec.lockScroll) return;
    document.body.style.overflow = !!savedDraft && !draftResolved ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [savedDraft, draftResolved, spec.lockScroll]);

  const resumeDraft = () => {
    const d = savedDraft;
    if (d) {
      setForm((prev: any) => ({ ...prev, ...d }));
      if (d.step >= 1 && d.step <= TOTAL_STEPS) setStep(d.step);
    }
    setSavedDraft(null);
    setDraftResolved(true);
  };

  const restartDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignoré */ }
    setSavedDraft(null);
    setDraftResolved(true);
    setForm({ ...emptyState(spec), options: [], files: {} });
    setStep(1);
    if (meRef.current) {
      spec.autoFillFromMe?.forEach((key) => {
        const src = meRef.current![meKeyFor(key)];
        if (!src) return;
        if (!form[key]) set(key, src);
      });
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ---------- Prix avec pack détaillé ----------
  const months = useMemo(() => {
    const p = form.periodicite;
    if (p === "mensuel") return 1;
    if (p === "semestriel") return 6;
    if (p === "annuel") return 12;
    return 1;
  }, [form.periodicite]);

  const currentPack = useMemo(() => {
    if (!spec.packDetails || !form.pack) return null;
    return spec.packDetails[form.pack] ?? null;
  }, [spec.packDetails, form.pack]);

  const basePrice = useMemo(() => {
    if (currentPack) return currentPack.priceFCFA;
    return spec.priceFixedFCFA ?? 0;
  }, [currentPack, spec]);

  const totalPrice = useMemo(() => basePrice * months, [basePrice, months]);

  // ---------- Validation ----------
  function validateStep(n: number): string[] {
    const errs: string[] = [];
    const fieldErrs: Record<string, string[]> = {};
    const f = form;
    const stepDef = spec.steps.find((s) => s.id === n);
    if (!stepDef) return [];

    stepDef.fields?.forEach((field) => {
      if (!isFieldVisible(field, f)) return;
      const v = f[field.name];
      if (isRCCNiuConditional(field, f) && f.statutStructure !== "creation") {
        // RCCM/NIU requis seulement si pas en création
        if ((field.name === "rccm" || field.name === "niu") && !v) {
          errs.push(field.errorRequired || "Champ requis");
          if (!fieldErrs[field.name]) fieldErrs[field.name] = [];
          fieldErrs[field.name].push(field.errorRequired || "Champ requis");
        }
      } else {
        if (isFieldRequired(field, f) && (v == null || String(v).trim() === "")) {
          errs.push(field.errorRequired || "Champ requis");
          if (!fieldErrs[field.name]) fieldErrs[field.name] = [];
          fieldErrs[field.name].push(field.errorRequired || "Champ requis");
        }
      }
      if (field.pattern && v && !new RegExp(field.pattern).test(String(v))) {
        errs.push(field.errorPattern || "Format invalide");
        if (!fieldErrs[field.name]) fieldErrs[field.name] = [];
        fieldErrs[field.name].push(field.errorPattern || "Format invalide");
      }
    });

    stepDef.files?.forEach((file) => {
      if (file.required && !f.files?.[file.id]) {
        errs.push(`Le fichier ${file.title} est requis`);
      }
    });

    // Radios requises (ex: sélection du type de contrat)
    if (stepDef.radiosRequired && stepDef.radios) {
      const radioKey = "_radio_" + stepDef.id;
      if (!f[radioKey]) {
        errs.push("Veuillez sélectionner une option");
      }
    }

    // Gamme requise
    if (spec.gammes && spec.gammes.length > 0 && !f.gamme) {
      errs.push("La gamme est requise");
    }
    // Pack requis
    if (spec.packs && spec.packs.length > 0 && !f.pack) {
      errs.push("Le pack est requis");
    }

    setFieldErrors(fieldErrs);
    return [...new Set(errs)];
  }

  function isRCCNiuConditional(field: FieldSpec, form: Record<string, any>): boolean {
    return (field.name === "rccm" || field.name === "niu") && spec.rccmNiuConditional;
  }

  function validateFinal(): string[] {
    const allErrs: string[] = [];
    spec.steps.forEach((s) => {
      allErrs.push(...validateStep(s.id));
    });
    if (spec.checkboxes) {
      spec.checkboxes.forEach((cb) => {
        if (cb.required && !form[cb.name]) {
          allErrs.push(cb.errorRequired || "Champ requis");
        }
      });
    } else if (!spec.invoiceDetail) {
      ["chkCgv", "chkCadre", "chkExactitude"].forEach((k) => {
        if (!form[k]) allErrs.push(`Veuillez cocher ${k}`);
      });
    }
    return [...new Set(allErrs)];
  }

  function domNext() {
    const errs = validateStep(step);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function domPrev() {
    if (step > 1) setStep(step - 1);
  }

  function goToStep(n: number) {
    if (n >= 1 && n <= TOTAL_STEPS) setStep(n);
  }

  // ---------- Smart-détection noImmat ----------
  const handleNoImmat = (checked: boolean) => {
    set("noImmat", checked);
    if (checked) setSmartModal("open");
    else setSmartModal("closed");
  };

  // ---------- Sélecteur gamme (cartes cliquables) ----------
  const handleGammeChange = (id: string) => {
    set("gamme", id);
    set("pack", "");
    const gamme = spec.gammes?.find((g) => g.id === id);
    if (gamme?.packs?.[0]) {
      set("pack", gamme.packs[0].id);
    }
  };

  // ---------- Dropzone avec drag & drop ----------
  function DropzoneGen({ field }: { field: FileDropzoneSpec }) {
    const fieldId = "step-dz-" + field.id;
    const file = form.files?.[field.id];
    return (
      <div
        className={
          "dropzone" +
          (field.required ? " required" : "") +
          (file ? " has-file" : "") +
          (dragOver === field.id ? " drag-over" : "")
        }
        id={"step-dz-" + field.id}
        onClick={() => document.getElementById(fieldId + "-input")?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(field.id); }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(null);
          if (e.dataTransfer.files.length)
            set("files", { ...form.files, [field.id]: e.dataTransfer.files[0] });
        }}
        style={{ cursor: "pointer" }}
      >
        <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h5>{field.title} {field.required && <em className="req">*</em>}</h5>
        <p>{field.hint}</p>
        <span className="dz-filename">
          {file ? `📄 ${file.name} (${Math.round(file.size / 1024)} Ko)` : ""}
        </span>
        <input
          id={fieldId + "-input"}
          type="file"
          name={field.id}
          hidden
          accept={field.accept}
          onChange={(e) => {
            if (e.target.files?.length)
              set("files", { ...form.files, [field.id]: e.target.files[0] });
          }}
        />
      </div>
    );
  }

  // ---------- Upload fichiers ----------
  const uploadAllFiles = async (): Promise<Record<string, string>> => {
    const uploaded: Record<string, string> = {};
    const files = form.files || {};
    for (const [fieldId, file] of Object.entries(files)) {
      if (!(file instanceof File)) {
        uploaded[fieldId] = file as string;
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await apiAuthPost<any>("/api/v1/souscription/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.ok && res.path) {
          uploaded[fieldId] = res.path;
        } else {
          throw new Error(res.message || "Échec upload fichier");
        }
      } catch (err: any) {
        setErrors([err?.message || `Échec upload ${fieldId}`]);
        throw err;
      }
    }
    return uploaded;
  };

  // ---------- OTP ----------
  const verifyOTP = async (code: string): Promise<boolean> => {
    try {
      const res = await apiAuthPost<any>("/api/v1/signature/verify", { code });
      if (res.ok) {
        setOtpStep("verified");
        return true;
      }
      setOtpStep("error");
      return false;
    } catch {
      setOtpStep("error");
      return false;
    }
  };

  const requestOTP = async (phone: string): Promise<boolean> => {
    try {
      const res = await apiAuthPost<any>("/api/v1/signature/otp-request", { phone });
      return res.ok;
    } catch {
      return false;
    }
  };

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateFinal();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);

    if (form.noImmat) {
      setSmartModal("open");
      return;
    }

    try {
      const uploadedFiles = await uploadAllFiles();

      const payload: any = { ...form };
      if (currentPack) payload.planLabel = currentPack.label;
      delete payload.files;
      delete payload.options;
      Object.assign(payload, uploadedFiles);

      if (verif.unverified) {
        verif.requestGate();
        return;
      }
      const res = await apiAuthPost<any>(spec.endpoint, payload);
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY);

        if (spec.contract) {
          setOtpStep("pending");
          const otpRequested = await requestOTP(form.telephone || "");
          if (!otpRequested) {
            setErrors(["Impossible d'envoyer le code OTP. Réessayez."]);
            return;
          }
          return;
        }

        setShowSuccess(true);
        setStep(TOTAL_STEPS);
      } else {
        setErrors([res.message || "Erreur lors de la soumission"]);
      }
    } catch (err: any) {
      if (isEmailNonVerifieError(err)) {
        verif.requestGate();
        return;
      }
      setErrors(["Erreur réseau lors de la soumission"]);
    }
  };

  const handlePaySubmit = async (pay: { phone: string; operator: string; price: number }) => {
    setPayError(null);
    try {
      if (verif.unverified) {
        verif.requestGate();
        return { ok: false, message: "Email non vérifié" };
      }
      const res = await apiAuthPost<any>(spec.endpoint, {
        ...form,
        planLabel: currentPack?.label ?? "",
        telephone: pay.phone,
        prix: pay.price,
        paymentMethod: "momo",
        momo_phone: pay.phone,
        momo_operator: pay.operator,
      });
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY);
        return { ok: true, message: res.message || "Paiement effectué." };
      }
      return { ok: false, message: res.message || "Échec du paiement." };
    } catch (err: any) {
      if (isEmailNonVerifieError(err)) {
        verif.requestGate();
        return { ok: false, message: "Email non vérifié." };
      }
      return { ok: false, message: "Erreur réseau lors du paiement." };
    }
  };

  const gateModalOpen =
    verif.status === "unverified" ||
    (verif.gateOpen && verif.status !== "anonymous" && verif.status !== "verified");
  const resumePending = !!savedDraft && !draftResolved;
  const showResumeModal =
    resumePending && !gateModalOpen && smartModal === "closed";

  // ============================================================================
  // RENDU
  // ============================================================================

  if (otpStep !== "idle") {
    return (
      <div className="container py-24 text-center">
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>
            {otpStep === "verified" ? "Contrat signé" : "Vérification du contrat"}
          </h2>
          {otpStep === "pending" && (
            <>
              <p style={{ marginBottom: 20 }}>
                Un code de confirmation a été envoyé par SMS sur votre téléphone.
                Saisissez le code pour signer électroniquement votre contrat.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                <input
                  type="text"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="form-control"
                  placeholder="Code OTP"
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => verifyOTP(otpCode)}
                  disabled={otpCode.length !== 6}
                >
                  Vérifier
                </button>
              </div>
              {otpStep === "error" && (
                <p style={{ color: "red", fontSize: "0.85rem", marginTop: 8 }}>
                  Code invalide. Réessayez.
                </p>
              )}
            </>
          )}
          {otpStep === "verified" && (
            <>
              <p style={{ marginBottom: 20 }}>
                Votre contrat a été signé électroniquement avec succès.
              </p>
              <Link href={routes.espaceClient} className="btn btn-primary btn-block">
                Aller à mon Espace Client
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* STEPPER — affiché sur tous les formulaires */}
      <div className="progress-wrapper" id="genStepper">
        <div className="container">
          <div className="gen-step-mobile" id="genStepMobile">
            <div className="gen-step-mobile-bar">
              <div
                className="gen-step-mobile-fill"
                id="genStepFill"
                style={{ width: `${((step - 1) / Math.max(TOTAL_STEPS - 1, 1)) * 100}%` }}
              />
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-line">
              <div
                className="progress-line-fill"
                id="progressFill"
                style={{ width: `${((step - 1) / Math.max(TOTAL_STEPS - 1, 1)) * 100}%` }}
              />
            </div>
            {stepLabels.map((label, i) => {
              const n = i + 1;
              return (
                <div
                  key={n}
                  className={
                    "progress-step" +
                    (n === step ? " active" : n < step ? " completed" : "")
                  }
                  data-step={n}
                  onClick={() => n < step && goToStep(n)}
                  style={{ cursor: n < step ? "pointer" : "default" }}
                >
                  <div className="progress-dot">{n}</div>
                  <span className="progress-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 16px 64px" }}>
        <div className="tunnel-layout-v2">
          <div className="tunnel-card" style={{ padding: 40, boxShadow: "none", border: "1px solid var(--color-border)", maxWidth: 700, margin: "0 auto" }} id="generiqueForm">
            {showSuccess ? (
              <div id="form-success" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ width: 80, height: 80, margin: "0 auto 24px", borderRadius: "50%", background: "var(--color-primary)", display: "grid", placeItems: "center" }}>
                  <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="#fff" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>
                  {t.successTitle || "Demande enregistrée"}
                </h2>
                {spec.successWithClient && form.nomComplet ? (
                  <p style={{ color: "var(--color-text-muted)", maxWidth: 480, margin: "0 auto 8px" }}>
                    Votre dossier a bien été transmis, {form.nomComplet}. Nos équipes vous recontacteront sous 24h.
                  </p>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", maxWidth: 480, margin: "0 auto 8px" }}>
                    {spec.successMessage}
                  </p>
                )}
                <Link href={routes.espaceClient} className="btn btn-primary btn-block">
                  {spec.successLink}
                </Link>
              </div>
            ) : (
              <>
                <div className="step-header" style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: "1.6rem", color: "var(--color-surface, #fff)" }}>
                    {spec.formTitle}
                  </h1>
                  <p style={{ fontSize: "1rem", color: "var(--color-gold, #D4AF37)", fontWeight: 600 }}>
                    {spec.formSubtitle}
                  </p>
                </div>

                <form id="generiqueForm" onSubmit={handleSubmit} noValidate>
                  <style>{`
                    .tunnel-step-content:not(.active) { display: none !important; }
                    .tunnel-step-content.active { display: block !important; }
                  `}</style>
                  {spec.steps.map((stepDef) => (
                    <div
                      key={stepDef.id}
                      className={"tunnel-step-content" + (step === stepDef.id ? " active" : "")}
                      data-step={stepDef.id}
                      style={{ display: step === stepDef.id ? "block" : "none" }}
                    >
                      <section className="form-section">
                        <h2 className="form-section-title">
                          <span className="form-section-num">{stepDef.id}</span> {stepDef.title}
                        </h2>
                        {stepDef.description && <p className="section-intro">{stepDef.description}</p>}

                        {/* #1 Radios statut_structure (domiciliation uniquement) */}
                        {spec.statutStructure && (
                          <div className="form-group">
                            <label>Statut de la structure <em className="req">*</em></label>
                            <div className="radio-row">
                              <label className="radio-pill">
                                <input
                                  type="radio"
                                  name="statut_structure"
                                  id={"step-" + stepDef.id + "-statut-existante"}
                                  value="existante"
                                  checked={form.statutStructure === "existante"}
                                  onChange={() => {
                                    set("statutStructure", "existante");
                                    setIsCreationStructure(false);
                                  }}
                                />{" "}
                                Entreprise existante
                              </label>
                              <label className="radio-pill">
                                <input
                                  type="radio"
                                  name="statut_structure"
                                  id={"step-" + stepDef.id + "-statut-creation"}
                                  value="creation"
                                  checked={form.statutStructure === "creation"}
                                  onChange={() => {
                                    set("statutStructure", "creation");
                                    setIsCreationStructure(true);
                                  }}
                                />{" "}
                                Création d'entreprise
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Champs texte / select / textarea / date / checkbox */}
                        {stepDef.fields?.filter((f) => f.name !== "gamme" && f.name !== "pack" && isFieldVisible(f, form)).map((field) => {
                          const fieldId = "step-" + stepDef.id + "-" + field.name;
                          const isRCCNNIU = field.name === "rccm" || field.name === "niu";
                          const isRCCNNIURequired = isRCCNNIU && spec.rccmNiuConditional && isCreationStructure;
                          const fieldRequired = isRCCNNIU ? isRCCNNIURequired : isFieldRequired(field, form);
                          return (
                            <div key={field.name} className="form-group">
                              <label htmlFor={fieldId}>
                                {field.label} {fieldRequired && <em className="req">*</em>}
                                {field.hint && <span className="field-hint" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginLeft: 6 }}>{field.hint}</span>}
                              </label>
                              {field.type === "select" ? (
                                <select
                                  id={fieldId}
                                  name={field.name}
                                  className={`form-control ${fieldErrors[field.name] ? "error" : ""}`}
                                  required={fieldRequired}
                                  value={form[field.name] || ""}
                                  onChange={(e) => set(field.name, e.target.value)}
                                >
                                  <option value="">{field.placeholder || "Sélectionner"}</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  id={fieldId}
                                  name={field.name}
                                  className={`form-control ${fieldErrors[field.name] ? "error" : ""}`}
                                  required={fieldRequired}
                                  placeholder={field.placeholder}
                                  value={form[field.name] || ""}
                                  onChange={(e) => set(field.name, e.target.value)}
                                  rows={field.rows || 3}
                                />
                              ) : field.type === "date" ? (
                                <input
                                  type="date"
                                  id={fieldId}
                                  name={field.name}
                                  className={`form-control ${fieldErrors[field.name] ? "error" : ""}`}
                                  required={fieldRequired}
                                  placeholder={field.placeholder}
                                  value={form[field.name] || ""}
                                  onChange={(e) => set(field.name, e.target.value)}
                                />
                              ) : field.type === "checkbox" ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                                  <input
                                    type="checkbox"
                                    id={fieldId}
                                    name={field.name}
                                    checked={form[field.name] === true}
                                    onChange={(e) => set(field.name, e.target.checked)}
                                  />
                                  <label htmlFor={fieldId}>{field.label}</label>
                                </div>
                              ) : (
                                <input
                                  type={field.type}
                                  id={fieldId}
                                  name={field.name}
                                  className={`form-control ${fieldErrors[field.name] ? "error" : ""}`}
                                  required={fieldRequired}
                                  placeholder={field.placeholder}
                                  value={form[field.name] || ""}
                                  onChange={(e) => set(field.name, e.target.value)}
                                />
                              )}
                              {fieldErrors[field.name] && (
                                <span className="error-text">{fieldErrors[field.name][0]}</span>
                              )}
                            </div>
                          );
                        })}

                        {/* #3 Dropzones de fichiers (KYC, logo, etc.) */}
                        {stepDef.files?.map((file) => (
                          <DropzoneGen key={file.id} field={file} />
                        ))}

                        {/* #2 Champ formeAutre conditionnel (domiciliation) */}
                        {spec.formeAutre && form.formeJuridique === "Autre" && (
                          <div className="form-group" id={"step-" + stepDef.id + "-forme-autre-group"}>
                            <label htmlFor={"step-" + stepDef.id + "-forme_autre"}>Précisez la forme juridique</label>
                            <input
                              type="text"
                              id={"step-" + stepDef.id + "-forme_autre"}
                              name="formeAutre"
                              className="form-control"
                              placeholder="Autre forme juridique"
                              value={form.formeAutre || ""}
                              onChange={(e) => set("formeAutre", e.target.value)}
                            />
                          </div>
                        )}

                        {/* Radios (#21 radio-pill style) */}
                        {stepDef.radios?.map((radio) => (
                          <div key={radio.id} className="form-group">
                            <label className="radio-pill">
                              <input
                                type="radio"
                                name={"_radio_" + stepDef.id}
                                id={"step-" + stepDef.id + "-radio-" + radio.id}
                                value={radio.id}
                                checked={form["_radio_" + stepDef.id] === radio.id}
                                onChange={() => set("_radio_" + stepDef.id, radio.id)}
                              />
                              {radio.label}
                              {radio.desc && <span className="radio-desc" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginLeft: 6 }}>{radio.desc}</span>}
                            </label>
                          </div>
                        ))}

                        {/* #7 Sélecteur gamme (cartes cliquables) — uniquement sur l'étape qui a des champs gamme/pack */}
                        {spec.gammes && spec.gammes.length > 0 && stepDef.fields?.some((f) => f.name === "gamme" || f.name === "pack") && (
                          <>
                            <div className="form-group">
                              <label>Gamme <em className="req">*</em></label>
                              <div className="gamme-grid">
                                {spec.gammes.map((g) => (
                                  <div
                                    key={g.id}
                                    className={
                                      "selectable-card gamme-card" +
                                      (form.gamme === g.id ? " selected" : "")
                                    }
                                    id={"step-" + stepDef.id + "-gamme-" + g.id}
                                    onClick={() => handleGammeChange(g.id)}
                                  >
                                    {g.badge && <span className="card-badge">{g.badge}</span>}
                                    <h4>{g.title || g.label}</h4>
                                    {g.desc && <p className="card-desc">{g.desc}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="form-group" id={"step-" + stepDef.id + "-pack-select-group"}>
                              <label htmlFor={"step-" + stepDef.id + "-pack"}>Pack <em className="req">*</em></label>
                              <select
                                id={"step-" + stepDef.id + "-pack"}
                                name="pack"
                                className="form-control"
                                required
                                value={form.pack || ""}
                                onChange={(e) => set("pack", e.target.value)}
                              >
                                <option value="" disabled>Sélectionner le pack</option>
                                {(spec.packs || [])
                                  .filter((p) => {
                                    const gamme = spec.gammes?.find((g) => g.id === form.gamme);
                                    return gamme?.packs?.some((gp) => gp.id === p.id);
                                  })
                                  .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.label} ({fmtFCFA(p.priceFCFA)} / mois)
                                    </option>
                                  ))}
                              </select>
                              <small className="field-hint">Sélectionnez le pack adapté à votre gamme.</small>
                            </div>

                            {/* Détail du pack */}
                            {currentPack && (
                              <div className="pack-detail" id={"step-" + stepDef.id + "-pack-detail"} style={{ display: "block" }}>
                                <div className="pack-detail-head">
                                  <div>
                                    {currentPack.badge && <span className="pack-detail-badge">{currentPack.badge}</span>}
                                    <h4 id={"step-" + stepDef.id + "-pack-name"}>{currentPack.label}</h4>
                                    {currentPack.usd && (
                                      <p className="pack-detail-usd" id={"step-" + stepDef.id + "-pack-usd"}>
                                        {currentPack.usd} $ / mois
                                      </p>
                                    )}
                                  </div>
                                  <div className="pack-detail-price" id={"step-" + stepDef.id + "-pack-price"}>
                                    {fmtFCFA(currentPack.priceFCFA)} / mois
                                  </div>
                                </div>
                                <ul className="pack-detail-features" id={"step-" + stepDef.id + "-pack-features"}>
                                  {(currentPack.features?.[locale] || []).map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}

                        {/* #10 Options multiples avec descriptions */}
                        {stepDef.options && stepDef.options.length > 0 && (
                          <div className="options-grid">
                            <label className="option-label">Options complémentaires :</label>
                            <div className="options-list">
                              {stepDef.options.map((opt) => (
                                <label key={opt.id} className="option-item">
                                  <input
                                    type="checkbox"
                                    value={opt.id}
                                    name={"opt-" + stepDef.id + "-" + opt.id}
                                    checked={form.options?.includes(opt.id)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      set(
                                        "options",
                                        checked
                                          ? [...form.options, opt.id]
                                          : form.options.filter((o: string) => o !== opt.id)
                                      );
                                    }}
                                  />
                                  {opt.label}
                                  {opt.desc && <span className="option-desc"> — {opt.desc}</span>}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </section>

                      {/* Erreurs de validation de l'étape (affichées sur toutes les étapes) */}
                      {errors.length > 0 && (
                        <div id={"step-errors-" + stepDef.id} className="form-errors" style={{ display: "block", marginTop: 16, marginBottom: 16, padding: 12, background: "#fdecea", border: "1px solid #e74c3c", borderRadius: 8, color: "#c0392b" }}>
                          <strong style={{ display: "block", marginBottom: 6 }}>⚠ Veuillez corriger les erreurs suivantes avant de continuer :</strong>
                          <ul style={{ marginTop: 0, paddingLeft: 20, marginBottom: 0 }}>
                            {errors.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* #5 Checkbox noImmat (domiciliation) */}
                      {spec.noImmat && stepDef.id === 1 && (
                        <div
                          className="form-group"
                          id={"step-" + stepDef.id + "-noimmat"}
                          style={{
                            background: "var(--color-bg-alt)",
                            padding: "12px 14px",
                            borderRadius: 8,
                            border: "1px dashed var(--color-border)",
                            marginTop: 16,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              fontSize: "0.9rem",
                              textTransform: "none",
                              letterSpacing: 0,
                              fontWeight: 500,
                              cursor: "pointer",
                              marginBottom: 4,
                            }}
                          >
                            <input
                              type="checkbox"
                              id={"step-" + stepDef.id + "-noimmat-checkbox"}
                              name="noImmat"
                              className="fp-check"
                              style={{ marginTop: 3 }}
                              checked={form.noImmat}
                              onChange={(e) => handleNoImmat(e.target.checked)}
                            />
                            <span>Je n'ai pas encore de RCCM / NIU</span>
                          </label>
                        </div>
                      )}

                      <div className="btn-group">
                        {stepDef.id > 1 && (
                          <button type="button" className="btn btn-outline" onClick={() => domPrev()}>
                            {t.btnBack || "← Précédent"}
                          </button>
                        )}
                        {stepDef.id < TOTAL_STEPS ? (
                          <button type="button" className="btn btn-primary" onClick={domNext} disabled={stepDef.id !== step}>
                            {t.btnContinue || "Suivant →"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {step === TOTAL_STEPS && !spec.steps.some((s) => s.id === TOTAL_STEPS) && (
                    <div className="tunnel-step-content active" data-step={TOTAL_STEPS}>
                      <section className="form-section">
                        <h2 className="form-section-title">
                          <span className="form-section-num">{TOTAL_STEPS}</span>
                          {spec.steps.find((s) => s.id === TOTAL_STEPS)?.title || "Validation & Paiement"}
                        </h2>

                        <div className="checkbox-group">
                          {(spec.checkboxes || [
                            { name: "chkCgv", label: "J'accepte les Conditions Générales de Vente", required: true },
                            { name: "chkCadre", label: "J'accepte le cadre contractuel", required: true },
                            { name: "chkExactitude", label: "Je certifie l'exactitude des informations", required: true },
                          ]).map((cb) => (
                            <label key={cb.name} className="checkbox-line validation-line">
                              <input
                                type="checkbox"
                                id={"step-" + TOTAL_STEPS + "-" + cb.name}
                                name={cb.name}
                                required={cb.required}
                                checked={form[cb.name]}
                                onChange={(e) => set(cb.name, e.target.checked)}
                              />
                              {cb.label}
                            </label>
                          ))}
                          {errors.length > 0 && (
                            <div id="form-errors" className="form-errors" style={{ display: "block", marginTop: 12 }}>
                              <strong>Erreurs :</strong>
                              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                                {errors.map((m, i) => (
                                  <li key={i}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* #13 Facture proforma détaillée */}
                        {spec.invoiceDetail && (
                          <div
                            id="invoiceBox"
                            className="invoice-box"
                            style={{
                              background: "var(--color-bg-main)",
                              border: "1px solid var(--color-border)",
                              borderRadius: 12,
                              padding: 28,
                              marginBottom: 24,
                              color: "var(--color-heading, #15294D)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 16,
                                borderBottom: "2px solid var(--color-primary)",
                                paddingBottom: 16,
                                marginBottom: 20,
                              }}
                            >
                              <div>
                                <strong style={{ fontSize: "1.15rem", color: "var(--color-heading)" }}>
                                  {spec.invoiceDetail.companyName || "FEDPAWA CORPORATE SOLUTIONS SARL"}
                                </strong>
                                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                                  {spec.invoiceDetail.companyNiu && <>{`NIU : ${spec.invoiceDetail.companyNiu}<br />`}</>}
                                  {spec.invoiceDetail.companyRccm && <>{`RCCM : ${spec.invoiceDetail.companyRccm}<br />`}</>}
                                  {spec.invoiceDetail.companyAddress && <>{`Siège Social : ${spec.invoiceDetail.companyAddress}<br />`}</>}
                                  {spec.invoiceDetail.companyPhone && spec.invoiceDetail.companyEmail && <>{
                                    `${spec.invoiceDetail.companyPhone} · ${spec.invoiceDetail.companyEmail}`
                                  }</>}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                                  {spec.invoiceDetail.invoiceLabel || "Facture proforma"}
                                </div>
                                {invoice && (
                                  <>
                                    <div style={{ fontSize: "0.85rem" }}>
                                      {spec.invoiceDetail.invoiceNumLabel || "N°"} {invoice.num}
                                    </div>
                                    <div style={{ fontSize: "0.85rem" }}>
                                      {spec.invoiceDetail.invoiceDateLabel || "Date"} {invoice.dateStr}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 12,
                                marginBottom: 20,
                                fontSize: "0.9rem",
                              }}
                            >
                              <div>
                                <strong>{spec.invoiceDetail.billedToLabel || "Facturé à"}</strong>
                                <br />
                                {form.nomComplet || "Client"}
                                <br />
                                {form.email}
                                <br />
                                {form.telephone}
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <strong>{spec.invoiceDetail.serviceLabel || "Prestation"}</strong>
                                <br />
                                {spec.invoiceDetail.serviceLine}
                                <br />
                                {spec.invoiceDetail.periodLabel && form.periodicite && (
                                  <>
                                    <br />
                                    {spec.invoiceDetail.periodLabel} {form.periodicite}
                                  </>
                                )}
                              </div>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginBottom: 8 }}>
                              <thead>
                                <tr style={{ background: "var(--color-bg-alt)" }}>
                                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--color-border)" }}>
                                    {spec.invoiceDetail.designationLabel || "Désignation"}
                                  </th>
                                  <th style={{ textAlign: "right", padding: 10, borderBottom: "1px solid var(--color-border)" }}>
                                    {spec.invoiceDetail.amountLabel || "Montant"}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td style={{ padding: 10, borderBottom: "1px solid var(--color-border)" }}>
                                    {currentPack ? currentPack.label + " — " + spec.invoiceDetail.serviceLine : spec.invoiceDetail.serviceLine} ({form.periodicite || "mensuel"})
                                  </td>
                                  <td style={{ textAlign: "right", padding: 10, borderBottom: "1px solid var(--color-border)" }}>
                                    {fmtFCFA(totalPrice)}
                                  </td>
                                </tr>
                                <tr style={{ background: "var(--color-bg-alt)", fontWeight: 700 }}>
                                  <td style={{ padding: "12px 10px" }}>{spec.invoiceDetail.totalLabel || "Total"}</td>
                                  <td style={{ textAlign: "right", padding: "12px 10px" }}>
                                    {fmtFCFA(totalPrice)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: 10 }}>
                              {spec.invoiceDetail.footer || ""} {totalPrice.toLocaleString("fr-FR")} {spec.invoiceDetail.footerEnd || ""}
                            </p>
                          </div>
                        )}

                        {/* Facture simplifiée (fallback) */}
                        {!spec.invoiceDetail && spec.invoice && (
                          <div className="invoice-summary" style={{ marginTop: 24, padding: 16, background: "#fdfcf9", borderRadius: 8, border: "1px solid rgba(212,175,55,0.2)" }}>
                            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              {spec.invoice.label}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                              <span>Date :</span>
                              <span>{new Date().toLocaleDateString("fr-FR")}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                              <span>Prestation :</span>
                              <span>{spec.invoice.serviceLine}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 8 }}>
                              <span>Montant :</span>
                              <span>{fmtFCFA(totalPrice)}</span>
                            </div>
                          </div>
                        )}

                        {spec.devisMessage && (
                          <div style={{ marginTop: 16, padding: 12, background: "#fdfcf9", borderRadius: 8, border: "1px solid rgba(212,175,55,0.2)", fontSize: "0.85rem" }}>
                            {spec.devisMessage}
                          </div>
                        )}

                        {/* Bouton de paiement avec montant */}
                        <button
                          type="button"
                          className="btn btn-primary btn-block"
                          style={{ marginTop: 16 }}
                          onClick={() => domNext()}
                        >
                          {spec.payButton?.label?.replace("{amount}", totalPrice.toLocaleString("fr-FR")) ||
                           (spec.invoiceDetail || spec.invoice ? `Payer ${totalPrice.toLocaleString("fr-FR")} FCFA (Mobile Money)` : "Valider")}
                        </button>
                      </section>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {/* #14 Sidebar récapitulatif détaillé */}
          {!showSuccess && (spec.invoiceDetail || spec.gammes || spec.invoice) && (
            <aside className="order-summary">
              <div className="summary-header">
                <h3>Récapitulatif</h3>
              </div>
              <div style={{ padding: "12px 0" }}>
                {currentPack && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                    <span>{currentPack.label}</span>
                    <span>{fmtFCFA(currentPack.priceFCFA)}</span>
                  </div>
                )}
                {!currentPack && spec.invoice && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                    <span>{spec.invoice.serviceLine}</span>
                    <span>{fmtFCFA(totalPrice)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span>Périodicité</span>
                  <span>{form.periodicite || "mensuel"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: 700 }}>
                  <span>Total</span>
                  <span>{fmtFCFA(totalPrice)}</span>
                </div>
                {form.options && form.options.length > 0 && (
                  <div style={{ padding: "6px 0" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{form.options.length} option(s) sélectionnée(s)</span>
                  </div>
                )}
              </div>
              <div className="summary-divider" />
              <div style={{ padding: "6px 0", fontWeight: 700 }}>
                <span>Total à payer</span>
                <span style={{ float: "right" }}>{fmtFCFA(totalPrice)}</span>
              </div>
              <div className="summary-secure-badge" style={{ marginTop: 10 }}>
                <svg
                  viewBox="0 0 24 24"
                  width={16}
                  height={16}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>{" "}
                <span style={{ fontSize: "0.85rem" }}>Paiement sécurisé</span>
              </div>
            </aside>
          )}
        </div>
      </div>

      {showResumeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,12,24,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div role="dialog" aria-modal="true" aria-label="Reprise de brouillon" style={{ background: "var(--color-bg-main)", borderRadius: 14, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--color-border)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Reprise de votre progression</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 18 }}>
              Vous avez une progression enregistrée. Voulez-vous la reprendre ou recommencer ?
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={resumeDraft}>
                Reprendre
              </button>
              <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={restartDraft}>
                Recommencer
              </button>
            </div>
          </div>
        </div>
      )}

      {smartModal !== "closed" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,12,24,0.55)", backdropFilter: "blur(2px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div role="dialog" aria-modal="true" style={{ background: "var(--color-bg-main)", borderRadius: 14, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--color-border)" }}>
            <h3 style={{ marginBottom: 10 }}>{t.smartTitle}</h3>
            <p style={{ fontSize: "0.92rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 22 }}>
              {smartModal === "open" ? t.smartText : t.smartNoText}
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => (window.location.href = routes.creationEntreprise)}>
                {t.smartYes}
              </button>
              {smartModal === "open" ? (
                <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={() => setSmartModal("blocked")}>
                  {t.smartNo}
                </button>
              ) : (
                <button type="button" className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={() => (window.location.href = routes.creationEntreprise)}>
                  {t.smartUnderstood}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === "email" && (
        <div className="tunnel-step-content active" data-step="email">
          <section className="form-section">
            <h2 className="form-section-title">
              <span className="form-section-num">3</span> En attente de signature
            </h2>
            <p className="section-intro">
              Votre dossier est en attente de signature. Un lien vous sera envoyÃ© par e-mail
              pour procÃ©der Ã  la signature Ã©lectronique du contrat.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => domPrev()}
                className="btn btn-outline"
              >
                ← Retour
              </button>
            </div>
          </section>
        </div>
      )}

    </>
  );
}
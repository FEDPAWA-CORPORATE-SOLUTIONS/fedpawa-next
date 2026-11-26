"use client";

// ============================================================================
// FEDPAWA — Nouveau flux de souscription : Signature → Paiement
// Conforme au CAHIER DES CHARGES TECHNIQUE (parcours de souscription,
// signature électronique et paiement en ligne).
//
// Ordre logique : SIGNATURE AVANT PAIEMENT.
// Aucun compte à rebours de 30 min sur les liens. IP tracée mais non bloquante.
//
// Le formulaire de saisie a été retiré de ce composant : il est désormais
// géré exclusivement par GeneriqueFormulaire (page /souscription/domiciliation).
// Ce composant ne gère plus que : signature électronique (OpenSign + OTP)
// et paiement (Campay Mobile Money).
// Les données du draft sont récupérées depuis l'API backend.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiAuthGet, apiAuthPost, authHeaders, fetchMe } from "@/lib/auth";
import { ApiError, apiPost } from "@/lib/api";
import { resolveFormError, ErrorContext } from "@/lib/form-errors";
import { emailNonVerifieMessage, isEmailNonVerifieError } from "@/lib/verification";
import { useEmailVerification } from "@/components/verification/EmailVerificationProvider";
import { routesFor } from "@/lib/routes";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import {
  PACKS,
  PACK_DETAILS,
  PERIODICITES,
  fmtFCFA,
} from "./plans";
import OpenSignCanvas from "./OpenSignCanvas";
import { createAuditEntry } from "../../lib/audit";
import { generateSignedPDF } from "../../lib/pdf-signature";

export interface SouscriptionNouveauFluxProps {
  locale?: Locale;
}

// ============================================================================
// TYPES & ÉTATS INITIAUX
// ============================================================================

type Step = "preview" | "sign" | "pay" | "success";

interface SouscriptionState {
  statutStructure: "existante" | "creation";
  denomination: string;
  formeJuridique: string;
  formeAutre: string;
  rccm: string;
  niu: string;
  noImmat: boolean;
  secteur: string;
  description: string;
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
  gamme: "nationale" | "internationale";
  pack: string;
  periodicite: string;
  options: string[];
  chkCgv: boolean;
  chkCadre: boolean;
  chkExactitude: boolean;
}

interface Draft {
  draft_id?: number;
  signer_email: string;
  payer_email: string;
  flow_token: string;
  statut: string;
  pack: string;
  prix: number;
  contrat_data: Record<string, unknown>;
  hash_brouillon?: string;
  hash_sha256?: string;
  signed_pdf_path?: string;
  step: number;
  savedAt: string;
  [key: string]: unknown;
}

const DRAFT_KEY = "souscription_domiciliation_draft_v1";
const REDIRECT_DRAFT_ID_KEY = "fedpawa_redirect_draft_id";

const TOTAL_STEPS = 4;

const INITIAL: SouscriptionState = {
  statutStructure: "existante",
  denomination: "",
  formeJuridique: "",
  formeAutre: "",
  rccm: "",
  niu: "",
  noImmat: false,
  secteur: "",
  description: "",
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
  gamme: "nationale",
  pack: "",
  periodicite: "mensuel",
  options: [],
  chkCgv: false,
  chkCadre: false,
  chkExactitude: false,
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SouscriptionNouveauFlux({
  locale = "fr",
}: SouscriptionNouveauFluxProps) {
  const t = getPageDictionary(locale, "souscription_domiciliation");
  const routes = routesFor(locale);
  const verif = useEmailVerification();

  // ------------------------------------------------------------------
  // États de flux (signature → paiement)
  // ------------------------------------------------------------------
  const [step, setStep] = useState<Step>("preview");
  const [form, setForm] = useState<SouscriptionState>(INITIAL);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // États de signature et paiement
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [flowToken, setFlowToken] = useState<string | null>(null);
  const [hashSha256, setHashSha256] = useState<string | null>(null);
  const [prix, setPrix] = useState<number>(0);
  const [otpSent, setOtpSent] = useState(false);
  const [invoice, setInvoice] = useState<{ dateStr: string; num: string } | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signatureMetadata, setSignatureMetadata] = useState<{ timestamp: string; ip: string; method: string; userAgent: string } | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [paymentLinkSent, setPaymentLinkSent] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [signatureLinkSent, setSignatureLinkSent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentTransactionId, setPaymentTransactionId] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<{ timestamp: string; action: string; ip: string; details: Record<string, unknown> }[]>([]);
  const [pdfHash, setPdfHash] = useState<string | null>(null);

  const otpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const set = <K extends keyof SouscriptionState>(key: K, value: SouscriptionState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const enCreation = form.statutStructure === "creation";
  const isAutre = form.formeJuridique === "Autre (précisez)";
  const currentPack = useMemo(
    () => PACKS[form.gamme as "nationale" | "internationale"]?.find((p) => p.value === form.pack),
    [form.gamme, form.pack]
  );
  const months = PERIODICITES[form.periodicite]?.months ?? 1;
  const total = currentPack ? currentPack.price * months : 0;
  const packLabel = currentPack ? currentPack.label : form.pack;
  const periodLabel = PERIODICITES[form.periodicite]
    ? (t as unknown as Record<string, string>)[PERIODICITES[form.periodicite].key]
    : t.perMonth;

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  // ------------------------------------------------------------------
  // Groupe 1 — Récupération des données du draft depuis le localStorage
  // (partagé avec GeneriqueFormulaire)
  // ------------------------------------------------------------------

  // Récupère le draftId depuis la redirection de GeneriqueFormulaire
  useEffect(() => {
    const stored = localStorage.getItem(REDIRECT_DRAFT_ID_KEY);
    if (stored && !draftId) {
      const id = parseInt(stored, 10);
      if (!isNaN(id)) {
        setDraftId(id);
        setStep("sign");
      }
      localStorage.removeItem(REDIRECT_DRAFT_ID_KEY);
    }
  }, []);

  // Charge les données du draft depuis l'API backend
  useEffect(() => {
    if (!draftId) return;
    (async () => {
      try {
        const d = await apiAuthGet<Draft>(`/api/v1/souscription/${draftId}`);
        if (d && d.status === 'ok') {
          setForm({
            statutStructure: d.statutStructure ?? "existante",
            denomination: d.contrat_data?.nom || d.contrat_data?.denomination || "",
            formeJuridique: d.contrat_data?.formeJuridique || "",
            formeAutre: d.contrat_data?.formeAutre || "",
            rccm: d.contrat_data?.rccm || "",
            niu: d.contrat_data?.niu || "",
            noImmat: d.contrat_data?.noImmat ?? false,
            secteur: d.contrat_data?.secteur || "",
            description: d.contrat_data?.description || "",
            civilite: d.contrat_data?.civilite || "",
            nomComplet: d.contrat_data?.nomComplet || d.contrat_data?.representant || "",
            fonction: d.contrat_data?.fonction || d.contrat_data?.qualite || "",
            nationalite: d.contrat_data?.nationalite || "",
            typePiece: d.contrat_data?.typePiece || "",
            numPiece: d.contrat_data?.numPiece || "",
            email: d.signer_email || d.contrat_data?.email || "",
            telephone: d.contrat_data?.telephone || "",
            adresse: d.contrat_data?.adresse || "",
            ville: d.contrat_data?.ville || "",
            pays: d.contrat_data?.pays || "Cameroun",
            gamme: (d.pack?.startsWith("national-") ? "nationale" : "internationale") as "nationale" | "internationale",
            pack: d.pack || "",
            periodicite: d.contrat_data?.periodicite || "mensuel",
            options: Array.isArray(d.contrat_data?.options) ? d.contrat_data.options : [],
            chkCgv: d.contrat_data?.chkCgv ?? false,
            chkCadre: d.contrat_data?.chkCadre ?? false,
            chkExactitude: d.contrat_data?.chkExactitude ?? false,
          });
          setPrix(d.prix || 0);
          setFlowToken(d.flow_token || null);
        }
      } catch {
        /* draft non lisible via API → état initial */
      }
    })();
  }, [draftId]);

  // Pré-remplissage depuis /me (utilisateur connecté)
  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        if (me && me.authenticated) {
          setForm((f) => ({
            ...f,
            denomination: me.denomination || f.denomination,
            civilite: me.civilite || f.civilite,
            nomComplet: me.fullName || f.nomComplet,
            fonction: me.function || f.fonction,
            nationalite: me.nationality || f.nationalite,
            email: me.email || f.email,
            telephone: me.phone || f.telephone,
            adresse: me.address || f.adresse,
            ville: me.city || f.ville,
            rccm: me.rccm || f.rccm,
            niu: me.niu || f.niu,
          }));
        }
      } catch {
        /* dégradation silencieuse */
      }
    })();
  }, []);

  // Sauvegarde du brouillon localStorage (pour reprise éventuelle)
  useEffect(() => {
    if (!draftId) return;
    try {
      const draft: Draft = {
        ...form,
        step: step === "sign" ? 4 : step === "pay" ? 5 : 6,
        savedAt: new Date().toISOString(),
        signer_email: form.email,
        payer_email: form.email,
        flow_token: flowToken ?? "",
        statut: "DRAFT",
        pack: form.pack,
        prix,
        contrat_data: { ...form },
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* quota / navigation privée : persistance indisponible */
    }
  }, [form, step, draftId, flowToken, prix]);

  useEffect(() => {
    document.body.style.overflow = showSuccess ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSuccess]);

  // Facture proforma : date et numéro calculés une fois
  useEffect(() => {
    const now = new Date();
    setInvoice({
      dateStr: now.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      num: "F-" + now.getFullYear() + "-" + String(now.getTime()).slice(-6),
    });
  }, []);

  // ------------------------------------------------------------------
  // Groupe 2 — Navigation
  // ------------------------------------------------------------------

  const goToStep = (n: number) => {
    setStep(stepOrder[n - 1]);
  };

  const domPrev = () => {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
  };

  // ------------------------------------------------------------------
  // Groupe 3 — Appels API (Signature → Paiement)
  // ------------------------------------------------------------------

  // Approbation du contrat (étape préalable à la signature)
  const handleApprove = async () => {
    if (!draftId) return;
    setLoading(true);
    setError(null);
    try {
      await apiAuthPost<{
        status: string;
        statut: string;
        hash_brouillon: string;
        message: string;
      }>(`/api/v1/souscription/${draftId}/approve`, {
        approuve: true,
      });
      setStep("sign");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Veuillez vérifier les champs du formulaire.",
              cat_unknown: "Erreur lors de l'approbation du contrat.",
            })
          : "Erreur lors de l'approbation du contrat."
      );
    } finally {
      setLoading(false);
    }
  };

  // Téléchargement du contrat brouillon (non signé) — étape preview
  const handleDownloadPreview = async () => {
    if (!draftId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/souscription/${draftId}/preview`, {
        headers: { ...authHeaders() },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec du téléchargement du contrat");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contrat_domiciliation_brouillon.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Impossible de télécharger le contrat.");
    } finally {
      setLoading(false);
    }
  };

  // Confirmer et passer à la signature
  const handleConfirmPreview = () => {
    setStep("sign");
  };

  // Collecte de l'email dédié (avant signature)
  const handleCollectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!emailInput.trim()) {
      setError("Veuillez saisir votre adresse e-mail.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setError("L'adresse e-mail n'est pas valide.");
      setLoading(false);
      return;
    }
    try {
      const res = await apiAuthPost<{
        status: string;
        flow_token: string;
        draft_id: number;
        signature_link: string;
        message: string;
      }>(`/api/v1/souscription/${draftId}/email-link`, {
        email: emailInput,
      });
      setFlowToken(res.flow_token);
      setPaymentLinkSent(false);
      setSignatureLinkSent(true);
      setStep("sign");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Erreur lors de l'enregistrement de l'e-mail.",
              cat_unknown: "Erreur lors de la collecte de l'e-mail.",
            })
          : "Erreur lors de la collecte de l'e-mail."
      );
    } finally {
      setLoading(false);
    }
  };

  // Envoi du lien de paiement (après signature)
  const handleSendPaymentLink = async () => {
    if (!draftId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuthPost<{
        status: string;
        payment_link: string;
        message: string;
      }>(`/api/v1/souscription/${draftId}/payment-link`, {});
      setPaymentLinkSent(true);
      setStep("pay");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Erreur lors de la génération du lien de paiement.",
              cat_unknown: "Erreur lors de l'envoi du lien de paiement.",
            })
          : "Erreur lors de l'envoi du lien de paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  // Paiement Mobile Money (Campay)
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftId) return;
    if (!phone || !operator) {
      setPaymentError("Veuillez sélectionner un opérateur et saisir votre numéro de téléphone.");
      return;
    }
    setLoading(true);
    setPaymentError(null);
    setPaymentInitiated(false);
    try {
      const res = await apiAuthPost<{
        status: string;
        statut: string;
        transaction_id: string | null;
        montant: number;
        message: string;
      }>(`/api/v1/souscription/${draftId}/pay`, {
        phone,
        operator,
      });
      setPaymentInitiated(true);
      setPaymentTransactionId(res.transaction_id ?? null);
      // Passer à l'étape succès après initiation du paiement
      setTimeout(() => {
        setStep("success");
      }, 1500);
    } catch (err) {
      setPaymentError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Impossible d'initier le paiement. Réessayez.",
              cat_unknown: "Erreur lors de l'initiation du paiement.",
            })
          : "Erreur lors de l'initiation du paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  // Demande d'OTP pour la signature
  const handleRequestOtp = async () => {
    if (!draftId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuthPost<{
        status: string;
        email: string;
        ttl_secondes: number;
        message: string;
      }>(`/api/v1/souscription/${draftId}/request-otp`, {});
      setOtpSent(true);
      otpTimerRef.current = setTimeout(() => {
        setError("Le code OTP a expiré. Demandez un nouveau code.");
      }, res.ttl_secondes * 1000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Veuillez vérifier les champs du formulaire.",
              cat_unknown: "Erreur lors de l'envoi du code OTP.",
            })
          : "Erreur lors de l'envoi du code OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // Signature électronique (OpenSign + OTP)
  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftId) return;
    if (!signatureImage || !signatureMetadata) {
      setError("Veuillez apposer votre signature avant de valider.");
      return;
    }
    if (!otp || otp.length !== 6) {
      setError("Veuillez saisir le code OTP à 6 chiffres avant de valider.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuthPost<{
        status: string;
        statut: string;
        hash_sha256: string;
        message: string;
      }>(`/api/v1/souscription/${draftId}/sign`, {
        otp,
        signature_image: signatureImage,
        signature_metadata: signatureMetadata,
      });
      setHashSha256(res.hash_sha256);
      // Journal d'audit append-only après signature
      const entry = {
        timestamp: new Date().toISOString(),
        action: "CONTRACT_SIGNED",
        ip: signatureMetadata.ip,
        details: {
          otp_verified: true,
          signature_method: signatureMetadata.method,
          signature_timestamp: signatureMetadata.timestamp,
          pack: form.pack,
          prix: prix,
          email: form.email,
          hash_sha256: res.hash_sha256,
        },
      };
      try {
        createAuditEntry(
          String(draftId),
          "CONTRACT_SIGNED",
          entry.details,
          {
            ip: signatureMetadata.ip,
            userAgent: signatureMetadata.userAgent,
            sessionId: draftId.toString(),
          }
        );
      } catch {
        /* journal d'audit non bloquant */
      }
      setAuditEntries((prev) => [...prev, entry]);
      // Génération du PDF signé avec page supplémentaire de preuve
      try {
        const pdfHash = generateSignedPDF(
          {
            pack: form.pack,
            prix: prix,
            nomComplet: form.nomComplet,
            denomination: form.denomination,
            email: form.email,
          },
          signatureImage || "",
          { transactionId: null, montant: prix },
          auditEntries,
          res.hash_sha256,
        );
        setPdfHash(pdfHash);
      } catch {
        /* génération PDF non bloquante */
      }
      // Après signature : passage à l'étape paiement (sans sortir de l'appli)
      setStep("pay");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Veuillez vérifier les champs du formulaire.",
              cat_unknown: "Erreur lors de la signature du contrat.",
            })
          : "Erreur lors de la signature du contrat."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reprise du paiement
  const handleResume = async () => {
    if (!draftId) return;
    setLoading(true);
    setError(null);
    try {
      await apiPost<{
        status: string;
        transaction_id: string | null;
        montant: number;
        message: string;
      }>(`/api/v1/souscription/${draftId}/resume`);
      setSuccess(
        "Lien de reprise généré. Procédez au paiement pour finaliser votre souscription."
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Veuillez vérifier les champs du formulaire.",
              cat_unknown: "Erreur lors de la reprise du paiement.",
            })
          : "Erreur lors de la reprise du paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Nettoyage du timer OTP à la démontage
  // ------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
    };
  }, []);

  // ============================================================================
  // Rendu JSX
  // ============================================================================

  const stepOrder: Step[] = ["preview", "sign", "pay", "success"];
  const stepLabels = [
    "Aperçu du contrat",
    "Signature électronique",
    "Paiement",
    "Succès",
  ];
  const currentStepIndex = stepOrder.indexOf(step);
  const gateModalOpen =
    verif.status === "unverified" ||
    (verif.gateOpen && verif.status !== "anonymous" && verif.status !== "verified");

  return (
    <>
      {/* STEPPER */}
      <div className="progress-wrapper" id="domStepper">
        <div className="container">
          <div className="dom-step-mobile" id="domStepMobile">
            <div className="dom-step-mobile-txt">
              <span id="domStepCount">
                {t.stepLabel} {currentStepIndex + 1}/{TOTAL_STEPS}
              </span>
              <strong id="domStepTitle">{stepLabels[currentStepIndex]}</strong>
            </div>
            <div className="dom-step-mobile-bar">
              <div
                className="dom-step-mobile-fill"
                id="domStepFill"
                style={{ width: `${(currentStepIndex / (TOTAL_STEPS - 1)) * 100}%` }}
              />
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-line">
              <div
                className="progress-line-fill"
                id="progressFill"
                style={{ width: `${(currentStepIndex / (TOTAL_STEPS - 1)) * 100}%` }}
              />
            </div>
            {stepLabels.map((label, i) => {
              const n = i + 1;
              return (
                <div
                  key={n}
                  className={
                    "progress-step" +
                    (n === currentStepIndex + 1 ? " active" : n < currentStepIndex + 1 ? " completed" : "")
                  }
                  data-step={n}
                  onClick={() => n < currentStepIndex + 1 && goToStep(n)}
                  style={{ cursor: n < currentStepIndex + 1 ? "pointer" : "default" }}
                >
                  <div className="progress-dot">{n}</div>
                  <span className="progress-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="nav-actions" style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
        {step !== "sign" && (
          <button className="btn btn-outline" onClick={domPrev}>
            {t.prev}
          </button>
        )}
      </div>

      <div className="container" style={{ padding: "32px 16px 64px" }}>
        <div className="tunnel-layout-v2">
          <div
            className="tunnel-card"
            style={{ padding: 40, boxShadow: "none", border: "1px solid var(--color-border)" }}
            id="souscriptionForm"
          >
            {/* ÉCRAN DE SUCCÈS */}
            {showSuccess ? (
              <>
                <div id="form-success" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      margin: "0 auto 24px",
                      borderRadius: "50%",
                      background: "var(--color-primary)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="#fff" strokeWidth={2.5}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>{t.successTitle}</h2>
                  <p style={{ color: "var(--color-text-muted)", maxWidth: 480, margin: "0 auto 8px" }}>
                    {t.successText1} <strong>{form.nomComplet || "client"}</strong>
                    {t.successText1End}
                  </p>
                  <p style={{ color: "var(--color-text-muted)", maxWidth: 480, margin: "0 auto 24px" }}>
                    {t.successText2.replace(t.success24h, "")}
                    <strong>{t.success24h}</strong>
                    {t.successText2.split(t.success24h)[1] ?? ""}
                  </p>
                  <Link href={routes.home} className="btn btn-outline">
                    {t.btnHome}
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* ÉTAPE PRÉVISUALISATION DU CONTRAT (non signé) */}
                {step === "preview" && (
                  <div className="tunnel-step-content active" data-step="preview">
                    <section className="form-section">
                      <h2 className="form-section-title">
                        <span className="form-section-num">1</span> Aperçu du contrat
                      </h2>
                      <p className="section-intro">
                        Vérifiez votre contrat de domiciliation avant de le
                        signer. Vous pouvez le télécharger.
                      </p>

                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          padding: 24,
                          marginBottom: 24,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1rem",
                            marginBottom: 12,
                            color: "#15294D",
                          }}
                        >
                          Détails du contrat
                        </h3>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            marginBottom: 6,
                          }}
                        >
                          <strong>Forfait :</strong> {packLabel}
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            marginBottom: 6,
                          }}
                        >
                          <strong>Montant :</strong> {fmtFCFA(total)} FCFA
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            marginBottom: 6,
                          }}
                        >
                          <strong>Client :</strong>{" "}
                          {form.nomComplet || "—"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            marginBottom: 6,
                          }}
                        >
                          <strong>Entreprise :</strong>{" "}
                          {form.denomination || "—"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            marginBottom: 6,
                          }}
                        >
                          <strong>RCCM :</strong> {form.rccm || "—"} &nbsp;
                          |&nbsp; <strong>NIU :</strong> {form.niu || "—"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            marginBottom: 0,
                          }}
                        >
                          <strong>Adresse :</strong>{form.adresse}, {form.ville},{" "}
                          {form.pays}
                        </p>
                      </div>

                      <div className="flex gap-3 justify-center">
                        <button
                          type="button"
                          onClick={handleDownloadPreview}
                          disabled={loading}
                          className="btn btn-outline"
                        >
                          {loading
                            ? "Téléchargement…"
                            : "Télécharger le contrat (non signé)"}
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmPreview}
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          Poursuivre vers la signature
                        </button>
                      </div>
                    </section>
                  </div>
                )}

                {/* ÉTAPE SIGNATURE (modal) */}
                {step === "sign" && (
                  <div
                    id="signature-modal-overlay"
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(8,12,24,0.55)",
                      zIndex: 9999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20,
                    }}
                  >
                    <div
                      id="signature-modal"
                      role="dialog"
                      aria-modal="true"
                      style={{
                        background: "var(--color-bg-main)",
                        borderRadius: 14,
                        maxWidth: 640,
                        width: "100%",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        padding: 32,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <h3 style={{ marginBottom: 10 }}>{t.signTitle || "Signature électronique"}</h3>
                      <p style={{ fontSize: "0.92rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 20 }}>
                        Un code OTP à 6 chiffres a été envoyé à {form.email}. Il est valable 24 heures.
                      </p>

                      {/* Contrat final (pré-rempli depuis le draft) */}
                      <div style={{ marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <h4 style={{ fontSize: "0.9rem", marginBottom: 8, color: "#15294D" }}>Contrat à signer</h4>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                          <strong>Forfait :</strong> {packLabel}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                          <strong>Montant :</strong> {fmtFCFA(total)} FCFA
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                          <strong>Client :</strong> {form.nomComplet || "—"}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          <strong>Entreprise :</strong> {form.denomination || "—"}
                        </p>
                      </div>

                      {!otpSent && (
                        <div className="flex justify-end">
                          <button
                            onClick={handleRequestOtp}
                            disabled={loading}
                            className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? "Envoi…" : "Envoyer le code OTP"}
                          </button>
                        </div>
                      )}

                      {otpSent && (
                        <div style={{ marginTop: 16 }}>
                          <OpenSignCanvas
                            onComplete={(signatureDataUrl, metadata) => {
                              setSignatureImage(signatureDataUrl);
                              setSignatureMetadata(metadata);
                            }}
                            onCancel={() => {
                              setSignatureImage(null);
                              setSignatureMetadata(null);
                            }}
                            disabled={loading}
                          />
                        </div>
                      )}

                      {otpSent && signatureImage && (
                        <div style={{ marginTop: 16, padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                          <p style={{ fontSize: "0.85rem", color: "#166534", margin: 0 }}>
                            ✓ Signature capturée. Veuillez maintenant saisir le code OTP.
                          </p>
                        </div>
                      )}

                      {otpSent && (
                        <form onSubmit={handleSign} className="space-y-4" style={{ marginTop: 16 }}>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Code OTP à 6 chiffres
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-center text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="123456"
                              autoComplete="off"
                            />
                          </div>
                          <div className="flex justify-between">
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              disabled={loading}
                              className="text-sm text-gray-600 hover:underline disabled:opacity-50"
                            >
                              Renvoyer le code
                            </button>
                            <button
                              type="submit"
                              disabled={
                                loading ||
                                otp.length !== 6 ||
                                !signatureImage
                              }
                              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {loading ? "Vérification…" : "Valider et signer"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* ÉTAPE PAIEMENT */}
                {step === "pay" && (
                  <div className="tunnel-step-content active" data-step="pay">
                    <section className="form-section">
                      <h2 className="form-section-title">
                        <span className="form-section-num">5</span> Paiement sécurisé
                      </h2>
                      <p className="section-intro">
                        Votre contrat a été signé électroniquement. Procédez au paiement
                        pour activer votre service de domiciliation.
                      </p>

                      <div style={{ background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", padding: 20, marginBottom: 20 }}>
                        <h3 style={{ fontSize: "1rem", marginBottom: 10, color: "#15294D" }}>Récapitulatif</h3>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                          <strong>Forfait :</strong> {packLabel}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                          <strong>Montant :</strong> {fmtFCFA(total)} FCFA
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                          <strong>Client :</strong> {form.nomComplet || "—"}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 6 }}>
                          <strong>Entreprise :</strong> {form.denomination || "—"}
                        </p>
                        {hashSha256 && (
                          <p style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace", wordBreak: "break-all", marginBottom: 0 }}>
                            <strong>Empreinte du contrat :</strong> {hashSha256}
                          </p>
                        )}
                      </div>

                      {paymentError && (
                        <div style={{ color: "#dc2626", padding: 12, background: "#fef2f2", borderRadius: 4, marginBottom: 16, fontSize: "0.85rem" }}>
                          {paymentError}
                        </div>
                      )}

                      {!paymentInitiated && (
                        <form onSubmit={handlePay} className="space-y-4" noValidate>
                          <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Opérateur de paiement
                            </label>
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => setOperator("MTN")}
                                className={`w-full border border-gray-300 rounded px-3 py-2 text-left ${operator === "MTN" ? "border-blue-500 bg-blue-50" : ""}`}
                              >
                                MTN Mobile Money
                              </button>
                              <button
                                type="button"
                                onClick={() => setOperator("Orange")}
                                className={`w-full border border-gray-300 rounded px-3 py-2 text-left ${operator === "Orange" ? "border-blue-500 bg-blue-50" : ""}`}
                              >
                                Orange Money
                              </button>
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Numéro de téléphone
                            </label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+237 6XX XXX XXX"
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              required
                            />
                            <small className="field-hint">
                              Pour le test, utilisez le numéro simulé : 659542937
                            </small>
                          </div>
                          <button
                            type="submit"
                            disabled={loading || !phone || !operator}
                            className="btn btn-primary btn-block"
                          >
                            {loading ? "Paiement en cours…" : `Payer ${fmtFCFA(total)} FCFA`}
                          </button>
                        </form>
                      )}

                      {paymentInitiated && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 16, marginTop: 16, color: "#166534" }}>
                          <p style={{ margin: 0, fontSize: "0.85rem" }}>
                            <strong>Paiement initié.</strong> Votre contrat sera activé dès confirmation du paiement par l'opérateur Mobile Money.
                          </p>
                          {paymentTransactionId && (
                            <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#166534" }}>
                              Transaction : {paymentTransactionId}
                            </p>
                          )}
                        </div>
                      )}
                    </section>
                  </div>
                )}

                {/* ÉCRAN DE SUCCÈS (alternatif si showSuccess=false mais step=success) */}
                {step === "success" && !showSuccess && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Souscription finalisée</h2>
                    <p className="text-gray-600 mb-6">
                      Votre contrat est signé et votre paiement est confirmé. Votre service de domiciliation est activé.
                    </p>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 inline-block">
                      <p className="text-sm text-gray-700">
                        Forfait : <strong>{packLabel}</strong><br />
                        Montant : <strong>{fmtFCFA(total)} FCFA</strong><br />
                        {hashSha256 && (<> <br /> Empreinte SHA-256 : <code className="text-xs break-all">{hashSha256}</code> </>)}
                      </p>
                    </div>
                    <div className="mt-6 flex gap-3 justify-center">
                      <Link href={routes.espaceClient} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Accéder à mon espace client
                      </Link>
                      <button
                        onClick={() => {
                          setStep("sign");
                          setForm(INITIAL);
                          setDraftId(null);
                          setFlowToken(null);
                          setHashSha256(null);
                          setPrix(0);
                          setOtpSent(false);
                          setOtp("");
                          setSuccess(null);
                          setError(null);
                        }}
                        className="text-gray-600 hover:underline text-sm"
                      >
                        Nouvelle souscription
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// NOTE : Le composant Dropzone interne a été retiré de ce fichier.
// Les uploads de fichiers KYC sont désormais gérés par GeneriqueFormulaire.
// ============================================================================

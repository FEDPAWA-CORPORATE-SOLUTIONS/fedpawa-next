"use client";

// ============================================================================
// FEDPAWA — Nouveau flux de souscription : Signature → Paiement
// Conforme au CAHIER DES CHARGES TECHNIQUE (parcours de souscription,
// signature électronique et paiement en ligne).
//
// Ordre logique : SIGNATURE AVANT PAIEMENT.
// Aucun compte à rebours de 30 min sur les liens. IP tracée mais non bloquante.
//
// Groupes d'intégration (165 éléments) :
//   G1 — Fondation : architecture, état & brouillon localStorage
//   G2 — Navigation : stepper & contrôle de flux
//   G3 — Formulaire : entreprise, représentant & contact
//   G4 — Offre : gamme, pack, périodicité & options
//   G5 — Preuves & validations : dropzones KYC & cases à cocher
//   G6 — Transaction : proforma/facturation & sidebar récapitulative
//   G7 — Interactions : modales de signature, paiement, reprise & smart-détection
//   G8 — Sécurité & internationalisation : vérification email, erreurs, UX & i18n
//   G9 — Finition : données, scroll, overlays, appels API & structure JSX
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiAuthPost, fetchMe } from "@/lib/auth";
import { ApiError, apiPost } from "@/lib/api";
import { resolveFormError, ErrorContext } from "@/lib/form-errors";
import { emailNonVerifieMessage, isEmailNonVerifieError } from "@/lib/verification";
import { useEmailVerification } from "@/components/verification/EmailVerificationProvider";
import { routesFor } from "@/lib/routes";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import {
  PACKS,
  PACK_DETAILS,
  EXTRA_OPTIONS,
  PERIODICITES,
  fmtFCFA,
  COUNTRIES,
  SECTEURS,
  FORMES_JURIDIQUES,
  FONCTIONS,
  TYPES_PIECE,
} from "./plans";
import OpenSignCanvas from "./OpenSignCanvas";
import { createAuditEntry } from "../../lib/audit";

export interface SouscriptionNouveauFluxProps {
  locale?: Locale;
}

// ============================================================================
// TYPES & ÉTATS INITIAUX (Groupe 1 — Fondation)
// ============================================================================

type Step = "form" | "approve" | "email" | "sign" | "pay" | "success";

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

interface FormFile {
  identite?: File;
  statuts?: File;
  domicile?: File;
}

interface Draft {
  client_id?: number;
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
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  paiement_transaction_id?: string;
  otp_verified_at?: string;
  step: number;
  savedAt: string;
  [key: string]: unknown;
}

const DRAFT_KEY = "souscription_domiciliation_draft_v1";

const DRAFT_FIELDS: (keyof Omit<SouscriptionState, "files">)[] = [
  "statutStructure", "denomination", "formeJuridique", "formeAutre", "rccm", "niu",
  "noImmat", "secteur", "description", "civilite", "nomComplet", "fonction",
  "nationalite", "typePiece", "numPiece", "email", "telephone", "adresse", "ville",
  "pays", "gamme", "pack", "periodicite", "options", "chkCgv", "chkCadre", "chkExactitude",
];

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

const TOTAL_STEPS = 6;

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
  // États de formulaire (Groupe 1)
  // ------------------------------------------------------------------
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<SouscriptionState>(INITIAL);
  const [files, setFiles] = useState<FormFile>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [smartModal, setSmartModal] = useState<"closed" | "open" | "blocked">("closed");

  // États de flux nouveau plan (Groupe 7)
  const [kycDone, setKycDone] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
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

  // Brouillon localStorage (Groupe 1)
  const [savedDraft, setSavedDraft] = useState<Draft | null>(null);
  const [draftResolved, setDraftResolved] = useState(false);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const meRef = useRef<Record<string, string | undefined> | null>(null);
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

  // ============================================================================
  // Groupe 1 — Fondation : brouillon localStorage
  // ============================================================================

  function draftHasContent(d: Draft): boolean {
    if (d.step > 1) return true;
    if (Array.isArray(d.options) && d.options.length) return true;
    if (d.noImmat || d.chkCgv || d.chkCadre || d.chkExactitude) return true;
    return DRAFT_FIELDS.some((k) => {
      const v = d[k];
      return typeof v === "string" && v.trim() !== "";
    });
  }

  const applyUrlPack = useCallback(() => {
    if (typeof window === "undefined") return;
    const urlPack = new URLSearchParams(window.location.search).get("pack");
    if (urlPack && (urlPack.startsWith("national-") || urlPack.startsWith("international-"))) {
      const g: "nationale" | "internationale" = urlPack.startsWith("national-") ? "nationale" : "internationale";
      setForm((f) => ({ ...f, gamme: g, pack: "" }));
    }
  }, []);

  const applyMeFill = useCallback((me: Record<string, string | undefined>) => {
    const fill = (key: keyof SouscriptionState, src?: string) => {
      if (!src) return;
      setForm((f) => (f[key] ? f : ({ ...f, [key]: src } as SouscriptionState)));
    };
    fill("denomination", me.denomination);
    fill("civilite", me.civilite);
    fill("nomComplet", me.fullName);
    fill("fonction", me.function);
    fill("nationalite", me.nationality);
    fill("email", me.email);
    fill("telephone", me.phone);
    fill("adresse", me.address);
    fill("ville", me.city);
    fill("rccm", me.rccm);
    fill("niu", me.niu);
  }, []);

  useEffect(() => {
    applyUrlPack();
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
  }, [applyUrlPack, applyMeFill]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Draft;
      if (draftHasContent(d)) setSavedDraft(d);
      else localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* brouillon corrompu → ignoré */
    }
  }, []);

  useEffect(() => {
    if (!draftResolved) return;
    try {
      const draft: Draft = {
        ...form,
        step:
          step === "form"
            ? 1
            : step === "approve"
              ? 2
              : step === "email"
                ? 3
                : step === "sign"
                  ? 4
                  : step === "pay"
                    ? 5
                    : 6,
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
  }, [form, step, draftResolved]);

  useEffect(() => {
    document.body.style.overflow = !!savedDraft && !draftResolved ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [savedDraft, draftResolved]);

  function resumeDraft() {
    const d = savedDraft;
    if (d) {
      setForm((f) => ({
        ...f,
        statutStructure: (d.statutStructure ?? f.statutStructure) as SouscriptionState["statutStructure"],
        denomination: d.denomination ?? f.denomination,
        formeJuridique: d.formeJuridique ?? f.formeJuridique,
        formeAutre: d.formeAutre ?? f.formeAutre,
        rccm: d.rccm ?? d.rccm ?? f.rccm,
        niu: d.niu ?? d.niu ?? f.niu,
        noImmat: d.noImmat ?? d.noImmat ?? f.noImmat,
        secteur: d.secteur ?? f.secteur,
        description: d.description ?? f.description,
        civilite: d.civilite ?? f.civilite,
        nomComplet: d.nomComplet ?? f.nomComplet,
        fonction: d.fonction ?? f.fonction,
        nationalite: d.nationalite ?? f.nationalite,
        typePiece: d.typePiece ?? f.typePiece,
        numPiece: d.numPiece ?? f.numPiece,
        email: d.email ?? f.email,
        telephone: d.telephone ?? f.telephone,
        adresse: d.adresse ?? f.adresse,
        ville: d.ville ?? f.ville,
        pays: d.pays ?? f.pays,
        gamme: (d.gamme ?? f.gamme) as SouscriptionState["gamme"],
        pack: d.pack ?? f.pack,
        periodicite: d.periodicite ?? f.periodicite,
        options: d.options ?? f.options,
        chkCgv: d.chkCgv ?? f.chkCgv,
        chkCadre: d.chkCadre ?? f.chkCadre,
        chkExactitude: d.chkExactitude ?? f.chkExactitude,
      }) as SouscriptionState);
      if (d.step >= 1 && d.step <= TOTAL_STEPS) {
        const stepMap: Record<number, Step> = { 1: "form", 2: "approve", 3: "email", 4: "sign", 5: "pay", 6: "success" };
        setStep(stepMap[d.step]);
      }
    }
    setSavedDraft(null);
    setDraftResolved(true);
  }

  function restartDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setSavedDraft(null);
    setDraftResolved(true);
    setForm({ ...INITIAL, options: [] });
    setStep("form");
    applyUrlPack();
    if (meRef.current) applyMeFill(meRef.current);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Facture proforma : date et numéro calculés une fois (évite new Date() au rendu)
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

  // ============================================================================
  // Groupe 7 — Appels API du nouveau flux (Signature → Paiement)
  // ============================================================================

  // ---------- Validation complète du formulaire (tous les champs) ----------
  function validateForm(): boolean {
    const fieldErrs: Record<string, string[]> = {};
    const errs: string[] = [];
    const required = (v: string, field: string) => {
      if (!v.trim()) {
        errs.push(t.errRequired);
        if (!fieldErrs[field]) fieldErrs[field] = [];
        fieldErrs[field].push(t.errRequired);
      }
    };

    // Étape 1 : Entreprise
    required(form.denomination, "denomination");
    if (!form.formeJuridique) {
      errs.push(t.errRequired);
      if (!fieldErrs["formeJuridique"]) fieldErrs["formeJuridique"] = [];
      fieldErrs["formeJuridique"].push(t.errRequired);
    }
    if (isAutre) required(form.formeAutre, "formeAutre");
    if (!enCreation) {
      required(form.rccm, "rccm");
      required(form.niu, "niu");
    }
    required(form.secteur, "secteur");
    required(form.description, "description");

    // Étape 2 : Représentant
    if (!form.civilite) {
      errs.push(t.errRequired);
      if (!fieldErrs["civilite"]) fieldErrs["civilite"] = [];
      fieldErrs["civilite"].push(t.errRequired);
    }
    required(form.nomComplet, "nomComplet");
    if (!form.fonction) {
      errs.push(t.errRequired);
      if (!fieldErrs["fonction"]) fieldErrs["fonction"] = [];
      fieldErrs["fonction"].push(t.errRequired);
    }
    required(form.nationalite, "nationalite");
    if (!form.typePiece) {
      errs.push(t.errRequired);
      if (!fieldErrs["typePiece"]) fieldErrs["typePiece"] = [];
      fieldErrs["typePiece"].push(t.errRequired);
    }
    required(form.numPiece, "numPiece");

    // Étape 3 : Contact
    required(form.email, "email");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.push(t.errEmail);
      if (!fieldErrs["email"]) fieldErrs["email"] = [];
      fieldErrs["email"].push(t.errEmail);
    }
    required(form.telephone, "telephone");
    if (form.telephone && !/^\+?[0-9\s]{9,16}$/.test(form.telephone)) {
      errs.push(t.errPhone);
      if (!fieldErrs["telephone"]) fieldErrs["telephone"] = [];
      fieldErrs["telephone"].push(t.errPhone);
    }
    required(form.adresse, "adresse");
    required(form.ville, "ville");
    if (!form.pays) {
      errs.push(t.errRequired);
      if (!fieldErrs["pays"]) fieldErrs["pays"] = [];
      fieldErrs["pays"].push(t.errRequired);
    }

    // Étape 4 : Offre
    if (!form.pack) {
      errs.push(t.errPackMissing);
      if (!fieldErrs["pack"]) fieldErrs["pack"] = [];
      fieldErrs["pack"].push(t.errPackMissing);
    }

    // Étape 5 : KYC (si pas déjà fait)
    if (!kycDone) {
      if (!files.identite) {
        errs.push(t.errIdentite);
        if (!fieldErrs["identite"]) fieldErrs["identite"] = [];
        fieldErrs["identite"].push(t.errIdentite);
      }
      if (!files.statuts) {
        errs.push(t.errStatuts);
        if (!fieldErrs["statuts"]) fieldErrs["statuts"] = [];
        fieldErrs["statuts"].push(t.errStatuts);
      }
    }

    // Cases de validation
    if (!form.chkCgv || !form.chkCadre || !form.chkExactitude) {
      errs.push(t.errValidations);
    }

    setFieldErrors(fieldErrs);
    setErrors([...new Set(errs)]);
    return errs.length === 0;
  }

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Gate email : blocage si e-mail non vérifié
    if (verif.unverified) {
      verif.requestGate();
      setError(emailNonVerifieMessage(locale));
      setLoading(false);
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    if (!form.chkCgv || !form.chkCadre || !form.chkExactitude) {
      setError("Vous devez cocher toutes les cases de validation avant de continuer.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiAuthPost<{
        status: string;
        flow_token: string;
        draft_id: number;
        statut: string;
        pack: string;
        prix: number;
        message: string;
      }>("/api/v1/souscription-nouveau-flux/draft", {
        email: form.email,
        pack: form.pack,
        nom: form.nomComplet,
        entreprise: form.denomination || undefined,
        telephone: form.telephone || undefined,
        adresse: form.adresse || undefined,
        rccm: form.rccm || undefined,
        niu: form.niu || undefined,
        representant: form.nomComplet,
        qualite: form.fonction || "Gérant",
      });
      setDraftId(res.draft_id);
      setFlowToken(res.flow_token);
      setPrix(res.prix);
      setStep("approve");
    } catch (err) {
      if (isEmailNonVerifieError(err)) {
        verif.requestGate();
        void verif.refresh?.();
        setError(emailNonVerifieMessage(locale));
      } else {
        setError(
          err instanceof ApiError
            ? resolveFormError(err, "souscription", {
                validation_generic: "Veuillez vérifier les champs du formulaire.",
                cat_unknown: "Erreur lors de la création du dossier.",
              })
            : "Erreur lors de la création du dossier."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
      }>(`/api/v1/souscription-nouveau-flux/${draftId}/approve`, {
        approuve: true,
      });
      setStep("email");
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

  // ---------- Étape : Collecte de l'email dédié ----------
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
      }>(`/api/v1/souscription-nouveau-flux/${draftId}/email-link`, {
        email: emailInput,
      });
      setFlowToken(res.flow_token);
      setPaymentLinkSent(false);
      setSignatureLinkSent(true);
      window.location.href = res.signature_link;
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

  // ---------- Étape : Envoi du lien de paiement (après signature) ----------
  const handleSendPaymentLink = async () => {
    if (!draftId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuthPost<{
        status: string;
        payment_link: string;
        message: string;
      }>(`/api/v1/souscription-nouveau-flux/${draftId}/payment-link`, {});
      setPaymentLinkSent(true);
      window.location.href = res.payment_link;
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
      }>(`/api/v1/souscription-nouveau-flux/${draftId}/request-otp`, {});
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

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftId) return;
    if (!signatureImage || !signatureMetadata) {
      setError("Veuillez apposer votre signature avant de valider.");
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
      }>(`/api/v1/souscription-nouveau-flux/${draftId}/sign`, {
        otp,
        signature_image: signatureImage,
        signature_metadata: signatureMetadata,
      });
      setHashSha256(res.hash_sha256);
      // Journal d'audit append-only après signature
      try {
        createAuditEntry(
          String(draftId),
          "CONTRACT_SIGNED",
          {
            otp_verified: true,
            signature_method: signatureMetadata.method,
            signature_timestamp: signatureMetadata.timestamp,
            pack: form.pack,
            prix: prix,
            email: form.email,
            hash_sha256: res.hash_sha256,
          },
          {
            ip: signatureMetadata.ip,
            userAgent: signatureMetadata.userAgent,
            sessionId: draftId.toString(),
          }
        );
      } catch {
        /* journal d'audit non bloquant */
      }
      // Après signature : génération du lien de paiement
      await handleSendPaymentLink();
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
      }>(`/api/v1/souscription-nouveau-flux/${draftId}/resume`);
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
  // Navigation (Groupe 2)
  // ------------------------------------------------------------------

  const goToStep = (n: number) => {
    const map: Record<number, Step> = { 1: "form", 2: "approve", 3: "email", 4: "sign", 5: "pay", 6: "success" };
    setStep(map[n]);
  };

  const domPrev = () => {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
  };

  const domNext = () => {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
  };

  useEffect(() => {
    return () => {
      if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
    };
  }, []);

  const stepOrder: Step[] = ["form", "approve", "email", "sign", "pay", "success"];
  const stepLabels = [t.step1, t.step2, t.step3, t.step4, t.step5, t.step6];
  const currentStepIndex = stepOrder.indexOf(step);
  const gateModalOpen =
    verif.status === "unverified" ||
    (verif.gateOpen && verif.status !== "anonymous" && verif.status !== "verified");
  const resumePending = !!savedDraft && !draftResolved;
  const showResumeModal =
    resumePending && !gateModalOpen && smartModal === "closed";

  // ============================================================================
  // Rendu JSX (Groupes 3 à 9)
  // ============================================================================

  return (
    <>
      {/* ========================================================================
          STEPPER (Groupe 2)
          ======================================================================== */}
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
        {step !== "form" && (
          <button className="btn btn-outline" onClick={domPrev}>
            {t.prev}
          </button>
        )}
      </div>

      <div className="container" style={{ padding: "32px 16px 64px" }}>
        <div className="tunnel-layout-v2">
          {/* ========================================================================
              FORMULAIRE (Groupes 3, 4, 5, 6)
              ======================================================================== */}
          <div
            className="tunnel-card"
            style={{ padding: 40, boxShadow: "none", border: "1px solid var(--color-border)" }}
            id="souscriptionForm"
          >
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
                    <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="#fff" strokeWidth="2.5">
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
              <form id="domiciliationForm" onSubmit={handleCreateDraft} noValidate>
                {/* ------------------------------------------------------------------
                    ÉTAPE 1 : ENTREPRISE (Groupe 3)
                    ------------------------------------------------------------------ */}
                <div
                  className={"tunnel-step-content" + (step === "form" ? " active" : "")}
                  data-step="1"
                >
                  <section className="form-section">
                    <h2 className="form-section-title">
                      <span className="form-section-num">1</span> {t.s1Title}
                    </h2>
                    {Object.keys(fieldErrors).length > 0 && (
                      <div id="form-field-errors" className="form-errors" style={{ display: "block", marginBottom: 16 }}>
                        <strong>{t.errTitle}</strong>
                        <ul>
                          {Object.entries(fieldErrors).map(([field, msgs], fi) => (
                            <li key={fi}>
                              <strong>{field}:</strong> {msgs.join(", ")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="form-group">
                      <label>{t.statutLabel} <em className="req">*</em></label>
                      <div className="radio-row">
                        <label className="radio-pill">
                          <input
                            type="radio"
                            name="statut_structure"
                            value="existante"
                            checked={form.statutStructure === "existante"}
                            onChange={() => set("statutStructure", "existante")}
                          />{" "}
                          {t.statutExistante}
                        </label>
                        <label className="radio-pill">
                          <input
                            type="radio"
                            name="statut_structure"
                            value="creation"
                            checked={form.statutStructure === "creation"}
                            onChange={() => set("statutStructure", "creation")}
                          />{" "}
                          {t.statutCreation}
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="denomination">{t.denominationLabel} <em className="req">*</em></label>
                      <input
                        type="text"
                        id="denomination"
                        className="form-control"
                        required
                        placeholder={t.denominationPh}
                        value={form.denomination}
                        onChange={(e) => set("denomination", e.target.value)}
                      />
                      <small className="field-hint">{t.denominationPh}</small>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="forme_juridique">{t.formeLabel} <em className="req">*</em></label>
                        <select
                          id="forme_juridique"
                          className="form-control"
                          required
                          value={form.formeJuridique}
                          onChange={(e) => set("formeJuridique", e.target.value)}
                        >
                          <option value="">{t.selectPlaceholder}</option>
                          {FORMES_JURIDIQUES.map((f) => <option key={f}>{f}</option>)}
                        </select>
                        <small className="field-hint">{t.selectPlaceholder}</small>
                      </div>
                      {isAutre && (
                        <div className="form-group" id="forme-autre-group">
                          <label htmlFor="forme_autre">{t.formeAutreLabel}</label>
                          <input
                            type="text"
                            id="forme_autre"
                            className="form-control"
                            placeholder={t.formeAutrePh}
                            value={form.formeAutre}
                            onChange={(e) => set("formeAutre", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="rccm">{t.rccmLabel} <em className="req" style={enCreation ? { display: "none" } : undefined}>*</em></label>
                        <input
                          type="text"
                          id="rccm"
                          className="form-control"
                          required={!enCreation}
                          placeholder={enCreation ? t.rccmCreatingPh : t.rccmPh}
                          value={form.rccm}
                          onChange={(e) => set("rccm", e.target.value)}
                        />
                        <small className="field-hint">{t.rccmHint}</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="niu">{t.niuLabel} <em className="req" style={enCreation ? { display: "none" } : undefined}>*</em></label>
                        <input
                          type="text"
                          id="niu"
                          className="form-control"
                          required={!enCreation}
                          placeholder={enCreation ? t.rccmCreatingPh : t.niuPh}
                          value={form.niu}
                          onChange={(e) => set("niu", e.target.value)}
                        />
                        <small className="field-hint">{t.rccmHint}</small>
                      </div>
                      <div className="form-group" style={{ background: "var(--color-bg-alt)", padding: "12px 14px", borderRadius: 8, border: "1px dashed var(--color-border)" }}>
                        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: "0.9rem", textTransform: "none", letterSpacing: 0, fontWeight: 500, cursor: "pointer", marginBottom: 4 }}>
                          <input type="checkbox" id="opt-no-immat" className="fp-check" style={{ marginTop: 3 }} checked={form.noImmat} onChange={(e) => set("noImmat", e.target.checked)} />
                          <span>{t.noImmat}</span>
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="secteur">{t.secteurLabel} <em className="req">*</em></label>
                      <select id="secteur" className="form-control" required value={form.secteur} onChange={(e) => set("secteur", e.target.value)}>
                        <option value="">{t.selectPlaceholder}</option>
                        {SECTEURS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <small className="field-hint">{t.selectPlaceholder}</small>
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">{t.descriptionLabel} <em className="req">*</em></label>
                      <textarea id="description" className="form-control" rows={3} required placeholder={t.descriptionPh} value={form.description} onChange={(e) => set("description", e.target.value)} />
                      <small className="field-hint">{t.descriptionPh}</small>
                    </div>
                  </section>
                  <div className="btn-group">
                    <button type="button" className="btn btn-primary" onClick={domNext}>{t.btnContinue}</button>
                  </div>
                </div>

                {/* ------------------------------------------------------------------
                    ÉTAPE 2 : REPRÉSENTANT (Groupe 3)
                    ------------------------------------------------------------------ */}
                <div className={"tunnel-step-content" + (step === "form" ? " active" : "")} data-step="2">
                  <section className="form-section">
                    <h2 className="form-section-title"><span className="form-section-num">2</span> {t.s2Title}</h2>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="civilite">{t.civiliteLabel} <em className="req">*</em></label>
                        <select id="civilite" className="form-control" required value={form.civilite} onChange={(e) => set("civilite", e.target.value)}>
                          <option value="">{t.selectPlaceholder}</option>
                          <option>Monsieur</option>
                          <option>Madame</option>
                        </select>
                        <small className="field-hint">{t.selectPlaceholder}</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="nom_complet">{t.nomCompletLabel} <em className="req">*</em></label>
                        <input type="text" id="nom_complet" className="form-control" required placeholder={t.nomCompletPh} value={form.nomComplet} onChange={(e) => set("nomComplet", e.target.value)} />
                        <small className="field-hint">{t.nomCompletPh}</small>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="fonction">{t.fonctionLabel} <em className="req">*</em></label>
                        <select id="fonction" className="form-control" required value={form.fonction} onChange={(e) => set("fonction", e.target.value)}>
                          <option value="">{t.selectPlaceholder}</option>
                          {FONCTIONS.map((f) => <option key={f}>{f}</option>)}
                        </select>
                        <small className="field-hint">{t.selectPlaceholder}</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="nationalite">{t.nationaliteLabel} <em className="req">*</em></label>
                        <input type="text" id="nationalite" className="form-control" required placeholder={t.nationalitePh} value={form.nationalite} onChange={(e) => set("nationalite", e.target.value)} />
                        <small className="field-hint">{t.nationalitePh}</small>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="type_piece">{t.typePieceLabel} <em className="req">*</em></label>
                        <select id="type_piece" className="form-control" required value={form.typePiece} onChange={(e) => set("typePiece", e.target.value)}>
                          <option value="">{t.selectPlaceholder}</option>
                          {TYPES_PIECE.map((p) => <option key={p}>{p}</option>)}
                        </select>
                        <small className="field-hint">{t.selectPlaceholder}</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="num_piece">{t.numPieceLabel} <em className="req">*</em></label>
                        <input type="text" id="num_piece" className="form-control" required placeholder={t.numPiecePh} value={form.numPiece} onChange={(e) => set("numPiece", e.target.value)} />
                        <small className="field-hint">{t.numPiecePh}</small>
                      </div>
                    </div>
                  </section>
                  <div className="btn-group">
                    <button type="button" className="btn btn-outline" onClick={() => goToStep(1)}>{t.btnBack}</button>
                    <button type="button" className="btn btn-primary" onClick={domNext}>{t.btnContinue}</button>
                  </div>
                </div>

                {/* ------------------------------------------------------------------
                    ÉTAPE 3 : CONTACT (Groupe 3)
                    ------------------------------------------------------------------ */}
                <div className={"tunnel-step-content" + (step === "form" ? " active" : "")} data-step="3">
                  <section className="form-section">
                    <h2 className="form-section-title"><span className="form-section-num">3</span> {t.s3Title}</h2>
                    <p className="section-intro">{t.s3Intro}</p>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">{t.emailLabel} <em className="req">*</em></label>
                        <input type="email" id="email" className="form-control" required placeholder={t.emailPh} value={form.email} onChange={(e) => set("email", e.target.value)} />
                        <small className="field-hint">{t.emailPh}</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="telephone">{t.telLabel} <em className="req">*</em></label>
                        <input type="tel" id="telephone" className="form-control" required placeholder={t.telPh} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} />
                        <small className="field-hint">{t.telHint}</small>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="adresse">{t.adresseLabel} <em className="req">*</em></label>
                      <input type="text" id="adresse" className="form-control" required placeholder={t.adressePh} value={form.adresse} onChange={(e) => set("adresse", e.target.value)} />
                      <small className="field-hint">{t.adressePh}</small>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="ville">{t.villeLabel} <em className="req">*</em></label>
                        <input type="text" id="ville" className="form-control" required placeholder={t.villePh} value={form.ville} onChange={(e) => set("ville", e.target.value)} />
                        <small className="field-hint">{t.villePh}</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="pays">{t.paysLabel} <em className="req">*</em></label>
                        <select id="pays" className="form-control" required value={form.pays} onChange={(e) => set("pays", e.target.value)}>
                          <option value="" disabled>{t.paysPh}</option>
                          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <small className="field-hint">{t.paysPh}</small>
                      </div>
                    </div>
                  </section>
                  <div className="btn-group">
                    <button type="button" className="btn btn-outline" onClick={() => goToStep(2)}>{t.btnBack}</button>
                    <button type="button" className="btn btn-primary" onClick={domNext}>{t.btnContinue}</button>
                  </div>
                </div>

                {/* ------------------------------------------------------------------
                    ÉTAPE 4 : FORMULE (Groupe 4)
                    ------------------------------------------------------------------ */}
                <div className={"tunnel-step-content" + (step === "form" ? " active" : "")} data-step="4">
                  <section className="form-section">
                    <h2 className="form-section-title"><span className="form-section-num">4</span> {t.s4Title}</h2>
                    <div className="form-group">
                      <label>{t.gammeLabel} <em className="req">*</em></label>
                      <div className="gamme-grid">
                        <div className={"selectable-card gamme-card" + (form.gamme === "nationale" ? " selected" : "")} id="gamme-nationale" onClick={() => setForm((f) => ({ ...f, gamme: "nationale", pack: "" }))}>
                          <span className="card-badge">{t.gammeNationaleBadge}</span>
                          <h4>{t.gammeNationaleTitle}</h4>
                          <p className="card-desc">{t.gammeNationaleDesc}</p>
                        </div>
                        <div className={"selectable-card gamme-card" + (form.gamme === "internationale" ? " selected" : "")} id="gamme-internationale" onClick={() => setForm((f) => ({ ...f, gamme: "internationale", pack: "" }))}>
                          <span className="card-badge">{t.gammeInternationaleBadge}</span>
                          <h4>{t.gammeInternationaleTitle}</h4>
                          <p className="card-desc">{t.gammeInternationaleDesc}</p>
                        </div>
                      </div>
                    </div>
                    <div className="form-group" id="pack-select-group">
                      <label htmlFor="pack">{t.packLabel} <em className="req">*</em></label>
                      <select id="pack" className="form-control" required value={form.pack} onChange={(e) => set("pack", e.target.value)}>
                        <option value="" disabled>{t.packPh}</option>
                        {PACKS[form.gamme as "nationale" | "internationale"].map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      <small className="field-hint">{t.packHint}</small>
                    </div>
                    {form.pack && PACK_DETAILS[form.pack] && (
                      <div className="pack-detail" id="packDetail" style={{ display: "block" }}>
                        <div className="pack-detail-head">
                          <div>
                            <span className="pack-detail-badge">{PACK_DETAILS[form.pack].badge}</span>
                            <h4 id="pdName">{PACK_DETAILS[form.pack].name}</h4>
                            {PACK_DETAILS[form.pack].usd && <p className="pack-detail-usd" id="pdUsd">{PACK_DETAILS[form.pack].usd} / mois</p>}
                          </div>
                          <div className="pack-detail-price" id="pdPrice">{currentPack ? fmtFCFA(currentPack.price) + " / mois" : ""}</div>
                        </div>
                        <ul className="pack-detail-features" id="pdFeatures">
                          {PACK_DETAILS[form.pack].features[locale as keyof typeof PACK_DETAILS[string]["features"]].map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="form-group">
                      <label htmlFor="periodicite">{t.periodiciteLabel} <em className="req">*</em></label>
                      <select id="periodicite" className="form-control" required value={form.periodicite} onChange={(e) => set("periodicite", e.target.value)}>
                        <option value="mensuel">{t.perMonth}</option>
                        <option value="semestriel">{t.perSemestre}</option>
                        <option value="annuel">{t.perAnnee}</option>
                      </select>
                      <small className="field-hint">{t.perMonth}</small>
                    </div>
                    <div className="form-group">
                      <label>{t.optionsLabel} <small className="field-hint-inline">{t.optionsHint}</small></label>
                      <div className="options-list">
                        {EXTRA_OPTIONS.map((k) => (
                          <label className="checkbox-line" key={k}>
                            <input type="checkbox" checked={form.options.includes(t[k])} onChange={(e) => set("options", e.target.checked ? [...form.options, t[k]] : form.options.filter((o) => o !== t[k]))} />
                            {t[k]}
                          </label>
                        ))}
                      </div>
                      <small className="field-hint">{t.optionsHint2}</small>
                    </div>
                  </section>
                  <div className="btn-group">
                    <button type="button" className="btn btn-outline" onClick={() => goToStep(3)}>{t.btnBack}</button>
                    <button type="button" className="btn btn-primary" onClick={domNext}>{t.btnContinue}</button>
                  </div>
                </div>

                {/* ------------------------------------------------------------------
                    ÉTAPE 5 : DOCUMENTS KYC + VALIDATION (Groupe 5)
                    ------------------------------------------------------------------ */}
                <div className={"tunnel-step-content" + (step === "form" ? " active" : "")} data-step="5">
                  <section className="form-section">
                    <h2 className="form-section-title"><span className="form-section-num">5</span> {t.s5Title}</h2>
                    <p className="section-intro">{t.s5Intro}</p>
                    {kycDone ? (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(16,185,129,.08)", border: "1px solid #10b981", borderRadius: 12, padding: "18px 20px" }}>
                        <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#10b981" strokeWidth="2.5" style={{ flex: "0 0 26px" }}>
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <div>
                          <strong style={{ color: "var(--color-heading)" }}>{t.kycAlreadyTitle}</strong>
                          <div style={{ fontSize: "0.86rem", color: "var(--color-text-muted)", marginTop: 4 }}>{t.kycAlreadyText} {kycDone} {t.kycAlreadyEnd}</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Dropzone id="identite" title={t.dzIdentite} hint={t.dzDrop} accept=".pdf,.jpg,.jpeg,.png" required />
                        <Dropzone id="statuts" title={t.dzStatuts} hint={t.dzDropPdf} accept=".pdf" required />
                        <Dropzone id="domicile" title={t.dzDomicile} hint={t.dzDomicileFormats} accept=".pdf,.jpg,.jpeg,.png" />
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "20px 0", display: "flex", alignItems: "center", gap: 8 }}>
                          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>{" "}
                          {t.kycNote}
                        </p>
                      </>
                    )}
                  </section>
                  <section className="form-section">
                    <h2 className="form-section-title"><span className="form-section-num">5</span> {t.s6Title}</h2>
                    <div className="form-group validation-group">
                      <label className="checkbox-line validation-line">
                        <input type="checkbox" id="chk-cgv" required checked={form.chkCgv} onChange={(e) => set("chkCgv", e.target.checked)} />{" "}
                        <span dangerouslySetInnerHTML={{ __html: t.chkCgv }} />
                      </label>
                      <label className="checkbox-line validation-line">
                        <input type="checkbox" id="chk-cadre" required checked={form.chkCadre} onChange={(e) => set("chkCadre", e.target.checked)} />{" "}
                        <span dangerouslySetInnerHTML={{ __html: t.chkCadre }} />
                      </label>
                      <label className="checkbox-line validation-line">
                        <input type="checkbox" id="chk-exactitude" required checked={form.chkExactitude} onChange={(e) => set("chkExactitude", e.target.checked)} />{" "}
                        <span dangerouslySetInnerHTML={{ __html: t.chkExactitude }} />
                      </label>
                    </div>
                    {errors.length > 0 && (
                      <div id="form-errors" className="form-errors" style={{ display: "block" }}>
                        <strong>{t.errTitle}</strong>
                        <ul>{errors.map((m, i) => <li key={i}>{m}</li>)}</ul>
                      </div>
                    )}
                    <button type="button" className="btn btn-outline" style={{ width: "100%", marginBottom: 14 }} onClick={() => goToStep(4)}>{t.btnBackFull}</button>
                    <button type="submit" className="btn btn-primary btn-block btn-validate">{t.btnValidate}</button>
                  </section>
                </div>

                {/* ------------------------------------------------------------------
                    ÉTAPE 6 : FACTURATION (PROFORMA) (Groupe 6)
                    ------------------------------------------------------------------ */}
                <div className={"tunnel-step-content" + (step === "form" ? " active" : "")} data-step="6">
                  <section className="form-section">
                    <h2 className="form-section-title"><span className="form-section-num">6</span> {t.s7Title}</h2>
                    <p className="section-intro">{t.s7Intro}</p>
                    <div id="invoiceBox" className="invoice-box" style={{ background: "var(--color-bg-main)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 28, marginBottom: 24, color: "var(--color-heading, #15294D)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderBottom: "2px solid var(--color-primary)", paddingBottom: 16, marginBottom: 20 }}>
                        <div>
                          <strong style={{ fontSize: "1.15rem", color: "var(--color-heading)" }}>FEDPAWA CORPORATE SOLUTIONS SARL</strong>
                          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                            NIU : M09261890362B<br />
                            RCCM : CM-DLA-01-2026-B13-00767<br />
                            Siège Social : Douala - Logpom (Immeuble Pharmacie de Logpom), Cameroun<br />
                            +237 691 70 48 02 · contact@fedpawa.com
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{t.invoiceLabel}</div>
                          <div style={{ fontSize: "0.85rem" }}>{t.invoiceNum} {invoice?.num ?? "—"}</div>
                          <div style={{ fontSize: "0.85rem" }}>{t.invoiceDate} {invoice?.dateStr ?? "—"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20, fontSize: "0.9rem" }}>
                        <div>
                          <strong>{t.invoiceBilledTo}</strong><br />
                          {form.nomComplet || "Client"}<br />
                          {form.email}<br />
                          {form.telephone}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <strong>{t.invoiceService}</strong><br />
                          {t.invoiceDomiciliation} — {packLabel}<br />
                          {t.invoicePeriod} {periodLabel}
                        </div>
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginBottom: 8 }}>
                        <thead>
                          <tr style={{ background: "var(--color-bg-alt)" }}>
                            <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--color-border)" }}>{t.invoiceDesignation}</th>
                            <th style={{ textAlign: "right", padding: 10, borderBottom: "1px solid var(--color-border)" }}>{t.invoiceAmount}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: 10, borderBottom: "1px solid var(--color-border)" }}>{packLabel} — {t.invoiceDomiciliation} ({periodLabel})</td>
                            <td style={{ textAlign: "right", padding: 10, borderBottom: "1px solid var(--color-border)" }}>{fmtFCFA(total)}</td>
                          </tr>
                          <tr style={{ background: "var(--color-bg-alt)", fontWeight: 700 }}>
                            <td style={{ padding: "12px 10px" }}>{t.invoiceTotal}</td>
                            <td style={{ textAlign: "right", padding: "12px 10px" }}>{fmtFCFA(total)}</td>
                          </tr>
                        </tbody>
                      </table>
                      <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: 10 }}>{t.invoiceFooter} {total.toLocaleString("fr-FR")} {t.invoiceFooterEnd}</p>
                    </div>
                    <button type="button" className="btn btn-outline" style={{ width: "100%", marginBottom: 14 }} onClick={() => goToStep(5)}>{t.btnBack}</button>
                    <button type="button" id="invoicePayBtn" className="btn btn-primary btn-block" onClick={handleSendPaymentLink}>{t.btnPay} ({total.toLocaleString("fr-FR")} FCFA)</button>
                  </section>
                </div>

                {/* ========================================================================
                    ÉTAPE EMAIL : COLLECTE DE L'ADRESSE DÉDIÉE (Groupe 8)
                    ======================================================================== */}
                {step === "email" && (
                  <div className="tunnel-step-content active" data-step="email">
                    <section className="form-section">
                      <h2 className="form-section-title">
                        <span className="form-section-num">3</span> Collecte de l'adresse e-mail
                      </h2>
                      <p className="section-intro">
                        Saisissez l'adresse e-mail dédiée qui servira pour le paiement,
                        la signature et la réception des preuves. Cette adresse doit être
                        privée, personnelle ou professionnelle (évitez les boîtes partagées
                        ou jetables).
                      </p>
                      <form onSubmit={handleCollectEmail} noValidate className="space-y-4">
                        <div className="form-group">
                          <label htmlFor="email-dedie">
                            Adresse e-mail dédiée <em className="req">*</em>
                          </label>
                          <input
                            type="email"
                            id="email-dedie"
                            className="form-control"
                            required
                            placeholder="vous@votre-entreprise.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            autoComplete="email"
                          />
                          <small className="field-hint">
                            Cette adresse recevra le lien de paiement, le lien de signature
                            et les documents clés.
                          </small>
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => domPrev()}
                            className="btn btn-outline"
                          >
                            ← Retour
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !emailInput.trim()}
                            className="btn btn-primary"
                          >
                            {loading ? "Envoi…" : "Envoyer le lien de signature"}
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </form>
            )}

            {/* ========================================================================
                SIDEBAR RÉCAPITULATIVE (Groupe 6)
                ======================================================================== */}
            {!showSuccess && (
              <aside className="order-summary">
                <div className="summary-header"><h3>{t.sumTitle}</h3></div>
                <div id="summaryItems">
                  <div className="summary-item"><span className="sum-label">{t.sumPack}</span><span className="sum-value">{currentPack?.label ?? "—"}</span></div>
                  <div className="summary-item"><span className="sum-label">{t.sumPeriodicite}</span><span className="sum-value">{(t as unknown as Record<string, string>)[PERIODICITES[form.periodicite].key] ?? "—"}</span></div>
                  <div className="summary-item"><span className="sum-label">{t.sumMonthly}</span><span className="sum-value">{currentPack ? fmtFCFA(currentPack.price) : "—"}</span></div>
                </div>
                <div className="summary-divider" />
                <div id="summaryOptions">{form.options.map((o) => <div className="summary-item" key={o}><span className="sum-label">{t.sumOption}</span><span className="sum-value">{o}</span></div>)}</div>
                <div className="summary-total"><span id="sum-total-label">{months === 1 ? t.sumTotalMonth : `${t.sumTotalMonths}${months}${t.sumTotalMonthsEnd}`}</span><span id="summaryTotal">{fmtFCFA(total)}</span></div>
                <div className="summary-secure-badge"><svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>{" "} {t.sumBadge}</div>
              </aside>
            )}
          </div>
        </div>

        {/* ========================================================================
            MODALE DE REPRISE DE BROUILLON (Groupe 7)
            ======================================================================== */}
        {showResumeModal && (
          <div id="draft-resume-overlay" style={{ position: "fixed", inset: 0, background: "rgba(8,12,24,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div id="draft-resume-modal" role="dialog" aria-modal="true" aria-label={t.draftTitle} style={{ background: "var(--color-bg-main)", borderRadius: 14, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--color-border)" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>{t.draftTitle}</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 18 }}>{t.draftText}</p>
              <div style={{ display: "grid", gap: 10 }}>
                <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={resumeDraft}>{t.draftContinue}</button>
                <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={restartDraft}>{t.draftRestart}</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================
            MODALE SMART-DÉTECTION (Groupe 7)
            ======================================================================== */}
        {smartModal !== "closed" && (
          <div id="smart-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(8,12,24,0.55)", backdropFilter: "blur(2px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div id="smart-modal" role="dialog" aria-modal="true" style={{ background: "var(--color-bg-main)", borderRadius: 14, maxWidth: 520, width: "100%", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--color-border)" }}>
              <h3 style={{ marginBottom: 10 }}>{t.smartTitle}</h3>
              <p style={{ fontSize: "0.92rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 22 }}>{smartModal === "open" ? t.smartText : t.smartNoText}</p>
              <div style={{ display: "grid", gap: 10 }}>
                <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => (window.location.href = routes.creationEntreprise)}>{t.smartYes}</button>
                {smartModal === "open" ? (
                  <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={() => setSmartModal("blocked")}>{t.smartNo}</button>
                ) : (
                  <button type="button" className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={() => (window.location.href = routes.creationEntreprise)}>{t.smartUnderstood}</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================
            MODALE DE SIGNATURE (OTP + OpenSign) (Groupe 7)
            ======================================================================== */}
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

              {/* Contrat final (pré-rempli) */}
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

        {/* ========================================================================
            ÉCRAN DE SUCCÈS (Groupe 9)
            ======================================================================== */}
        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✓</span></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Souscription finalisée</h2>
            <p className="text-gray-600 mb-6">Votre contrat est signé et votre paiement est confirmé. Votre service de domiciliation est activé.</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 inline-block">
              <p className="text-sm text-gray-700">Forfait : <strong>{packLabel}</strong><br />
                Montant : <strong>{fmtFCFA(total)} FCFA</strong><br />
                {hashSha256 && (<> <br /> Empreinte SHA-256 : <code className="text-xs break-all">{hashSha256}</code> </>)}
              </p>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Link href={routes.espaceClient} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Accéder à mon espace client</Link>
              <button onClick={() => { setStep("form"); setForm(INITIAL); setFiles({}); setDraftId(null); setFlowToken(null); setHashSha256(null); setPrix(0); setOtpSent(false); setOtp(""); setSuccess(null); setError(null); }} className="text-gray-600 hover:underline text-sm">Nouvelle souscription</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// Composant interne DROPZONE (Groupe 5)
// ============================================================================

function Dropzone({ id, title, hint, accept, required }: { id: "identite" | "statuts" | "domicile"; title: string; hint: string; accept: string; required?: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [dzOver, setDzOver] = useState<string | null>(null);
  return (
    <div className={"dropzone" + (required ? " required" : "") + (file ? " has-file" : "") + (dzOver === id ? " drag-over" : "")} onClick={() => document.getElementById("dz-file-" + id)?.click()} onDragOver={(e) => { e.preventDefault(); setDzOver(id); }} onDragLeave={() => setDzOver(null)} onDrop={(e) => { e.preventDefault(); setDzOver(null); if (e.dataTransfer.files.length) { const f = e.dataTransfer.files[0]; if (f.size > 10 * 1024 * 1024) { return; } setFile(f); } }} style={{ cursor: "pointer" }}>
      <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      <h5>{title} {required && <em className="req">*</em>}</h5>
      <p>{hint}</p>
      <span className="dz-filename">{file ? `📄 ${file.name} (${Math.round(file.size / 1024)} Ko)` : ""}</span>
      <input id={"dz-file-" + id} type="file" hidden accept={accept} onChange={(e) => { if (e.target.files?.length) { const f = e.target.files[0]; if (f.size > 10 * 1024 * 1024) return; setFile(f); } }} />
    </div>
  );
}

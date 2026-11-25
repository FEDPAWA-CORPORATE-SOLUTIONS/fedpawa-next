// ==========================================================
// FEDPAWA — EmailVerificationProvider (CONTRAT-VERIF, worker A)
// Source de vérité du statut email_verified côté client :
// monté dans les DEUX layouts racines (fr + en), au-dessus de
// PwaProvider. Interroge GET /api/v1/auth/me (champ email_verified
// du contrat) :
// - au montage ;
// - au retour de focus de l'onglet (vérification faite ailleurs) ;
// - à la demande (refresh(), ex. bouton « J'ai vérifié mon e-mail »).
// Expose aussi resend() (POST /auth/resend-verification, 429 géré)
// et requestGate() : une réponse 403 email_non_verifie interceptée
// n'importe où rouvre la modal bloquante des pages de souscription.
// ==========================================================

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import {
  resendVerification,
  statusFromMe,
  type VerificationStatus,
} from "@/lib/verification";

export interface Feedback {
  type: "success" | "error" | "info";
  text: string;
  /** 429 deja_envoye : délai restant en secondes. */
  retryAfter?: number;
}

export interface EmailVerificationContextValue {
  status: VerificationStatus;
  authenticated: boolean;
  /** true si non vérifié (bannière + modal). */
  unverified: boolean;
  /** Modal forcée par une interception 403 email_non_verifie. */
  gateOpen: boolean;
  requestGate: () => void;
  /** Re-appelle /auth/me ; renvoie le statut obtenu. */
  refresh: () => Promise<VerificationStatus>;
  refreshing: boolean;
  resend: () => Promise<Feedback>;
  resending: boolean;
  /** Feedback unique : resend ou verify. Un seul message à la fois. */
  feedback: Feedback | null;
  clearFeedback: () => void;
}

const EmailVerificationContext = createContext<EmailVerificationContextValue>({
  status: "loading",
  authenticated: false,
  unverified: false,
  gateOpen: false,
  requestGate: () => {},
  refresh: async () => "loading",
  refreshing: false,
  resend: async () => ({ type: "error", text: "" }),
  resending: false,
  feedback: null,
  clearFeedback: () => {},
});

export function useEmailVerification(): EmailVerificationContextValue {
  return useContext(EmailVerificationContext);
}

export default function EmailVerificationProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [authenticated, setAuthenticated] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async (): Promise<VerificationStatus> => {
    setRefreshing(true);
    try {
      const me = await fetchMe();
      const next = statusFromMe(me);
      if (mounted.current) {
        setAuthenticated(me.authenticated);
        setStatus(next);
        // Statut confirmé vérifié → la modal forcée (403) se ferme.
        if (next === "verified") setGateOpen(false);
        // Feedback utilisateur après vérification manuelle (bouton « J'ai vérifié mon e-mail »).
        if (next === "verified") {
          setFeedback({
            type: "success",
            text: "E-mail vérifié avec succès. La modal va se fermer.",
          });
        } else if (next === "unverified") {
          setFeedback({
            type: "error",
            text:
              "L'adresse e-mail n'est toujours pas vérifiée. Consultez votre boîte de réception et cliquez sur le lien de confirmation.",
          });
        }
      }
      return next;
    } catch {
      // API injoignable : on garde l'état courant (dégradation gracieuse).
      if (mounted.current) {
        setFeedback({
          type: "error",
          text: "Impossible de contacter le serveur pour vérifier votre e-mail. Réessayez plus tard.",
        });
      }
      return status;
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [status]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    // Vérification faite dans un autre onglet : re-lire /me au focus.
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      mounted.current = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const requestGate = useCallback(() => setGateOpen(true), []);

  const resend = useCallback(async (): Promise<Feedback> => {
    setResending(true);
    setFeedback(null); // Efface tout feedback précédent
    try {
      await resendVerification();
      const fb: Feedback = {
        type: "success",
        text: "ok",
      };
      setFeedback(fb);
      return fb;
    } catch (err) {
      let fb: Feedback;
      if (err instanceof ApiError && err.status === 429) {
        const b = err.body as { code?: string; retry_after?: number } | null;
        fb = {
          type: "info",
          text: "wait",
          retryAfter: typeof b?.retry_after === "number" ? b.retry_after : undefined,
        };
      } else if (err instanceof ApiError && err.status === 401) {
        fb = { type: "error", text: "needLogin" };
      } else {
        fb = { type: "error", text: "ko" };
      }
      setFeedback(fb);
      return fb;
    } finally {
      if (mounted.current) setResending(false);
    }
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const value: EmailVerificationContextValue = {
    status,
    authenticated,
    unverified: status === "unverified",
    gateOpen,
    requestGate,
    refresh,
    refreshing,
    resend,
    resending,
    feedback,
    clearFeedback,
  };

  return (
    <EmailVerificationContext.Provider value={value}>
      {children}
    </EmailVerificationContext.Provider>
  );
}

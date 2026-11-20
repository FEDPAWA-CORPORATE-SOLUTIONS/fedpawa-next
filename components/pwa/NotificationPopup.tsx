"use client";

// ============================================================
// FEDPAWA — Pop-up d'abonnement aux notifications push (arrivée visiteur)
// Thème : bleu nuit (#15294D) + boutons dorés (#D4AF37), FR/EN.
// Apparaît une fois à l'arrivée, sauf si déjà abonné ou refus persistant.
// S'appuie sur lib/push.ts (enablePushSubscription, getPushSubscription)
// et sur PUSH_DISMISSED_KEY de PwaProvider.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getPageDictionary } from "@/lib/i18n";
import {
  enablePushSubscription,
  getPushSubscription,
} from "@/lib/push";
import { PUSH_DISMISSED_KEY } from "@/components/pwa/PwaProvider";

/** Flag : le visiteur a déjà vu/interagi avec le pop-up (pas de re-affichage). */
const POPUP_SEEN_KEY = "fedpawa-notif-popup-seen";

interface NotificationPopupProps {
  locale: Locale;
}

/**
 * Détecte le thème actuel (data-mode sur <html>, géré par Header.tsx via
 * localStorage "fedpawa-mode"). Retourne "dark" ou "light".
 */
function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const mode = document.documentElement.getAttribute("data-mode");
  return mode === "light" ? "light" : "dark";
}

export default function NotificationPopup({
  locale,
}: NotificationPopupProps) {
  const t = getPageDictionary(locale, "notification_popup");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const modalRef = useRef<HTMLDivElement>(null);

  const shouldShow = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    // Déjà abonné push : pas de pop-up.
    const dismissed =
      window.localStorage.getItem(PUSH_DISMISSED_KEY) === "1";
    const seen = window.localStorage.getItem(POPUP_SEEN_KEY) === "1";
    if (dismissed || seen) return false;
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") return false;
    return true;
  }, []);

  // Détection abonnement existant + affichage au montage.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!shouldShow()) return;
      try {
        const sub = await getPushSubscription();
        if (mounted && !sub) {
          // Une souscription existe déjà côté navigateur : pas de pop-up.
          window.localStorage.setItem(POPUP_SEEN_KEY, "1");
          return;
        }
        if (mounted) setOpen(true);
      } catch {
        if (mounted) setOpen(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [shouldShow]);

  // Détecter le thème initial et les changements (data-mode sur <html>).
  useEffect(() => {
    setTheme(getTheme());
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });
    return () => observer.disconnect();
  }, []);

  const handleActivate = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const result = await enablePushSubscription();
      if (result.ok) {
        window.localStorage.setItem(POPUP_SEEN_KEY, "1");
        setOpen(false);
      } else if (result.reason === "denied") {
        window.localStorage.setItem(PUSH_DISMISSED_KEY, "1");
        window.localStorage.setItem(POPUP_SEEN_KEY, "1");
        setError(t.popupDenied);
        setOpen(false);
      } else {
        setError(t.popupError);
      }
    } catch {
      setError(t.popupError);
    } finally {
      setBusy(false);
    }
  }, [t.popupDenied, t.popupError]);

  const handleLater = useCallback(() => {
    window.localStorage.setItem(PUSH_DISMISSED_KEY, "1");
    window.localStorage.setItem(POPUP_SEEN_KEY, "1");
    setOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    window.localStorage.setItem(POPUP_SEEN_KEY, "1");
    setOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose]
  );

  // Classes conditionnelles selon le thème (clair / sombre).
  // Thème sombre : bleu nuit #15294D + doré #D4AF37 (défaut).
  // Thème clair : fond blanc + texte sombre, boutons dorés conservés.
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-[#15294D]" : "bg-[#FFFFFF]";
  const cardText = isDark ? "text-[#FFFFFF]" : "text-[#15294D]";
  const cardTextSecondary = isDark ? "text-[#CBD5E1]" : "text-[#4A5568]";
  const cardBorder = isDark ? "border-[#D4AF37]/40" : "border-[#D4AF37]/60";
  const backdropBg = isDark ? "bg-black/60" : "bg-black/40";
  const closeText = isDark ? "text-[#CBD5E1] hover:text-[#FFFFFF]" : "text-[#4A5568] hover:text-[#15294D]";
  const activateBtn = isDark
    ? "text-[#0F172A] bg-[#D4AF37] hover:bg-[#E2C48A]"
    : "text-[#15294D] bg-[#D4AF37] hover:bg-[#E2C48A]";
  const laterBtn = isDark
    ? "text-[#D4AF37] border-[#D4AF37]/30 bg-transparent hover:bg-[#D4AF37]/10"
    : "text-[#D4AF37] border-[#D4AF37]/50 bg-transparent hover:bg-[#D4AF37]/15";
  const iconColor = isDark ? "text-[#D4AF37]" : "text-[#D4AF37]";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="np-title"
      onClick={(e) => {
        // Fermer si clic sur le fond (pas sur la carte)
        if ((e.target as HTMLElement).classList.contains("np-backdrop")) {
          handleClose();
        }
      }}
    >
      <div className={`np-backdrop fixed inset-0 ${backdropBg} backdrop-blur-sm`} />
      <div
        ref={modalRef}
        className={`np-card w-full max-w-xs rounded-2xl border border-solid ${cardBorder} ${cardBg} ${cardText} shadow-2xl p-6 m-4`}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start gap-3">
          <div className="np-icon mt-0.5">
            <svg
              className={`w-6 h-6 ${iconColor}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <h2 id="np-title" className={`text-lg font-bold ${cardText}`}>
              {t.popupTitle}
            </h2>
            <p className={`mt-1 text-sm ${cardTextSecondary} leading-relaxed`}>
              {t.popupBody}
            </p>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-xs text-[#FCA5A5]">{error}</p>
        )}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={handleActivate}
            className={`w-full sm:w-1/2 flex-1 px-4 py-3 rounded-xl font-bold ${activateBtn} focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-60 transition`}
          >
            {busy ? "…" : t.popupActivate}
          </button>
          <button
            type="button"
            onClick={handleLater}
            className={`w-full sm:w-1/2 flex-1 px-4 py-3 rounded-xl font-bold ${laterBtn} focus:outline-none focus:ring-2 focus-ring focus:ring-[#D4AF37] transition`}
          >
            {t.popupLater}
          </button>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full ${closeText} focus:outline-none`}
          aria-label={t.popupClose}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

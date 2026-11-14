// ==========================================================
// FEDPAWA — Cloche « Notifications » de la navbar (desktop).
// Bouton rond outlined (même traitement que .nav-profile-btn /
// .notif-bell-btn) avec badge non-lues ; le clic REDIRIGE vers
// la page /notifications (événements notifiés) au lieu d'un
// dropdown. Badge = meta.unread_count de GET /notifications,
// polling 60 s onglet visible.
// ==========================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiAuthGet } from "@/lib/auth";
import { routesFor } from "@/lib/routes";
import { getPageDictionary } from "@/lib/i18n";

type Locale = "fr" | "en";

const POLL_MS = 60_000;

interface UnreadMeta {
  meta?: { unread_count?: number };
}

export default function NotificationsBellLink({ locale = "fr" }: { locale?: Locale }) {
  const t = getPageDictionary(locale, "notifications");
  const routes = routesFor(locale);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      apiAuthGet<UnreadMeta>("/api/v1/notifications?unread=1")
        .then((res) => setUnread(res.meta?.unread_count ?? 0))
        .catch(() => {
          /* best-effort */
        });
    };
    const start = () => {
      if (!timer) {
        tick();
        timer = setInterval(tick, POLL_MS);
      }
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    function onVisibility() {
      if (document.visibilityState === "visible") start();
      else stop();
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      className="notif-bell-btn"
      style={{ color: "white" }}
      aria-label={t.navLabel}
      title={t.navLabel}
      onClick={() => router.push(routes.notifications)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="notif-badge" aria-hidden="true">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

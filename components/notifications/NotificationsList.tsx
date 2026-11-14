// ==========================================================
// FEDPAWA — Page « Notifications » (espace client).
// Historique des événements notifiés : table backend
// notification_events, alimentée par PushService::notify()
// à CHAQUE événement important (le même qui déclenche l'e-mail)
// + push PWA selon les préférences. GET /api/v1/notifications
// paginé (20/page), POST /notifications/read pour le marquage.
// ==========================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiAuthGet } from "@/lib/auth";
import { markNotificationsRead, timeAgo } from "@/lib/notifications";
import { routesFor } from "@/lib/routes";
import { getPageDictionary } from "@/lib/i18n";

type Locale = "fr" | "en";

/** Événement servi par GET /api/v1/notifications (contrat PushController). */
interface NotificationEvent {
  id: number;
  type: string;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationsPage {
  data: NotificationEvent[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    unread_count: number;
  };
}

/** Icône SVG inline par type (stroke 2, fill none — même style que le Header). */
function TypeIcon({ type }: { type: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    "aria-hidden": true as const,
  };
  switch (type) {
    case "courrier":
    case "courrier_recu":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22 6 12 13 2 6" />
        </svg>
      );
    case "facture":
    case "facture_emise":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 18v-6M9 15h6" />
        </svg>
      );
    case "kyc":
    case "dossier_statut":
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "abonnement":
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "ticket":
    case "ticket_reponse":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "compte_securite":
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4M12 15v3" />
        </svg>
      );
    case "contrat_signe":
    case "contrat_scelle":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
  }
}

export default function NotificationsList({ locale = "fr" }: { locale?: Locale }) {
  const t = getPageDictionary(locale, "notifications");
  const routes = routesFor(locale);
  const router = useRouter();

  const [items, setItems] = useState<NotificationEvent[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState<boolean | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Chargement d'une page (append si page > 1).
  const load = useCallback(
    async (p: number, append: boolean) => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ page: String(p) });
        if (unreadOnly) q.set("unread", "1");
        const res = await apiAuthGet<NotificationsPage>(`/api/v1/notifications?${q}`);
        setConnected(true);
        setLastPage(res.meta?.last_page ?? 1);
        setUnreadCount(res.meta?.unread_count ?? 0);
        setItems((prev) => {
          const next = res.data ?? [];
          return append ? [...prev, ...next] : next;
        });
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    },
    [unreadOnly],
  );

  // Chargement initial + rechargement au changement de filtre.
  useEffect(() => {
    void load(1, false);
    setPage(1);
  }, [load]);

  const presentTypes = Array.from(new Set(items.map((i) => i.type)));

  const markAll = async () => {
    try {
      await markNotificationsRead({ all: true });
      await load(1, false);
    } catch {
      /* best-effort */
    }
  };

  /** Clic item : marquer lu + naviguer si l'événement a une cible. */
  const onItemClick = async (item: NotificationEvent) => {
    if (!item.read_at) {
      markNotificationsRead({ ids: [item.id] }).catch(() => {});
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, read_at: new Date().toISOString() }
            : i,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (item.url) router.push(item.url);
  };

  const typeLabel = (type: string): string => {
    const key = `type${type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")}`;
    return (t[key] as string) || type;
  };

  // Non connecté : porte d'entrée (le backend exige Sanctum).
  if (connected === false) {
    return (
      <section className="page-hero">
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", margin: "0 0 16px" }}>
            {t.title}
          </h1>
          <p style={{ margin: "0 0 28px", color: "var(--color-text-muted)" }}>
            {t.loginRequired}
          </p>
          <Link className="btn btn-primary" href={routes.auth}>
            {t.loginCta}
          </Link>
        </div>
      </section>
    );
  }

  const filtered =
    typeFilter === null ? items : items.filter((i) => i.type === typeFilter);

  return (
    <section className="notif-page" ref={rootRef}>
      <div className="container">
        <div className="page-hero" style={{ paddingBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)", margin: 0 }}>
            {t.title}
            {unreadCount > 0 && (
              <span className="notif-page-unread-pill">{unreadCount}</span>
            )}
          </h1>
          <p
            className="notif-page-subtitle"
            style={{ maxWidth: 760, margin: "12px auto 0", color: "var(--color-text-muted)", lineHeight: 1.7 }}
          >
            {t.subtitle}
          </p>
        </div>

        <div className="notif-page-toolbar">
          <button
            type="button"
            className={`notif-page-chip${unreadOnly ? " active" : ""}`}
            aria-pressed={unreadOnly}
            onClick={() => setUnreadOnly((v) => !v)}
          >
            {t.unreadOnly}
          </button>
          {presentTypes.map((type) => (
            <button
              type="button"
              key={type}
              className={`notif-page-chip${typeFilter === type ? " active" : ""}`}
              aria-pressed={typeFilter === type}
              onClick={() => setTypeFilter(typeFilter === type ? null : type)}
            >
              {typeLabel(type)}
            </button>
          ))}
          <button type="button" className="notif-page-markall" onClick={markAll} disabled={unreadCount === 0}>
            {t.markAllRead}
          </button>
        </div>

        <div className="notif-page-list">
          {filtered.length === 0 && !loading && (
            <p className="notif-page-empty">{typeFilter || unreadOnly ? t.emptyFiltered : t.empty}</p>
          )}
          {filtered.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`notif-page-item${item.read_at ? "" : " unread"}`}
              onClick={() => void onItemClick(item)}
            >
              <span className="notif-page-item-icon" aria-hidden="true">
                <TypeIcon type={item.type} />
              </span>
              <span className="notif-page-item-copy">
                <span className="notif-page-item-head">
                  <span className="notif-page-item-type">{typeLabel(item.type)}</span>
                  {!item.read_at && (
                    <span className="notif-page-item-badge">{t.unreadBadge}</span>
                  )}
                </span>
                <strong>{item.title}</strong>
                <span className="notif-page-item-body">{item.body}</span>
                <small>{timeAgo(item.created_at, locale)}</small>
              </span>
            </button>
          ))}
          {loading && <p className="notif-page-empty">{t.loading}</p>}
        </div>

        {page < lastPage && (
          <div className="notif-page-more">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const next = page + 1;
                setPage(next);
                void load(next, true);
              }}
            >
              {t.loadMore}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

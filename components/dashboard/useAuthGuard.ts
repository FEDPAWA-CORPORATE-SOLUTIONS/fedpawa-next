// ==========================================================
// FEDPAWA — garde d'accès vague D (parité auth-guard.js source)
// data-auth="client" : clients uniquement (admin → dashboard admin,
// anonyme → authentification) ; data-auth="admin" : admins uniquement
// (client → espace client, anonyme → authentification).
// Rôle depuis GET /api/v1/auth/me (toujours 200, jamais throw réseau
// pour la garde : dégradation gracieuse = page visible, cohérent
// avec le site statique source).
// ==========================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, getToken, type UserRole } from "@/lib/auth";
import { routesFor } from "@/lib/routes";
import type { Locale } from "@/lib/i18n";

export type GuardStatus = "checking" | "denied" | "allowed";

export interface GuardResult {
  status: GuardStatus;
  role: UserRole | null;
  name: string | null;
}

/**
 * Vérifie le rôle via /api/v1/auth/me et redirige si nécessaire.
 * Retourne "checking" tant que la vérification est en cours.
 * Si l'API est injoignable : page visible (dégradation gracieuse).
 */
export function useAuthGuard(
  required: "client" | "admin",
  locale: Locale = "fr",
): GuardResult {
  const router = useRouter();
  const routes = routesFor(locale);
  const [result, setResult] = useState<GuardResult>({
    status: "checking",
    role: null,
    name: null,
  });

  useEffect(() => {
    let cancelled = false;

    const apply = (role: UserRole | null) => {
      if (cancelled) return;
      if (required === "client") {
        if (!role) {
          setResult({ status: "denied", role: null, name: null });
          router.replace(routes.auth);
          return;
        }
        if (role === "admin") {
          setResult({ status: "denied", role, name: null });
          router.replace(routes.adminDashboard);
          return;
        }
      } else if (required === "admin") {
        if (!role) {
          setResult({ status: "denied", role: null, name: null });
          router.replace(routes.auth);
          return;
        }
        if (role !== "admin") {
          setResult({ status: "denied", role, name: null });
          router.replace(routes.espaceClient);
          return;
        }
      }
      setResult({ status: "allowed", role, name: null });
    };

    // Aucun token + garde admin/client : redirection immédiate sans
    // attendre le réseau (le /me serait anonyme de toute façon).
    if (!getToken()) {
      apply(null);
      return;
    }

    fetchMe()
      .then((me) => {
        const role = me.authenticated ? (me.role ?? "client") : null;
        if (!cancelled) apply(role);
      })
      .catch(() => {
        // API injoignable : laisser la page visible (dégradation gracieuse)
        if (!cancelled) setResult({ status: "allowed", role: null, name: null });
      });

    return () => {
      cancelled = true;
    };
  }, [required, locale, router, routes.auth, routes.adminDashboard, routes.espaceClient]);

  return result;
}

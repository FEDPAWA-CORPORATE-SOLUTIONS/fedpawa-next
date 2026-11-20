"use client";

// ============================================================
// FEDPAWA — État global de chargement (loader)
// Suivi des requêtes API par type (GET, POST, PUT, DELETE)
// et des URLs visitées pour déclencher le loader sur nouvelle page.
// Thème : bleu nuit (#15294D) + doré (#D4AF37)
// ============================================================

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface GlobalLoadingContextValue {
  isLoading: boolean;
  startLoading: (method?: string) => void;
  stopLoading: (method?: string) => void;
  withLoader: <T>(fn: () => Promise<T>, method?: string) => Promise<T>;
  markUrlVisited: (url: string) => void;
  isUrlNew: (url: string) => boolean;
}

export const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

/** Nombre total de requêtes en cours. */
let pendingCount = 0;
/** Nombre de requêtes en cours par type HTTP. */
const pendingByType: Record<string, number> = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 };
/** Abonnés aux changements d'état de chargement. */
const subscribers = new Set<(isLoading: boolean) => void>;
/** URLs déjà visitées par l'utilisateur (pour détecter les nouvelles pages). */
const visitedUrls = new Set<string>();

/** Durée minimale d'affichage du loader par type de requête (ms). */
const minDurationByType: Record<string, number> = {
  GET: 300,
  POST: 600,
  PUT: 800,
  DELETE: 600,
  PATCH: 600,
};
/** Durée maximale avant forcer l'arrêt du loader (ms). */
export const maxDuration = 10000;

function notify() {
  subscribers.forEach((cb) => cb(pendingCount > 0));
}

/**
 * Démarre le chargement pour un type de requête donné.
 * @param method Méthode HTTP (GET, POST, PUT, DELETE, PATCH). Défaut: GET.
 */
export function startGlobalLoading(method: string = "GET"): void {
  pendingCount++;
  pendingByType[method] = (pendingByType[method] || 0) + 1;
  notify();
}

/**
 * Arrête le chargement pour un type de requête donné.
 * @param method Méthode HTTP. Défaut: GET.
 */
export function stopGlobalLoading(method: string = "GET"): void {
  if (pendingCount > 0) pendingCount--;
  if (pendingByType[method] && pendingByType[method] > 0) pendingByType[method]--;
  notify();
}

export function isGlobalLoading(): boolean {
  return pendingCount > 0;
}

/**
 * Marque une URL comme déjà visitée.
 */
export function markUrlVisited(url: string): void {
  visitedUrls.add(url);
}

/**
 * Retourne true si l'URL n'a jamais été visitée auparavant.
 */
export function isUrlNew(url: string): boolean {
  return !visitedUrls.has(url);
}

/**
 * Retourne la durée minimale d'affichage pour un type de requête (ms).
 */
export function getMinDuration(method: string = "GET"): number {
  return minDurationByType[method] || 300;
}

// Exposer globalement pour les scripts inline et lib/api.ts
if (typeof window !== "undefined") {
  (window as any).__fedpawaStartLoading = startGlobalLoading;
  (window as any).__fedpawaStopLoading = stopGlobalLoading;
  (window as any).__fedpawaMarkUrlVisited = markUrlVisited;
  (window as any).__fedpawaIsUrlNew = isUrlNew;
  (window as any).__fedpawaGetMinDuration = getMinDuration;
}

/**
 * Wrapper qui affiche le loader global pendant l'exécution d'une promise.
 */
export async function withLoader<T>(fn: () => Promise<T>, method: string = "GET"): Promise<T> {
  startGlobalLoading(method);
  try {
    return await fn();
  } finally {
    stopGlobalLoading(method);
  }
}

export function GlobalLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(pendingCount > 0);

  useEffect(() => {
    const handler = (loading: boolean) => setIsLoading(loading);
    subscribers.add(handler);
    return () => subscribers.delete(handler);
  }, []);

  const startLoading = useCallback((method?: string) => startGlobalLoading(method), []);
  const stopLoading = useCallback((method?: string) => stopGlobalLoading(method), []);

  const value: GlobalLoadingContextValue = {
    isLoading,
    startLoading,
    stopLoading,
    withLoader,
    markUrlVisited,
    isUrlNew,
  };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoader(): GlobalLoadingContextValue {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) {
    throw new Error(
      "useGlobalLoader doit être utilisé à l'intérieur d'un GlobalLoaderProvider",
    );
  }
  return ctx;
}

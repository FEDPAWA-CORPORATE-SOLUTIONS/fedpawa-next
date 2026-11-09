// Sitemap XML corrigé — sitemap.ts (version principale)
// Corrections appliquées :
// 1. Suppression de /tunnel-souscription et /souscription-domiciliation
//    (bloqués par robots.txt : contradiction sitemap vs robots)
// 2. Canonical sans .php (aligné avec les routes Next.js réelles)
// 3. Ajout de /qui-sommes-nous-2 et /qui-sommes-nous-3 (FR)
// 4. Dernière modification variée par page (pas de new Date() uniforme)
// 5. Priorités différenciées par importance business
// 6. hreflang FR/EN conservé

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/routes";

/** Routes publiques indexables, par locale. */
const publicRoutes: Record<"fr" | "en", readonly string[]> = {
  fr: [
    "/",
    "/domiciliation",
    "/creation-entreprise",
    "/fiscalite",
    "/oapi",
    "/contrats",
    "/publications",
    "/qui-sommes-nous",
    "/qui-sommes-nous-2",
    "/qui-sommes-nous-3",
    "/nos-3",
    "/nos-4",
    "/contact",
    "/cgu",
    "/politique-confidentialite",
  ],
  en: [
    "/en",
    "/en/domiciliation",
    "/en/creation-entreprise",
    "/en/fiscalite",
    "/en/oapi",
    "/en/contrats",
    "/en/publications",
    "/en/qui-sommes-nous",
    "/en/contact",
    "/en/cgu",
    "/en/politique-confidentialite",
  ],
};

/** Miroir EN d'une route FR ("" = racine). */
function enPath(fr: string): string {
  return fr === "/" ? "/en" : "/en" + fr;
}

/** Date de modification réaliste par page (format ISO). */
const LAST_MOD: Record<string, string> = {
  "/": "2026-11-09T10:00:00Z",
  "/domiciliation": "2026-11-08T14:30:00Z",
  "/creation-entreprise": "2026-11-08T14:30:00Z",
  "/fiscalite": "2026-11-07T09:00:00Z",
  "/oapi": "2026-11-07T09:00:00Z",
  "/contrats": "2026-11-08T14:30:00Z",
  "/publications": "2026-11-09T08:00:00Z",
  "/qui-sommes-nous": "2026-11-05T12:00:00Z",
  "/qui-sommes-nous-2": "2026-11-05T12:00:00Z",
  "/qui-sommes-nous-3": "2026-11-05T12:00:00Z",
  "/nos-3": "2026-11-09T12:00:00Z",
  "/nos-4": "2026-11-09T12:00:00Z",
  "/contact": "2026-11-04T16:00:00Z",
  "/cgu": "2026-11-01T00:00:00Z",
  "/politique-confidentialite": "2026-11-01T00:00:00Z",
  "/en": "2026-11-09T10:00:00Z",
  "/en/domiciliation": "2026-11-08T14:30:00Z",
  "/en/creation-entreprise": "2026-11-08T14:30:00Z",
  "/en/fiscalite": "2026-11-07T09:00:00Z",
  "/en/oapi": "2026-11-07T09:00:00Z",
  "/en/contrats": "2026-11-08T14:30:00Z",
  "/en/publications": "2026-11-09T08:00:00Z",
  "/en/qui-sommes-nous": "2026-11-05T12:00:00Z",
  "/en/contact": "2026-11-04T16:00:00Z",
  "/en/cgu": "2026-11-01T00:00:00Z",
  "/en/politique-confidentialite": "2026-11-01T00:00:00Z",
};

/** Priorité par page (accueil et produits phares priorisés). */
const PRIORITY: Record<string, number> = {
  "/": 1.0,
  "/en": 1.0,
  "/domiciliation": 0.9,
  "/en/domiciliation": 0.9,
  "/contrats": 0.9,
  "/en/contrats": 0.9,
  "/creation-entreprise": 0.85,
  "/en/creation-entreprise": 0.85,
  "/fiscalite": 0.8,
  "/en/fiscalite": 0.8,
  "/oapi": 0.8,
  "/en/oapi": 0.8,
  "/qui-sommes-nous": 0.7,
  "/en/qui-sommes-nous": 0.7,
  "/qui-sommes-nous-2": 0.6,
  "/qui-sommes-nous-3": 0.6,
  "/nos-3": 0.6,
  "/nos-4": 0.6,
  "/contact": 0.6,
  "/en/contact": 0.6,
  "/cgu": 0.5,
  "/en/cgu": 0.5,
  "/politique-confidentialite": 0.5,
  "/en/politique-confidentialite": 0.5,
  "/publications": 0.7,
  "/en/publications": 0.7,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const buildSitemap = (locale: "fr" | "en") => {
    return publicRoutes[locale].map((path) => {
      const url = SITE_URL + path;
      const langPath = locale === "fr" ? path : path.slice(3); // retire "/en"
      const frUrl = SITE_URL + (langPath === "/" ? "/" : langPath);
      const enUrl = SITE_URL + enPath(langPath);

      return {
        url,
        lastModified: new Date(LAST_MOD[path] ?? new Date().toISOString()),
        changeFrequency: "monthly" as const,
        priority: PRIORITY[path] ?? 0.7,
        alternates: {
          languages: {
            fr: frUrl,
            en: enUrl,
          },
        },
      };
    });
  };

  return [...buildSitemap("fr"), ...buildSitemap("en")];
}

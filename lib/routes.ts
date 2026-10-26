// ==========================================================
// FEDPAWA — routes internes (vague A : squelette partagé)
// Les pages PHP deviennent des routes Next sans extension :
// index.php → "/", domiciliation.php → "/domiciliation", etc.
// FR = racine, EN = miroir sous /en.
// ==========================================================

export interface RouteMap {
  home: string;
  domiciliation: string;
  creationEntreprise: string;
  fiscalite: string;
  oapi: string;
  contrats: string;
  aboutUs: string;
  contact: string;
  cgu: string;
  privacy: string;
  auth: string;
  forgotPassword: string;
  souscription: string;
  tunnel: string;
  espaceClient: string;
  adminDashboard: string;
  adminDocument: string;
}

/** Routes FR (racine). */
export const frRoutes: RouteMap = {
  home: "/",
  domiciliation: "/domiciliation",
  creationEntreprise: "/creation-entreprise",
  fiscalite: "/fiscalite",
  oapi: "/oapi",
  contrats: "/contrats",
  aboutUs: "/qui-sommes-nous",
  contact: "/contact",
  cgu: "/cgu",
  privacy: "/politique-confidentialite",
  auth: "/authentification",
  forgotPassword: "/mot-de-passe-oublie",
  souscription: "/souscription-domiciliation",
  tunnel: "/tunnel-souscription",
  espaceClient: "/espace-client",
  adminDashboard: "/admin-dashboard",
  adminDocument: "/admin-document",
};

/** Routes EN (miroir sous /en). */
export const enRoutes: RouteMap = {
  ...frRoutes,
  home: "/en",
  domiciliation: "/en/domiciliation",
  creationEntreprise: "/en/creation-entreprise",
  fiscalite: "/en/fiscalite",
  oapi: "/en/oapi",
  contrats: "/en/contrats",
  aboutUs: "/en/qui-sommes-nous",
  contact: "/en/contact",
  cgu: "/en/cgu",
  privacy: "/en/politique-confidentialite",
  auth: "/en/authentification",
  forgotPassword: "/en/mot-de-passe-oublie",
  souscription: "/en/souscription-domiciliation",
  tunnel: "/en/tunnel-souscription",
  espaceClient: "/en/espace-client",
  adminDashboard: "/en/admin-dashboard",
  adminDocument: "/en/admin-document",
};

/** Routes pour une locale. */
export function routesFor(locale: "fr" | "en"): RouteMap {
  return locale === "en" ? enRoutes : frRoutes;
}

/** URL absolue de production (canonical/hreflang). */
export const SITE_URL = "https://www.fedpawa.com";

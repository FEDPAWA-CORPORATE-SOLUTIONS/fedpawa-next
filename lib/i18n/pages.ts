// ==========================================================
// FEDPAWA — i18n : registre des dictionnaires par page.
// Chaque vague ajoute son module lib/i18n/pages/<slug>.ts ici.
// FEUILLE : n'importe jamais lib/i18n.ts (anti-cycle).
// ==========================================================

import type { PageSlugs } from "./types";
import { indexFr, indexEn } from "./pages/index";

/** Dictionnaires FR par page — remplis vague par vague. */
export const frPageDicts: PageSlugs = {
  index: indexFr,
};

/** Dictionnaires EN par page — remplis vague par vague. */
export const enPageDicts: PageSlugs = {
  index: indexEn,
};

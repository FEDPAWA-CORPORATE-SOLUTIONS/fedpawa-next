// ==========================================================
// FEDPAWA — Gestion unifiée des erreurs frontend
// Ton voulu (directive K Ray) : explicite, utile, apaisant.
// ==========================================================

import { ApiError } from "./api";

export type PageContext =
  | "auth"
  | "souscription"
  | "espace-client"
  | "dashboard-admin"
  | "default";

/**
 * Messages quand l'erreur vient du CLIENT (action : vérifier ses saisies).
 */
const CLIENT_SIDE_MESSAGES: Record<PageContext, string> = {
  auth: "Certaines informations saisies sont incorrectes. Vérifiez vos données.",
  souscription:
    "Certaines informations saisies sont incorrectes ou incomplètes. Vérifiez les champs signalés, puis réessayez.",
  "espace-client":
    "Votre demande n'a pas pu être traitée. Vérifiez les informations saisies, puis réessayez.",
  "dashboard-admin":
    "Votre demande n'a pas pu être traitée. Vérifiez les informations saisies, puis réessayez.",
  default:
    "Certaines informations saisies sont incorrectes. Vérifiez-les, puis réessayez.",
};

/**
 * Messages quand l'erreur vient de NOUS (5xx)
 */
const SERVER_SIDE_MESSAGE =
  "Une erreur temporaire est survenue sur nos serveurs. Réessayez dans quelques minutes. Si le problème persiste, contactez notre support.";

const MESSAGES: Record<number, string | Record<PageContext, string>> = {
  0: "Votre requête n'a pas pu aboutir. Vérifiez votre connexion internet.",
  400: CLIENT_SIDE_MESSAGES,
  401: {
      auth: "Email ou mot de passe incorrect.",
      souscription: "Votre session a expiré. Veuillez vous reconnecter.",
      "espace-client": "Votre session a expiré. Veuillez vous reconnecter.",
      "dashboard-admin": "Votre session a expiré.",
      default: "Votre session a expiré."
  },
  403: "Cette action n'est pas autorisée.",
  404: "Page introuvable.",
  409: "Un compte existe déjà avec cette adresse email.",
  422: CLIENT_SIDE_MESSAGES,
  429: "Trop de tentatives échouées. Veuillez réessayer dans 30 minutes.",
};

export function getFriendlyErrorMessage(
  error: unknown,
  context: PageContext = "default",
): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) return SERVER_SIDE_MESSAGE;

    const mapping = MESSAGES[error.status];
    if (typeof mapping === "string") return mapping;
    if (mapping && typeof mapping === "object") {
      return mapping[context] ?? mapping.default;
    }
    return "Votre demande n'a pas abouti. Réessayez dans quelques instants.";
  }

  return "Une difficulté technique est survenue. Veuillez réessayer dans quelques instants.";
}

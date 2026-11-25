// ============================================================
// FEDPAWA — dictionnaire page generiqueFormulaire FR/EN
// Utilisé par le composant GeneriqueFormulaire (formulaires
// dérivés du modèle de domiciliation, pilotés par JSON).
// ============================================================

import type { PageDict } from "../../i18n/types";

export const generiqueFormulaireFr: PageDict = {
  // Stepper
  stepLabel: "Étape",
  prev: "← Précédent",
  btnBack: "Précédent",
  btnContinue: "Suivant →",
  btnValidate: "Valider & Payer",

  // Validation
  errRequired: "Ce champ est requis",
  errEmail: "Email invalide",
  errPhone: "Téléphone invalide",
  errPackMissing: "Veuillez sélectionner un pack",
  errIdentite: "La pièce d'identité est requise",
  errStatuts: "Les statuts de l'entreprise sont requis",
  errValidations: "Vous devez accepter toutes les cases de validation",

  // Succès
  successTitle: "Demande enregistrée",
  successText1: "Votre dossier a bien été transmis à nos équipes.",
  successText1End: "",
  successText2: "",
  success24h: "",
  btnHome: "Retour à l'accueil",

  // Brouillon
  draftTitle: "Reprise de votre progression",
  draftText: "Vous avez une progression enregistrée. Voulez-vous la reprendre ou recommencer ?",
  draftContinue: "Reprendre",
  draftRestart: "Recommencer",

  // Smart-détection (domiciliation)
  smartTitle: "Création d'entreprise détectée",
  smartText: "Nous avons détecté que votre entreprise n'est pas encore immatriculée (pas de RCCM / NIU). FEDPAWA peut prendre en charge la création complète.",
  smartNoText: "Vous avez choisi de ne pas créer d'entreprise. Certains champs seront bloqués.",
  smartYes: "Oui, créer mon entreprise",
  smartNo: "Non, continuer sans",
  smartUnderstood: "Compris",
};

export const generiqueFormulaireEn: PageDict = {
  // Stepper
  stepLabel: "Step",
  prev: "← Previous",
  btnBack: "Previous",
  btnContinue: "Next →",
  btnValidate: "Validate & Pay",

  // Validation
  errRequired: "This field is required",
  errEmail: "Invalid email",
  errPhone: "Invalid phone",
  errPackMissing: "Please select a pack",
  errIdentite: "Identity document is required",
  errStatuts: "Company statutes are required",
  errValidations: "You must accept all validation checkboxes",

  // Succès
  successTitle: "Application recorded",
  successText1: "Your file has been transmitted to our teams.",
  successText1End: "",
  successText2: "",
  success24h: "",
  btnHome: "Back to home",

  // Brouillon
  draftTitle: "Resume your progress",
  draftText: "You have a saved draft. Do you want to resume or start over?",
  draftContinue: "Resume",
  draftRestart: "Start over",

  // Smart-détection (domiciliation)
  smartTitle: "Company creation detected",
  smartText: "We detected that your company is not yet registered (no RCCM / NIU). FEDPAWA can handle the complete creation process.",
  smartNoText: "You chose not to create a company. Some fields will be blocked.",
  smartYes: "Yes, create my company",
  smartNo: "No, continue without",
  smartUnderstood: "Understood",
};

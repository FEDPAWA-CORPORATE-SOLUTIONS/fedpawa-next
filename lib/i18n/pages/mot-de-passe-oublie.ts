// ==========================================================
// FEDPAWA — dictionnaires page mot_de_passe_oublie FR/EN
// FR : extraction exacte de mot_de_passe_oublie.html.
// EN : pas de source .en.html — traduction de la vague C
// (alignée sur le ton des autres pages EN).
// ==========================================================

import type { PageDict } from "../../i18n/types";

export const resetFr: PageDict = {
  heroTitle: "Sécurité et <span>Confidentialité</span> Absolue.",
  heroDesc:
    "Vos données sont protégées par un chiffrement de bout en bout. Réinitialisez votre accès en toute sérénité.",
  feat1: "Chiffrement SSL 256-bit",
  feat2: "Authentification Sécurisée",
  feat3: "Assistance 24/7",
  copyright: "© FEDPAWA Corporate Solutions",

  backLogin: "← Retour à la page de connexion",
  reqTitle: "Mot de passe oublié ?",
  reqText: "Ne vous inquiétez pas. Saisissez votre identifiant pour réinitialiser votre accès.",
  reqLabel: "Adresse E-mail professionnelle",
  reqPlaceholder: "nom@entreprise.cm",
  reqButton: "Envoyer le lien de réinitialisation",
  troubleText: "Vous rencontrez des difficultés ?",
  supportLink: "Contacter le support client",

  backEdit: "← Modifier l'identifiant",
  otpTitle: "Saisissez le code de vérification",
  otpText: "Un code à 6 chiffres a été envoyé à votre adresse e-mail professionnelle.",
  otpTimerLabel: "Vous pourrez redemander un code dans : ",
  otpResend: "Vous n'avez rien reçu ? Renvoyer le code",
  otpCanResend: "Vous pouvez redemander un code.",
  otpButton: "Valider le code",

  pwdTitle: "Réinitialisez votre mot de passe",
  pwdText: "Choisissez un mot de passe robuste pour protéger votre espace d'affaires.",
  newPwdLabel: "Nouveau mot de passe",
  confirmPwdLabel: "Confirmer le nouveau mot de passe",
  pwdUpdateButton: "Mettre à jour mon mot de passe",
  chk1: "Au moins 8 caractères",
  chk2: "1 majuscule et 1 minuscule",
  chk3: "1 chiffre",
  chk4: "1 caractère spécial (@, #, $...)",
  strength0: "",
  strength1: "Faible",
  strength2: "Moyen",
  strength3: "Fort",
  strength4: "Très Fort",

  okTitle: "Mot de passe mis à jour avec succès !",
  okText:
    "Votre mot de passe a été réinitialisé. Vous pouvez maintenant accéder à votre Espace Client pour suivre vos démarches.",
  okButton: "Se connecter à l'Espace Client",

  // toasts / modales (password-reset.js)
  toastCodeSent: "Un code de vérification a été envoyé à votre adresse e-mail. Valable 15 minutes.",
  toastCodeResent: "Un nouveau code a été envoyé à votre adresse e-mail.",
  toastSendKo: "Impossible d'envoyer le code",
  toastResendKo: "Impossible de renvoyer le code",
  toastInvalidCode: "Code invalide ou expiré",
  toastResetKo: "Impossible de réinitialiser le mot de passe",
  toastMismatch: "Les mots de passe ne correspondent pas.",
  toastNetwork: "Erreur réseau. Vérifiez votre connexion.",
  preprodTitle: "Mode pré-production",
  preprodMsg:
    "Si cette adresse existe, un code de vérification vous a été envoyé par e-mail.<br><small>Le service d'envoi est en cours d'activation — si vous ne recevez rien, contactez le support.</small>",
  preprodBtn: "J'ai noté mon code",
  resendModalTitle: "Nouveau code envoyé",
  resendModalMsg:
    "Un nouveau code de vérification a été envoyé à votre adresse e-mail.<br><small>Si vous ne recevez rien, contactez le support.</small>",
  resendModalBtn: "OK",
};

export const resetEn: PageDict = {
  heroTitle: "Absolute <span>Security & Confidentiality</span>.",
  heroDesc:
    "Your data is protected by end-to-end encryption. Reset your access with complete peace of mind.",
  feat1: "256-bit SSL encryption",
  feat2: "Secure authentication",
  feat3: "24/7 support",
  copyright: "© FEDPAWA Corporate Solutions",

  backLogin: "← Back to the login page",
  reqTitle: "Forgot your password?",
  reqText: "Don't worry. Enter your email address to reset your access.",
  reqLabel: "Professional email address",
  reqPlaceholder: "name@company.cm",
  reqButton: "Send the reset code",
  troubleText: "Having trouble?",
  supportLink: "Contact customer support",

  backEdit: "← Change email address",
  otpTitle: "Enter the verification code",
  otpText: "A 6-digit code has been sent to your professional email address.",
  otpTimerLabel: "You can request a new code in: ",
  otpResend: "Didn't receive anything? Resend the code",
  otpCanResend: "You can request a new code.",
  otpButton: "Verify the code",

  pwdTitle: "Reset your password",
  pwdText: "Choose a strong password to protect your business space.",
  newPwdLabel: "New password",
  confirmPwdLabel: "Confirm the new password",
  pwdUpdateButton: "Update my password",
  chk1: "At least 8 characters",
  chk2: "1 uppercase and 1 lowercase letter",
  chk3: "1 number",
  chk4: "1 special character (@, #, $...)",
  strength0: "",
  strength1: "Weak",
  strength2: "Medium",
  strength3: "Strong",
  strength4: "Very strong",

  okTitle: "Password updated successfully!",
  okText:
    "Your password has been reset. You can now access your Client Portal to track your procedures.",
  okButton: "Log in to the Client Portal",

  // toasts / modales
  toastCodeSent: "A verification code has been sent to your email address. Valid for 15 minutes.",
  toastCodeResent: "A new code has been sent to your email address.",
  toastSendKo: "Could not send the code",
  toastResendKo: "Could not resend the code",
  toastInvalidCode: "Invalid or expired code",
  toastResetKo: "Could not reset the password",
  toastMismatch: "Passwords do not match.",
  toastNetwork: "Network error. Check your connection.",
  preprodTitle: "Pre-production mode",
  preprodMsg:
    "If this address exists, a verification code has been sent to your email.<br><small>The delivery service is being activated — if you receive nothing, contact support.</small>",
  preprodBtn: "I have noted my code",
  resendModalTitle: "New code sent",
  resendModalMsg:
    "A new verification code has been sent to your email address.<br><small>If you receive nothing, contact support.</small>",
  resendModalBtn: "OK",
};

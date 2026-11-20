// ==========================================================
// FEDPAWA — i18n : pop-up d'abonnement aux notifications push
// Thème FEDPAWA : bleu nuit (#15294D) + boutons dorés (#D4AF37).
// Affiché à l'arrivée d'un visiteur, une seule fois, sauf si déjà
// abonné ou si refus persistant.
// ==========================================================

import type { PageDict } from "../types";

export const notificationPopupFr: PageDict = {
  popupTitle: "Activer les notifications",
  popupBody:
    "Recevez en temps réel les nouvelles publications, les validations de dossier KYC et les réponses de support directement sur votre appareil.",
  popupActivate: "Activer les notifications",
  popupLater: "Plus tard",
  popupClose: "Fermer",
  popupSuccess: "Notifications activées.",
  popupDenied: "Notifications refusées. Vous pourrez les activer ultérieurement depuis le bouton du header.",
  popupError: "Impossible d'activer les notifications pour le moment.",
};

export const notificationPopupEn: PageDict = {
  popupTitle: "Enable notifications",
  popupBody:
    "Receive real-time alerts: new publications, KYC validations and support responses directly on your device.",
  popupActivate: "Enable notifications",
  popupLater: "Later",
  popupClose: "Close",
  popupSuccess: "Notifications enabled.",
  popupDenied: "Notifications declined. You can enable them later from the header button.",
  popupError: "Could not enable notifications right now.",
};

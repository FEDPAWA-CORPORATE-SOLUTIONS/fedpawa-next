// ==========================================================
// FEDPAWA — dictionnaires page « Notifications » FR/EN.
// Page espace client : historique des événements notifiés
// (tous les événements qui justifient l'envoi d'un e-mail,
// table backend notification_events, 14 types PushService).
// ==========================================================

import type { PageDict } from "../../i18n/types";

export const notificationsFr: PageDict = {
  metaTitle: "Notifications | FEDPAWA CORPORATE SOLUTIONS",
  metaDescription:
    "Historique de vos notifications FEDPAWA : factures, paiements, contrats, KYC, courriers, support et sécurité du compte — les mêmes événements qui déclenchent l'envoi d'un e-mail.",
  navLabel: "Notifications",
  title: "Mes notifications",
  subtitle:
    "Tous les événements de votre compte suffisamment importants pour justifier l'envoi d'un e-mail : chaque notification ci-dessous a été enregistrée et, selon vos préférences, notifiée par e-mail et push PWA.",
  unreadOnly: "Non lues uniquement",
  filterAll: "Tous les événements",
  markAllRead: "Tout marquer comme lu",
  empty: "Aucune notification pour le moment.",
  emptyFiltered: "Aucune notification pour ce filtre.",
  loadMore: "Charger plus",
  loading: "Chargement…",
  loginRequired: "Connectez-vous pour consulter vos notifications.",
  loginCta: "Se connecter",
  typeContratScelle: "Contrat scellé",
  typeContratSigne: "Contrat signé",
  typeDossierStatut: "Statut du dossier",
  typeFactureEmise: "Facture émise",
  typeFacture: "Facture",
  typePaiementRecu: "Paiement reçu",
  typeTicketReponse: "Réponse du support",
  typeTicket: "Support",
  typeCourrierRecu: "Courrier reçu",
  typeCourrier: "Courrier",
  typeCompteSecurite: "Sécurité du compte",
  typeAbonnement: "Abonnement",
  typeKyc: "Vérification KYC",
  typeSysteme: "Système",
  unreadBadge: "Non lue",
};

export const notificationsEn: PageDict = {
  metaTitle: "Notifications | FEDPAWA CORPORATE SOLUTIONS",
  metaDescription:
    "Your FEDPAWA notification history: invoices, payments, contracts, KYC, mail, support and account security — the same events that trigger an email.",
  navLabel: "Notifications",
  title: "My notifications",
  subtitle:
    "Every account event important enough to justify sending an email: each notification below was recorded and, per your preferences, delivered by email and PWA push.",
  unreadOnly: "Unread only",
  filterAll: "All events",
  markAllRead: "Mark all as read",
  empty: "No notifications yet.",
  emptyFiltered: "No notifications for this filter.",
  loadMore: "Load more",
  loading: "Loading…",
  loginRequired: "Sign in to view your notifications.",
  loginCta: "Sign in",
  typeContratScelle: "Sealed contract",
  typeContratSigne: "Signed contract",
  typeDossierStatut: "Case status",
  typeFactureEmise: "Invoice issued",
  typeFacture: "Invoice",
  typePaiementRecu: "Payment received",
  typeTicketReponse: "Support reply",
  typeTicket: "Support",
  typeCourrierRecu: "Mail received",
  typeCourrier: "Mail",
  typeCompteSecurite: "Account security",
  typeAbonnement: "Subscription",
  typeKyc: "KYC verification",
  typeSysteme: "System",
  unreadBadge: "Unread",
};

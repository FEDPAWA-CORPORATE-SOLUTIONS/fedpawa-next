# Formulaire Générique Malléable — FEDPAWA

## Vue d'ensemble

Le composant `GeneriqueFormulaire` est un wizard de souscription piloté par une spécification JSON. Il est basé sur le formulaire de domiciliation (référence) et permet de créer autant de formulaires que nécessaire sans modifier le code source.

## Structure du projet

```
fedpawa-next/components/souscription-generique/
├── GeneriqueFormulaire.tsx      # Composant React générique
├── specs/                       # Spécifications JSON par service
│   ├── creation-entreprise.json
│   ├── conseil-fiscal.json
│   ├── oapi.json
│   ├── contrats.json
│   └── domiciliation.json
└── schemas/
    └── form-spec.schema.json    # Schéma de validation JSON Schema
```

## Utilisation

### 1. Créer une spécification JSON

Chaque service a son propre fichier de spec dans `specs/`. Voir le schéma dans `schemas/form-spec.schema.json`.

Exemple minimal :

```json
{
  "serviceId": "mon-service",
  "serviceName": "Mon Service",
  "endpoint": "/api/v1/souscription/mon-service",
  "totalSteps": 3,
  "formTitle": "Mon Formulaire",
  "formSubtitle": "Sous-titre explicatif",
  "localStorageKey": "souscription_mon-service_draft_v1",
  "successMessage": "Votre demande a été enregistrée.",
  "successLink": "Aller à mon Espace Client",
  "steps": [
    {
      "id": 1,
      "title": "Étape 1",
      "description": "Description de l'étape 1",
      "fields": [
        {
          "name": "champ1",
          "label": "Champ 1",
          "type": "text",
          "placeholder": "Exemple",
          "required": true,
          "errorRequired": "Ce champ est requis"
        }
      ]
    }
  ],
  "checkboxes": [
    { "name": "chkCgv", "label": "J'accepte les CGV", "required": true }
  ]
}
```

### 2. Créer une page Next.js

```tsx
import GeneriqueFormulaire from "@/components/souscription-generique/GeneriqueFormulaire";
import spec from "@/components/souscription-generique/specs/mon-service.json";

export default function MaPage({ locale = "fr" }: { locale?: string }) {
  return <GeneriqueFormulaire locale={locale} spec={spec as any} />;
}
```

### 3. Déclarer la route

Dans `app/(site)/souscription/<service>/page.tsx`.

## Éléments stables (communs à tous les formulaires)

| Élément | Description |
|---------|-------------|
| Stepper | Barre de progression avec numéros d'étapes |
| Navigation | Boutons Précédent / Suivant entre les étapes |
| Brouillon | Sauvegarde dans `localStorage` + modale de reprise |
| Pré-remplissage | Remplissage automatique depuis `/me` (compte utilisateur) |
| Vérification email | Gate modal si email non vérifié |
| Paiement | PayModal (Mobile Money) en fin de parcours |
| Facture | Facture proforma si `spec.invoice` est définie |
| Upload fichiers | POST `/api/v1/souscription/upload` pour les pièces jointes |

## Éléments variables (dans la spec JSON)

| Élément | Description |
|---------|-------------|
| `steps` | Nombre et contenu des étapes (variable) |
| `fields` | Champs de saisie par étape (text, number, email, tel, textarea, select, date, checkbox) |
| `files` | Dropzones pour upload de fichiers |
| `radios` | Boutons radio (ex: type de contrat) |
| `options` | Cases à cocher multiples (ex: options complémentaires) |
| `checkboxes` | Cases de validation finales |
| `invoice` | Facture proforma avec prix |
| `devisMessage` | Message si prix sur devis |
| `dependsOn` / `requiredIf` | Champs conditionnels |

## Routes API utilisées

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/souscription/upload` | Upload d'un fichier (pièce KYC, statuts, etc.) |
| POST | `<endpoint spec>` | Soumission du formulaire |
| GET | `/api/v1/auth/me` | Pré-remplissage depuis le compte utilisateur |

## Exemples de specs

- `creation-entreprise.json` — 6 étapes, capital, apports, représentant légal, KYC
- `conseil-fiscal.json` — 6 étapes, régime fiscal, CA estimé, formules, options
- `oapi.json` — 6 étapes, type d'actif, classe Nice, logo, protection IP
- `contrats.json` — 6 étapes, type de contrat, questionnaire, clauses
- `domiciliation.json` — 6 étapes, packs, gammes, KYC, contrat + signature

## Notes importantes

- Les fichiers uploadés sont envoyés vers `/api/v1/souscription/upload` et leurs chemins sont injectés dans le payload de soumission.
- Les objets `File` ne sont jamais envoyés dans le payload JSON (non sérialisables).
- Le brouillon exclut les fichiers (non sérialisables en JSON).
- Pour désactiver le stepper, il faut le retirer du rendu dans `GeneriqueFormulaire.tsx` (option à venir).

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GeneriqueFormulaire from "../components/souscription-generique/GeneriqueFormulaire";

const baseSpec: any = {
  serviceId: "test-service",
  serviceName: "Service de test",
  endpoint: "/api/v1/souscription/test",
  totalSteps: 2,
  formTitle: "Test Formulaire",
  formSubtitle: "Sous-titre de test",
  localStorageKey: "souscription_test_draft_v1",
  successMessage: "Votre demande a été enregistrée.",
  successLink: "Aller à mon Espace Client",
  steps: [
    {
      id: 1,
      title: "Étape 1",
      description: "Première étape",
      fields: [
        {
          name: "nom",
          label: "Nom",
          type: "text",
          placeholder: "Votre nom",
          required: true,
          errorRequired: "Le nom est requis",
        },
      ],
    },
    {
      id: 2,
      title: "Étape 2",
      description: "Deuxième étape",
      fields: [
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "vous@exemple.com",
          required: true,
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          errorRequired: "L'email est requis",
          errorPattern: "Email invalide",
        },
      ],
    },
  ],
  checkboxes: [
    { name: "chkCgv", label: "J'accepte les CGV", required: true },
  ],
};

describe("GeneriqueFormulaire", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetchMe pour retourner un utilisateur non authentifié
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ authenticated: false }),
      })
    );
    // Mock apiAuthPost
    jest.mock("@/lib/auth", () => ({
      apiAuthPost: jest.fn(() => Promise.resolve({ ok: true })),
      fetchMe: jest.fn(() => Promise.resolve({ authenticated: false })),
    }));
  });

  it("rend le formulaire avec le titre et les étapes", () => {
    render(<GeneriqueFormulaire locale="fr" spec={baseSpec} />);
    expect(screen.getByText("Test Formulaire")).toBeInTheDocument();
    expect(screen.getByText("Étape 1")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
  });

  it("affiche le stepper avec le bon nombre d'étapes", () => {
    render(<GeneriqueFormulaire locale="fr" spec={baseSpec} />);
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("navigue vers l'étape 2 après avoir rempli l'étape 1", async () => {
    render(<GeneriqueFormulaire locale="fr" spec={baseSpec} />);
    const input = screen.getByLabelText(/Nom/i);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Suivant/));
    expect(screen.getByText("Étape 2")).toBeInTheDocument();
  });

  it("affiche une erreur si le champ requis est vide", async () => {
    render(<GeneriqueFormulaire locale="fr" spec={baseSpec} />);
    fireEvent.click(screen.getByText(/Suivant/));
    expect(screen.getByText("Ce champ est requis")).toBeInTheDocument();
  });

  it("soumet le formulaire avec succès", async () => {
    const { post } = require("@/lib/auth");
    (post as jest.Mock).mockResolvedValue({ ok: true });

    render(<GeneriqueFormulaire locale="fr" spec={baseSpec} />);
    fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Suivant/));
    fireEvent.click(screen.getByLabelText(/J'accepte les CGV/i));
    fireEvent.click(screen.getByText(/Valider/));

    await waitFor(() => {
      expect(screen.getByText(/Demande enregistrée/)).toBeInTheDocument();
    });
  });

  it("ne soumet pas si l'email est invalide", async () => {
    render(<GeneriqueFormulaire locale="fr" spec={baseSpec} />);
    fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: "Test" } });
    fireEvent.click(screen.getByText(/Suivant/));
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "invalide" } });
    fireEvent.click(screen.getByText(/Valider/));
    expect(screen.getByText("Email invalide")).toBeInTheDocument();
  });
});

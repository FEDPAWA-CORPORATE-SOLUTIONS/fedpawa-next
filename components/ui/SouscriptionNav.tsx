"use client";

// ==========================================================
// FEDPAWA — SouscriptionNav : boutons de navigation communs
// (Précédent / Suivant / Valider) pour les formulaires.
// ==========================================================

interface SouscriptionNavProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  className?: string;
  labels?: {
    prev?: string;
    next?: string;
    submit?: string;
  };
}

export default function SouscriptionNav({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  className,
  labels = {},
}: SouscriptionNavProps) {
  const isLast = currentStep >= totalSteps;
  const canPrev = currentStep > 1;

  return (
    <div className={`nav-actions ${className || ""}`}>
      {canPrev && (
        <button type="button" className="btn btn-outline" onClick={onPrev}>
          {labels.prev || "Précédent"}
        </button>
      )}
      {isLast ? (
        onSubmit ? (
          <button type="button" className="btn btn-primary btn-block" onClick={onSubmit}>
            {labels.submit || "Générer mon dossier"}
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-block" onClick={onNext}>
            {labels.submit || "Générer mon dossier"}
          </button>
        )
      ) : (
        <button type="button" className="btn btn-primary" onClick={onNext}>
          {labels.next || "Suivant"}
        </button>
      )}
    </div>
  );
}

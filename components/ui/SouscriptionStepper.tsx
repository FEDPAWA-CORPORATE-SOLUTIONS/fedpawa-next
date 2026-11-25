"use client";

// ==========================================================
// FEDPAWA — SouscriptionStepper : composant de progression
// commun à tous les formulaires de souscription.
// Utilise les classes CSS de souscription-common.css.
// ==========================================================

import { useEffect, useState } from "react";

interface SouscriptionStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
  className?: string;
}

export default function SouscriptionStepper({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
  className,
}: SouscriptionStepperProps) {
  const [width, setWidth] = useState<string>("0%");

  useEffect(() => {
    if (totalSteps > 1) {
      setWidth(`${((currentStep - 1) / (totalSteps - 1)) * 100}%`);
    }
  }, [currentStep, totalSteps]);

  const stepClass = (n: number) =>
    `progress-step ${n === currentStep ? "active" : ""} ${
      n < currentStep ? "completed" : ""
    }`;

  return (
    <div className={`progress-wrapper ${className || ""}`}>
      <div className="container">
        {/* Version mobile */}
        <div className="dom-step-mobile">
          <div className="dom-step-mobile-txt">
            <span>Étape {currentStep} / {totalSteps}</span>
            <strong>{stepLabels[currentStep - 1] || `Étape ${currentStep}`}</strong>
          </div>
          <div className="dom-step-mobile-bar">
            <div className="dom-step-mobile-fill" style={{ width }} />
          </div>
        </div>

        {/* Version desktop */}
        <div className="progress-container">
          <div className="progress-line">
            <div className="progress-line-fill" style={{ width }} />
          </div>
          {stepLabels.map((label, i) => {
            const n = i + 1;
            return (
              <div
                key={n}
                className={stepClass(n)}
                data-step={n}
                onClick={
                  onStepClick && n < currentStep
                    ? () => onStepClick(n)
                    : undefined
                }
                style={{
                  cursor: n < currentStep ? "pointer" : "default",
                }}
              >
                <div className="progress-dot">{n}</div>
                <span className="progress-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

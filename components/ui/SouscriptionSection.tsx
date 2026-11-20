"use client";

// ==========================================================
// FEDPAWA — SouscriptionSection : section de formulaire commune
// avec titre, numéro et contenu.
// ==========================================================

interface SouscriptionSectionProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SouscriptionSection({
  stepNumber,
  title,
  description,
  children,
  className,
}: SouscriptionSectionProps) {
  return (
    <div className={`form-section ${className || ""}`}>
      <h2 className="form-section-title">
        <span className="form-section-num">{stepNumber}</span>
        {title}
      </h2>
      {description && <p className="section-intro">{description}</p>}
      <div className="form-grid">{children}</div>
    </div>
  );
}

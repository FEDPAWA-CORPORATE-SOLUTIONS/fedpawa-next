"use client";

// ==========================================================
// FEDPAWA — SouscriptionCard : carte de formulaire commune
// avec wrapper tunnel-layout-v2 et tunnel-card.
// ==========================================================

interface SouscriptionCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SouscriptionCard({
  children,
  className,
  style,
}: SouscriptionCardProps) {
  return (
    <div className="tunnel-layout-v2">
      <div className={`tunnel-card ${className || ""}`} style={style}>
        {children}
      </div>
    </div>
  );
}

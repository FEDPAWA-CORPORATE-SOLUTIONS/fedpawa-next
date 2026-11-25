// ============================================================================
// FEDPAWA — Composant OpenSign : signature électronique sur canevas
// Permet de dessiner à la souris (desktop) ou au doigt (mobile/tactile)
// avec bouton "Effacer" pour recommencer.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";

export interface SignatureMetadata {
  timestamp: string;
  ip: string;
  method: "canvas" | "text" | "image";
  userAgent: string;
}

interface OpenSignCanvasProps {
  onComplete: (signatureDataUrl: string, metadata: SignatureMetadata) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function OpenSignCanvas({
  onComplete,
  onCancel,
  disabled = false,
}: OpenSignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const clientX =
        e.type === "touchstart"
          ? (e as unknown as TouchEvent).touches[0].clientX
          : (e as unknown as MouseEvent).clientX;
      const clientY =
        e.type === "touchstart"
          ? (e as unknown as TouchEvent).touches[0].clientY
          : (e as unknown as MouseEvent).clientY;

      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    },
    [disabled]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      e.preventDefault(); // Empêche le scroll pendant le dessin tactile

      const clientX =
        e.type === "touchmove"
          ? (e as unknown as TouchEvent).touches[0].clientX
          : (e as unknown as MouseEvent).clientX;
      const clientY =
        e.type === "touchmove"
          ? (e as unknown as TouchEvent).touches[0].clientY
          : (e as unknown as MouseEvent).clientY;

      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
    },
    [isDrawing, disabled]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Impossible d'accéder au canevas de signature.");
      return;
    }
    if (!hasSignature) {
      setError("Veuillez apposer votre signature avant de valider.");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const metadata: SignatureMetadata = {
      timestamp: new Date().toISOString(),
      ip: "0.0.0.0", // À remplacer par l'IP côté serveur lors de l'envoi final
      method: "canvas",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };
    onComplete(dataUrl, metadata);
  }, [hasSignature, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration du contexte de dessin
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Gestionnaires d'événements souris
    canvas.addEventListener("mousedown", startDrawing as any);
    canvas.addEventListener("mousemove", draw as any);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // Gestionnaires d'événements tactile
    canvas.addEventListener("touchstart", startDrawing as any, {
      passive: false,
    });
    canvas.addEventListener("touchmove", draw as any, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing as any);
      canvas.removeEventListener("mousemove", draw as any);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing as any);
      canvas.removeEventListener("touchmove", draw as any);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchcancel", stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ border: "2px dashed #cbd5e1", borderRadius: 8, minHeight: 200, position: "relative", marginBottom: 16 }}>
        <canvas
          ref={canvasRef}
          width={560}
          height={200}
          style={{
            width: "100%",
            height: "200px",
            borderRadius: 6,
            cursor: disabled ? "not-allowed" : "crosshair",
            background: disabled ? "#f3f4f6" : "#ffffff",
          }}
        />
        {!hasSignature && !disabled && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#9ca3af",
              fontSize: "0.9rem",
              pointerEvents: "none",
            }}
          >
            Dessinez votre signature ici
          </div>
        )}
        {hasSignature && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "#15803d",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            ✓ Signature capturée
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            color: "#dc2626",
            fontSize: "0.85rem",
            marginBottom: 12,
            padding: 8,
            background: "#fef2f2",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          type="button"
          onClick={clearCanvas}
          disabled={disabled || !hasSignature}
          className="btn btn-outline"
          style={{ padding: "10px 24px" }}
        >
          Effacer
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !hasSignature}
          className="btn btn-primary"
          style={{ padding: "10px 24px" }}
        >
          Valider la signature
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FactureDisplay } from "@/components/souscription-domiciliation/FactureDisplay";
import { apiAuthPost } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { resolveFormError } from "@/lib/form-errors";

const CSS = `
/* ===== Paiement Conseil Fiscal — Style conforme au design system FEDPAWA ===== */
/* Toutes les couleurs, ombres et rayons proviennent de globals.css */
.paiement-page {
  min-height: 100vh;
  background-color: var(--color-surface-dark);
  color: var(--color-text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  padding: 40px 0 60px;
}
.paiement-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
/* Bannière d'avertissement — style sobre */
.paiement-warning-banner {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-muted);
  border-radius: var(--radius);
  padding: 12px 18px;
  margin-bottom: 28px;
  font-size: 0.82rem;
  line-height: 1.5;
  display: flex; align-items: center; gap: 12px;
  font-weight: 500;
}
.paiement-warning-banner svg { width: 16px; height: 16px; flex-shrink: 0; color: var(--color-gold); }
/* En-tête */
.paiement-section-header { text-align: center; margin-bottom: 28px; }
.paiement-section-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px;
  background: rgba(212,175,55,0.1);
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: 14px;
}
.paiement-section-title {
  font-family: var(--font-serif);
  font-size: 2.1rem; font-weight: 800; color: var(--color-heading);
  letter-spacing: -0.5px; margin-bottom: 8px;
  line-height: 1.15;
}
.paiement-section-title em {
  font-style: italic; color: var(--color-gold); font-weight: 700;
}
.paiement-section-sub {
  font-size: 0.92rem; color: var(--color-text-muted);
  max-width: 540px; margin: 0 auto;
}
/* Stepper à 2 étapes — comme dans le FormulaireGenerique */
.paiement-stepper {
  display: flex; align-items: center; justify-content: center;
  gap: 0; margin: 28px 0 32px;
}
.paiement-step {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted);
}
.paiement-step.active { color: var(--color-text-main); }
.paiement-step-num {
  width: 28px; height: 28px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-bg-main); border: 1px solid var(--color-border);
  font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted);
}
.paiement-step.active .paiement-step-num {
  background: var(--color-primary);
  color: var(--color-on-primary); border-color: var(--color-primary);
}
.paiement-step.completed .paiement-step-num {
  background: var(--color-success);
  color: var(--color-on-primary); border-color: var(--color-success);
}
.paiement-step.completed { color: var(--color-success); }
.paiement-step-divider {
  width: 40px; height: 1px;
  background: var(--color-border);
  margin: 0 10px;
}
/* Toggle de mode de paiement — style sobre */
.paiement-mode-toggle {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 5px;
  margin-bottom: 22px;
}
.paiement-mode-btn {
  flex: 1;
  padding: 10px 22px;
  font-size: 0.84rem; font-weight: 700;
  border: none; border-radius: 999px;
  cursor: pointer;
  transition: color 0.25s, background 0.25s;
  color: var(--color-text-muted);
  background: transparent;
  letter-spacing: 0.2px;
  display: inline-flex; align-items: center; gap: 8px;
}
.paiement-mode-btn .mode-ico { width: 15px; height: 15px; }
.paiement-mode-btn:hover:not(.active) { color: var(--color-text-main); }
.paiement-mode-btn.active {
  color: var(--color-gold);
  background: var(--color-primary);
}
/* Instruction courte */
.paiement-intro {
  font-size: 0.88rem; color: var(--color-text-muted);
  margin-bottom: 12px; text-align: center; line-height: 1.6;
}
.paiement-intro strong { color: var(--color-gold); font-weight: 700; }
.paiement-intro.amount-line {
  font-size: 1rem; margin-bottom: 28px;
}
.paiement-intro.amount-line strong {
  font-family: var(--font-serif);
  font-size: 1.15rem;
}
/* Carte facture (étape 1) */
.paiement-invoice-card {
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}
/* Formulaire de paiement (étape 2) */
.paiement-payment-card {
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}
.paiement-operators {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  margin-bottom: 20px;
}
.paiement-operator-btn {
  position: relative;
  padding: 13px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-bg-alt);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.paiement-operator-btn:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  background: var(--color-bg-section);
}
.paiement-operator-btn .op-logo {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}
.paiement-operator-btn .op-logo img { width: 22px; height: 22px; border-radius: 50%; }
.paiement-operator-btn .op-name { font-weight: 700; color: var(--color-text-main); font-size: 0.86rem; line-height: 1; }
.paiement-operator-btn .op-check {
  position: absolute; top: 8px; right: 8px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--color-gold); color: var(--color-surface-dark);
  display: none; align-items: center; justify-content: center;
}
.paiement-operator-btn .op-check svg { width: 10px; height: 10px; stroke-width: 3.5; }
.paiement-operator-btn.active {
  border-color: var(--color-primary);
  background: rgba(212,175,55,0.1);
  box-shadow: inset 0 1px 0 rgba(212,175,55,0.15);
}
.paiement-operator-btn.active .op-logo {
  background: rgba(212,175,55,0.14);
  border-color: var(--color-primary);
}
.paiement-operator-btn.active .op-name { color: var(--color-gold); }
.paiement-operator-btn.active .op-check { display: flex; }
/* Form — style conforme au site */
.paiement-form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
.paiement-form-label {
  font-size: 0.78rem; font-weight: 600; color: var(--color-text-main);
  letter-spacing: 0.2px;
  display: flex; align-items: center; gap: 6px;
}
.paiement-form-label .req { color: var(--color-gold); }
.paiement-input-wrap { position: relative; display: flex; align-items: center; }
.paiement-input-ico {
  position: absolute; left: 16px;
  width: 17px; height: 17px; color: var(--color-text-muted);
  pointer-events: none; transition: color 0.2s;
}
.paiement-form-control {
  width: 100%;
  padding: 14px 16px 14px 46px;
  font-size: 1.15rem; font-weight: 700;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius);
  background: var(--color-bg-main);
  color: var(--color-text-main);
  transition: all 0.2s;
  letter-spacing: 0.4px;
  font-family: var(--font-sans);
}
.paiement-form-control::placeholder { color: var(--color-text-muted); font-weight: 600; }
.paiement-form-control:hover { border-color: var(--color-primary); }
.paiement-form-control:focus {
  outline: none;
  border-color: var(--color-gold);
  background: var(--color-bg-main);
  box-shadow: 0 0 0 4px rgba(212,175,55,0.12);
}
.paiement-input-wrap:focus-within .paiement-input-ico { color: var(--color-gold); }
/* Ligne montant — style sobre */
.paiement-amount-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 13px 16px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  margin-bottom: 18px;
}
.paiement-amount-row-label {
  font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.6px;
}
.paiement-amount-row-value {
  font-family: var(--font-serif);
  font-size: 1.15rem; font-weight: 800; color: var(--color-gold);
  letter-spacing: 0.5px;
}
/* Bouton valider — style conforme au site (pas d'effet néon) */
.paiement-btn-pay {
  width: 100%;
  padding: 16px;
  font-size: 1rem; font-weight: 800;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-btn);
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  letter-spacing: 0.3px;
}
.paiement-btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-btn-hover);
}
.paiement-btn-pay:active:not(:disabled) { transform: translateY(-1px); }
.paiement-btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
/* Bouton retour */
.paiement-btn-back {
  width: 100%;
  padding: 16px;
  font-size: 1rem; font-weight: 800;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-bg-alt);
  color: var(--color-text-main);
  box-shadow: var(--shadow-card);
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  letter-spacing: 0.3px;
}
.paiement-btn-back:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
/* Texte demande de retrait — style sobre */
.paiement-demande-retrait {
  font-size: 0.78rem; color: var(--color-text-muted);
  margin-top: 14px; text-align: center; line-height: 1.5;
}
.paiement-demande-retrait strong { color: var(--color-gold); font-weight: 700; }
/* Ligne sécurisée */
.paiement-secure-line {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 14px;
  font-size: 0.7rem; color: var(--color-text-muted); font-weight: 500;
}
.paiement-secure-line svg { width: 12px; height: 12px; color: var(--color-success); }
/* Succès — style sobre */
.paiement-success-card {
  text-align: center; padding: 80px 24px; max-width: 520px; margin: 0 auto;
}
.paiement-success-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 64px; height: 64px;
  background: rgba(30,125,79,0.1);
  border: 1px solid var(--color-success);
  border-radius: 50%; color: var(--color-success); margin-bottom: 24px;
}
.paiement-success-icon svg { width: 32px; height: 32px; }
.paiement-success-title {
  font-family: var(--font-serif);
  font-size: 1.7rem; font-weight: 800; color: var(--color-gold); margin-bottom: 12px;
}
.paiement-success-text { font-size: 0.92rem; color: var(--color-text-muted); margin-bottom: 24px; line-height: 1.6; }
.paiement-transaction-id {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 24px;
  background: rgba(255,255,255,0.03); padding: 10px 16px; border-radius: var(--radius);
  border: 1px dashed var(--color-border);
}
.paiement-transaction-id .label { font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; font-size: 0.64rem; letter-spacing: 0.5px; }
.paiement-transaction-id .value { color: var(--color-gold); font-family: var(--font-serif); font-weight: 800; letter-spacing: 1px; }
.paiement-btn-reset {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 26px; font-size: 0.9rem; font-weight: 700;
  color: var(--color-gold);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  border: none; border-radius: var(--radius); cursor: pointer; text-decoration: none;
  transition: all 0.2s;
}
.paiement-btn-reset:hover { transform: translateY(-2px); filter: brightness(1.1); }
@media (max-width: 880px) {
  .paiement-section-title { font-size: 1.7rem; }
}
@media (max-width: 520px) {
  .paiement-operators { grid-template-columns: 1fr; }
  .paiement-section-title { font-size: 1.5rem; }
}
`;

export default function PaiementConseilFiscalPage() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId") ?? undefined;
  const [mode, setMode] = useState("mtn" as "mtn" | "carte");
  const [phone, setPhone] = useState("+237 6");
  const [amount, setAmount] = useState(35000);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1 = facture, 2 = paiement

  const fmtFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = phone.replace(/\s/g, "");
    if (!/^\+237[0-9]{9}$/.test(normalized)) {
      setPaymentError("Veuillez entrer un numéro camerounais valide (ex: +237 6XX XXX XXX).");
      return;
    }
    if (!draftId) {
      setPaymentError("Identifiant de dossier manquant.");
      return;
    }
    setSubmitting(true);
    setPaymentError(null);
    try {
      const res = await apiAuthPost<{
        status: string;
        statut: string;
        transaction_id: string | null;
        montant: number;
        message: string;
      }>(`/api/v1/souscription/${draftId}/pay`, {
        phone: normalized,
        operator: mode,
      });
      setTxId(res.transaction_id ?? null);
      setSubmitting(false);
      setSuccess(true);
    } catch (err) {
      setSubmitting(false);
      setPaymentError(
        err instanceof ApiError
          ? resolveFormError(err, "souscription", {
              validation_generic: "Impossible d'initier le paiement. Réessayez.",
              cat_unknown: "Erreur lors de l'initiation du paiement."
            })
          : "Erreur lors de l'initiation du paiement."
      );
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div className="paiement-page">
        <div className="paiement-container">

          <div className="paiement-section-header">
            <div className="paiement-section-eyebrow">Espace Client · Paiement</div>
            <h1 className="paiement-section-title">Paiement — Conseil <em>Juridique et Fiscal</em></h1>
            <p className="paiement-section-sub">Réglez votre abonnement en toute sécurité via Mobile Money ou carte bancaire.</p>
          </div>

          <div className="paiement-stepper">
            <div className={`paiement-step ${step === 1 ? "active" : "completed"}`}>
              <span className="paiement-step-num">1</span>
              <span>Facture</span>
            </div>
            <div className="paiement-step-divider"></div>
            <div className={`paiement-step ${step === 2 ? "active" : ""}`}>
              <span className="paiement-step-num">2</span>
              <span>Paiement</span>
            </div>
          </div>

          {step === 1 && (
            <>
              <p className="paiement-intro amount-line">
                Paiement de <strong id="montant-affiche">{fmtFCFA(amount)}</strong> pour le pack <strong>Starter</strong> — Conseil Juridique et Fiscal.
              </p>
              <p className="paiement-intro">
                Vérifiez votre facture ci-dessous, puis passez au paiement.
              </p>

              <div className="paiement-invoice-card">
                <FactureDisplay
                  numero="FAC-2026-001"
                  dateStr="23/11/2026"
                  service="Conseil Juridique et Fiscal"
                  gamme="Simplifiée — Starter"
                  periodicite="Mensuel"
                  montant={amount}
                />
              </div>

              <div style={{ marginTop: 40, textAlign: "right", position: "relative", zIndex: 20 }}>
                <button
                  type="button"
                  className="paiement-btn-pay"
                  onClick={() => setStep(2)}
                >
                  Procéder au paiement
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="paiement-intro amount-line">
                Paiement de <strong id="montant-affiche">{fmtFCFA(amount)}</strong> pour le pack <strong>Starter</strong> — Conseil Juridique et Fiscal.
              </p>
              <p className="paiement-intro">
                Sélectionnez votre opérateur, entrez votre numéro et validez.
              </p>

              <div className="paiement-payment-card">
                <div className="paiement-operators">
                  {["mtn", "orange"].map((op) => {
                    const label = op === "mtn" ? "MTN MoMo" : "Orange Money";
                    return (
                      <button
                        key={op}
                        type="button"
                        className={`paiement-operator-btn ${op === "mtn" ? "active" : ""}`}
                        data-op={op}
                      >
                        <span className="op-logo">
                          <img
                            src={`/images/operators/${op}.svg`}
                            alt={label}
                            width="32"
                            height="32"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (img) img.style.display = "none";
                            }}
                          />
                        </span>
                        <span className="op-name">{label}</span>
                        <span className="op-check">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {paymentError && (
                  <div style={{ color: "#dc2626", padding: 12, background: "#fef2f2", borderRadius: 8, marginBottom: 16 }}>
                    {paymentError}
                  </div>
                )}
                <form onSubmit={handleSubmit} id="form-paiement">
                  <div className="paiement-form-group">
                    <label className="paiement-form-label" htmlFor="telephone">
                      Numéro de téléphone <span className="req">*</span>
                    </label>
                    <div className="paiement-input-wrap">
                      <input
                        type="tel"
                        className="paiement-form-control"
                        id="telephone"
                        placeholder="+237 6XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="paiement-amount-row">
                    <span className="paiement-amount-row-label">Montant</span>
                    <span className="paiement-amount-row-value" id="montant-input">
                      {fmtFCFA(amount)}
                    </span>
                  </div>

                  <button type="submit" className="paiement-btn-pay" id="btn-payer" disabled={submitting}>
                    {submitting ? "Paiement en cours…" : `Payer ${fmtFCFA(amount)}`}
                  </button>

                  <p className="paiement-demande-retrait">
                    Vous recevrez une <strong>demande de retrait</strong> sur ce numéro à valider.
                  </p>

                  <div className="paiement-secure-line">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Paiement chiffré · SSL/TLS
                  </div>
                </form>
              </div>

              <div style={{ marginTop: 24, textAlign: "right" }}>
                <button
                  type="button"
                  className="paiement-btn-back"
                  onClick={() => setStep(1)}
                >
                  ◀ Retour à la facture
                </button>
              </div>
            </>
          )}

          {success && (
            <div className="paiement-success-card" id="succes-container">
              <div className="paiement-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="paiement-success-title">Paiement confirmé</h2>
              <p className="paiement-success-text">
                Votre paiement Mobile Money a été effectué avec succès.
              </p>
              <div className="paiement-transaction-id">
                <span className="label">Transaction</span>
                <span className="value" id="transaction-id">{txId}</span>
              </div>
              <button className="paiement-btn-reset" onClick={() => setSuccess(false)}>
                Nouveau paiement
              </button>
              <Link href="/espace-client" className="paiement-btn-reset" style={{ marginLeft: 12 }}>
                Accéder à mon espace client
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

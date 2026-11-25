"use client";

import { format } from "date-fns";

export interface FactureDisplayProps {
  numero: string;
  dateStr: string;
  service: string;
  gamme: string;
  periodicite: string;
  montant: number;
  clientNom?: string;
  clientEmail?: string;
  clientTelephone?: string;
  entreprise?: string;
  niu?: string;
  rccm?: string;
  adresse?: string;
}

export function FactureDisplay(props: FactureDisplayProps) {
  const {
    numero,
    dateStr,
    service,
    gamme,
    periodicite,
    montant,
    clientNom = "Client",
    clientEmail,
    clientTelephone,
    entreprise = "FEDPAWA CORPORATE SOLUTIONS SARL",
    niu = "M09261890362B",
    rccm = "CM-DLA-01-2026-B13-00767",
    adresse = "Douala - Logpom (Immeuble Pharmacie de Logpom), Cameroun",
  } = props;

  const fmtFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

  const css = `
    .fd-invoice-card {
      position: relative;
      background: var(--color-bg-main);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 0;
      box-shadow: var(--shadow-card);
      overflow: hidden;
    }
    .fd-inner { position: relative; z-index: 1; padding: 28px 26px 24px; }
    .fd-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 18px;
    }
    .fd-brand-block { display: flex; align-items: center; gap: 14px; }
    .fd-mark {
      width: 48px; height: 48px;
      border-radius: var(--radius);
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-btn);
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--color-text-main); flex-shrink: 0;
    }
    .fd-mark svg { width: 22px; height: 22px; }
    .fd-brand-text { display: flex; flex-direction: column; gap: 1px; }
    .fd-brand {
      font-family: var(--font-serif);
      font-size: 1.6rem; font-weight: 800; color: var(--color-heading);
      line-height: 1; letter-spacing: -0.3px;
    }
    .fd-sub {
      font-size: 0.66rem; letter-spacing: 1.6px; text-transform: uppercase;
      color: var(--color-text-muted); font-weight: 600;
    }
    .fd-stamp {
      align-self: flex-start;
      padding: 5px 10px;
      border: 1.5px dashed var(--color-border);
      border-radius: var(--radius);
      font-size: 0.62rem; font-weight: 800; letter-spacing: 1.2px;
      color: var(--color-text-muted); text-transform: uppercase;
      transform: rotate(3deg);
      background: rgba(255,255,255,0.03);
    }
    .fd-meta {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      margin-bottom: 18px;
    }
    .fd-meta-box {
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: 10px 12px;
    }
    .fd-meta-label {
      font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.8px;
      color: var(--color-text-muted); font-weight: 600; margin-bottom: 3px;
    }
    .fd-meta-value {
      font-size: 0.82rem; color: var(--color-text-main); font-weight: 600;
    }
    .fd-details { margin-bottom: 18px; }
    .fd-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 11px 0;
      border-bottom: 1px solid var(--color-border);
    }
    .fd-row:last-child { border-bottom: none; }
    .fd-row .fd-label {
      font-size: 0.74rem; color: var(--color-text-muted); font-weight: 500;
      letter-spacing: 0.3px;
    }
    .fd-row .fd-value {
      font-size: 0.86rem; color: var(--color-text-main); font-weight: 600;
      text-align: right;
    }
    .fd-row .fd-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 999px;
      font-size: 0.68rem; font-weight: 700; color: var(--color-gold);
      background: rgba(212,175,55,0.1); border: 1px solid var(--color-gold);
    }
    .fd-line-items {
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: 12px 14px;
      margin-bottom: 18px;
    }
    .fd-line-item {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 12px; padding: 8px 0;
    }
    .fd-line-item + .fd-line-item { border-top: 1px solid var(--color-border); }
    .fd-line-desc { display: flex; flex-direction: column; gap: 2px; }
    .fd-line-title {
      font-size: 0.82rem; font-weight: 600; color: var(--color-text-main);
    }
    .fd-line-sub {
      font-size: 0.7rem; color: var(--color-text-muted);
    }
    .fd-line-amt {
      font-size: 0.85rem; font-weight: 700; color: var(--color-text-main);
      white-space: nowrap;
    }
    .fd-totals {
      padding-top: 14px; border-top: 1px solid var(--color-border);
    }
    .fd-total-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 0;
      font-size: 0.82rem; color: var(--color-text-muted);
    }
    .fd-total-row.fd-grand {
      margin-top: 10px; padding: 14px 16px;
      background: var(--color-bg-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: inset 0 1px 0 var(--color-border);
    }
    .fd-total-row.fd-grand .fd-t-label {
      font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
      color: var(--color-text-muted);
    }
    .fd-total-row.fd-grand .fd-t-value {
      font-family: var(--font-serif);
      font-size: 1.55rem; font-weight: 800; color: var(--color-gold);
    }
    .fd-footer {
      margin-top: 18px; padding-top: 16px;
      border-top: 1px solid var(--color-border);
      display: flex; align-items: flex-start; gap: 10px;
    }
    .fd-footer .fd-small {
      font-size: 0.7rem; color: var(--color-text-muted); line-height: 1.6;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="fd-invoice-card">
        <div className="fd-inner">
          <div className="fd-header">
            <div className="fd-brand-block">
              <div className="fd-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                  <line x1="9" y1="18" x2="13" y2="18" />
                </svg>
              </div>
              <div className="fd-brand-text">
                <div className="fd-brand">Facture</div>
                <div className="fd-sub">FEDPAWA Corporate Solutions</div>
              </div>
            </div>
          </div>

          <div className="fd-meta">
            <div className="fd-meta-box">
              <div className="fd-meta-label">N° Facture</div>
              <div className="fd-meta-value">{numero}</div>
            </div>
            <div className="fd-meta-box">
              <div className="fd-meta-label">Date d'émission</div>
              <div className="fd-meta-value">{dateStr}</div>
            </div>
          </div>

          <div className="fd-details">
            <div className="fd-row">
              <span className="fd-label">Service</span>
              <span className="fd-value">{service}</span>
            </div>
            <div className="fd-row">
              <span className="fd-label">Gamme</span>
              <span className="fd-value">{gamme}</span>
            </div>
            <div className="fd-row">
              <span className="fd-label">Périodicité</span>
              <span className="fd-value">{periodicite}</span>
            </div>
            <div className="fd-row">
              <span className="fd-label">Statut</span>
              <span className="fd-badge">En attente de paiement</span>
            </div>
          </div>

          <div className="fd-line-items">
            <div className="fd-line-item">
              <div className="fd-line-desc">
                <span className="fd-line-title">Pack {gamme} — {service}</span>
                <span className="fd-line-sub">Accompagnement mensuel · Simplifié</span>
              </div>
              <span className="fd-line-amt">{fmtFCFA(montant)}</span>
            </div>
          </div>

          <div className="fd-totals">
            <div className="fd-total-row">
              <span className="fd-t-label">Sous-total HT</span>
              <span className="fd-t-value">{fmtFCFA(montant)}</span>
            </div>
            <div className="fd-total-row">
              <span className="fd-t-label">TVA (0%)</span>
              <span className="fd-t-value">0 FCFA</span>
            </div>
            <div className="fd-total-row fd-grand">
              <span className="fd-t-label">Total à payer</span>
              <span className="fd-t-value">{fmtFCFA(montant)}</span>
            </div>
          </div>

          <div className="fd-footer">
            <p className="fd-small">
              {entreprise} — NIU: {niu} — RCCM: {rccm}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

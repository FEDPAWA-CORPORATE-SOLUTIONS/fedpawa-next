'use client';

import { useState, useEffect } from 'react';
import { apiAuthGet } from '@/lib/auth';
import { fmtDate } from '@/lib/dashboard-format';
import Link from 'next/link';

interface ContractSigningItem {
  request_id: string;
  title: string;
  status: string;
  signer_email: string;
  signer_name?: string;
  sender_email: string;
  sender_name?: string;
  created_at: string;
  updated_at?: string;
  document_hash?: string;
  signed_pdf_url?: string;
  source_contract_id?: number;
  ip_address?: string;
}

interface ContractSigningListProps {
  /** Quand true, affiche aussi l'email du signataire et l'IP (vue admin) */
  adminView?: boolean;
}

export default function ContractSigningList({ adminView = false }: ContractSigningListProps) {
  const [contracts, setContracts] = useState<ContractSigningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiAuthGet<{ success: boolean; contracts: ContractSigningItem[]; error?: string }>(
      '/api/v1/contract-signing/my-contracts'
    )
      .then((res) => {
        if (cancelled) return;
        if (!res.success) {
          setError(res.error || 'Erreur lors du chargement.');
          setLoading(false);
          return;
        }
        setContracts(res.contracts ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Impossible de charger les contrats.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="db-section sig-section">
        <div className="db-section-header"><h2>Contrats électroniques</h2></div>
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-section sig-section">
        <div className="db-section-header"><h2>Contrats électroniques</h2></div>
        <div className="sig-alert sig-alert-erreur" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!contracts.length) {
    return (
      <div className="db-section sig-section">
        <div className="db-section-header"><h2>Contrats électroniques</h2></div>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Aucun contrat en attente ou signé pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="db-section sig-section">
      <div className="db-section-header">
        <h2>Contrats électroniques</h2>
      </div>
      <div className="db-table-wrap">
        <table className="db-table sig-table">
          <thead>
            <tr>
              <th>Contrat</th>
              <th>Signataire</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Action</th>
              {adminView && <th>IP / Expéditeur</th>}
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.request_id}>
                <td>
                  <span className="db-table-cell-title">{c.title}</span>
                  {c.source_contract_id && (
                    <span className="sig-badge sig-badge-source">Contrat #{c.source_contract_id}</span>
                  )}
                </td>
                <td>{c.signer_name || c.signer_email}</td>
                <td>
                  <span className={`sig-badge sig-badge-${c.status}`}>
                    {c.status === 'signed' ? 'Signé' : c.status === 'pending' ? 'En attente' : c.status === 'cancelled' ? 'Annulé' : c.status}
                  </span>
                </td>
                <td>{fmtDate(c.created_at)}</td>
                <td>
                  {c.status === 'signed' && c.signed_pdf_url ? (
                    <Link
                      href={`/api/v1/contract-signing/download/${c.request_id}`}
                      className="action-link"
                    >
                      Télécharger PDF
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                {adminView && (
                  <td>
                    <span className="text-xs text-gray-500">{c.sender_email}</span>
                    <br />
                    <span className="text-xs text-gray-400">{c.ip_address || '—'}</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

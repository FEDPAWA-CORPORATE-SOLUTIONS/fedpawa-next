'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { apiAuthPost, apiAuthGetBlob } from '@/lib/auth';

interface Props {
  searchParams?: { contractId?: string };
}

interface SendRequest {
  title: string;
  pdf_base64: string;
  signer_name: string;
  signer_email: string;
  sender_name?: string;
  sender_email?: string;
  language?: string;
}

interface SendResponse {
  success: boolean;
  request_id?: string;
  request_token?: string;
  next_step?: string;
  status?: string;
  error?: string;
}

const AVERTISSEMENT = `AVERTISSEMENT IMPORTANT — LISEZ AVANT DE SIGNER

Avant de signer ce contrat, veuillez lire attentivement les informations suivantes.

1. Pour signer ce contrat, vous devez entrer votre adresse e-mail.
   Cette adresse e-mail doit être privée et accessible uniquement à vous. Ne partagez pas cette adresse avec une autre personne.

2. En entrant votre adresse e-mail, vous assumez et confirmez que vous êtes la seule personne capable de valider que vous êtes le signataire de ce contrat.

3. C'est par cette adresse e-mail que vous recevrez un lien par lequel vous allez devoir signer le contrat numériquement. Notre signature sera également apposée sur le contrat et vous recevrez une copie.

4. Si vous n'êtes pas d'accord avec les termes du contrat, veuillez contacter notre support avant de procéder à la signature.

5. ATTENTION : une fois signé, le contrat ne peut plus être modifié. Toute modification ultérieure du document, ainsi que l'intégrité et l'authenticité des signataires, pourront être vérifiées auprès d'un service tiers.

En poursuivant, vous reconnaissez avoir lu et compris ces informations.`;

export default function ContratASignerPage({ searchParams }: Props) {
  const contractId = searchParams?.contractId;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [accepteAvertissement, setAccepteAvertissement] = useState(false);

  // Charger le PDF du contrat depuis le backend et l'encoder en base64
  useEffect(() => {
    if (!contractId) {
      setPdfLoaded(true);
      return;
    }
    let annule = false;
    setLoading(true);
    apiAuthGetBlob(`/api/v1/document?type=contrat&id=${contractId}`)
      .then((blob) => {
        if (annule) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          setPdfBase64(base64);
          setPdfLoaded(true);
          setLoading(false);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        if (annule) return;
        setError('Impossible de charger le contrat.');
        setPdfLoaded(true);
        setLoading(false);
      });
    return () => { annule = true; };
  }, [contractId]);

  const handleSend = useCallback(async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!email) {
      setError('Veuillez entrer votre adresse e-mail.');
      return;
    }
    if (!pdfBase64) {
      setError('Le contrat est introuvable.');
      return;
    }
    if (!accepteAvertissement) {
      setError('Vous devez cocher la case confirmant avoir lu et accepté l\'avertissement.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiAuthPost<SendResponse>('/api/v1/contract-signing/send', {
        title: 'Contrat de prestation de services',
        pdf_base64: pdfBase64,
        signer_name: 'Client',
        signer_email: email,
        sender_name: 'FEDPAWA CORPORATE SOLUTIONS',
        sender_email: 'admin@fedpawa.com',
        language: 'fr',
      });

      if (!res.success) {
        setError(res.error || 'Erreur lors de l\'envoi du contrat.');
        setLoading(false);
        return;
      }

      setStatus('success');
    } catch (err: unknown) {
      const apiErr = err as { message?: string; status?: number };
      setError(apiErr.message || 'Erreur réseau lors de l\'envoi.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [email, pdfBase64, accepteAvertissement]);

  if (status === 'success') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-green-700">Contrat envoyé pour signature</h2>
        <p className="mb-4">
          Un lien de signature a été envoyé à <strong>{email}</strong>.
        </p>
        <p className="mb-4">
          Notre signature a également été apposée. Vous recevrez une copie du contrat signé par e-mail.
        </p>
        <p className="text-sm text-gray-600">
          Consultez votre boîte e-mail pour finaliser la signature. Une fois signée, le contrat ne pourra plus être modifié.
        </p>
        <Link href="/espace-client?tab=documents" className="text-blue-600 hover:underline">
          Retour à mes documents
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contrat à signer</h1>

      {/* Avertissement obligatoire */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
        <h2 className="font-bold text-amber-800 mb-2">⚠️ Informations importantes avant signature</h2>
        <pre className="text-amber-800 text-sm whitespace-pre-wrap">{AVERTISSEMENT}</pre>
      </div>

      {/* Case à cocher de confirmation */}
      <div className="flex items-start mb-6">
        <input
          type="checkbox"
          id="accepte-avertissement"
          checked={accepteAvertissement}
          onChange={(e) => setAccepteAvertissement(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="accepte-avertissement" className="ml-3 text-sm text-gray-700 font-medium">
          J'ai lu et compris l'avertissement ci-dessus et je souhaite poursuivre la signature de ce contrat.
        </label>
      </div>

      {/* Aperçu du contrat */}
      <div className="border border-gray-200 rounded p-4 mb-6 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Aperçu du contrat (pré-rempli avec vos informations) :</p>
        {pdfLoaded ? (
          pdfBase64 ? (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Contrat n°{contractId} — prêt à être signé.
              </p>
              <iframe
                title="Aperçu du contrat"
                src={`data:application/pdf;base64,${pdfBase64}`}
                className="w-full h-64 rounded border border-gray-200"
              />
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Contrat n°{contractId} — chargement de l'aperçu…
            </p>
          )
        ) : (
          <p className="text-sm text-gray-600">
            Contrat non trouvé.
          </p>
        )}
      </div>

      <form onSubmit={handleSend} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Votre adresse e-mail privée</label>
          <p className="text-xs text-gray-500 mb-1">
            Cette adresse recevra le lien de signature. Elle doit être accessible uniquement à vous.
          </p>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="votre.email@exemple.com"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !pdfBase64 || !accepteAvertissement}
          className="w-full bg-blue-600 text-white py-3 rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le contrat pour signature'}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        Limite gratuite : 30 contrats par mois. Un seul signataire externe par contrat.
      </p>
    </div>
  );
}

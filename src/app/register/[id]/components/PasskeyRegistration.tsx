'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Reservation } from '@/lib/supabase/types';
import { useI18n } from '@/lib/i18n/context';

interface PasskeyRegistrationProps {
  reservation: Reservation;
  onPasskeyRegistered: () => void;
}

export default function PasskeyRegistration({
  reservation,
  onPasskeyRegistered,
}: PasskeyRegistrationProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegisterPasskey = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error(t('bio.notSupported'));
      }

      const optionsResponse = await fetch(
        '/api/webauthn/register/generate-options',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: reservation.id }),
        }
      );

      const optionsData = await optionsResponse.json();

      if (!optionsResponse.ok) {
        throw new Error(optionsData.error || 'Failed to get registration options');
      }

      const { options, challengeId } = optionsData;

      let credential;
      try {
        credential = await startRegistration(options);
      } catch (regError) {
        if (regError instanceof Error && regError.name === 'NotAllowedError') {
          throw new Error(t('bio.cancelled'));
        }
        throw new Error(t('bio.failed'));
      }

      const verifyResponse = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          reservationId: reservation.id,
          credential,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Failed to verify registration');
      }

      setIsRegistered(true);
      onPasskeyRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t('passkey.title')}
        </h2>
        <p className="text-text-secondary text-sm">
          {t('passkey.description')}
        </p>
      </div>

      <div className="bg-surface-secondary rounded-lg p-4">
        <p className="text-sm font-medium text-foreground mb-2">{t('passkey.supported')}</p>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>・ {t('passkey.iphone')}</li>
          <li>・ {t('passkey.mac')}</li>
          <li>・ {t('passkey.windows')}</li>
          <li>・ {t('passkey.android')}</li>
        </ul>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/5 border border-danger/20 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {isRegistered ? (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <p className="text-sm font-semibold text-success mb-1">{t('passkey.success')}</p>
            <p className="text-sm text-text-secondary">
              {t('passkey.successDesc')}
            </p>
          </div>

          <div className="border-2 border-foreground rounded-lg p-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-1">
              {t('passkey.secretCode')}
            </p>
            <p className="text-2xl font-bold font-mono text-foreground tracking-widest">
              {reservation.secret_code}
            </p>
            <p className="text-xs text-text-muted mt-2">
              {t('passkey.secretCodeNote')}
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleRegisterPasskey}
          disabled={isLoading}
          className="w-full py-4 px-4 rounded-lg bg-foreground text-background text-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              {t('passkey.waiting')}
            </span>
          ) : (
            t('passkey.register')
          )}
        </button>
      )}

      <p className="text-xs text-text-muted">
        {t('passkey.note')}
      </p>
    </div>
  );
}

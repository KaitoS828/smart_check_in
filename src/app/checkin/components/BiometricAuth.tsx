'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useI18n } from '@/lib/i18n/context';

interface BiometricAuthProps {
  onAuthSuccess: (result: { reservationId: string }) => void;
}

export default function BiometricAuth({ onAuthSuccess }: BiometricAuthProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthenticate = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error(t('bio.notSupported'));
      }

      const optionsResponse = await fetch(
        '/api/webauthn/authenticate/generate-options',
        { method: 'POST' }
      );

      const optionsData = await optionsResponse.json();
      if (!optionsResponse.ok) {
        throw new Error(optionsData.error || 'Failed to get authentication options');
      }

      const { options, challengeId } = optionsData;

      let credential;
      try {
        credential = await startAuthentication(options);
      } catch (authError) {
        if (authError instanceof Error && authError.name === 'NotAllowedError') {
          throw new Error(t('bio.cancelled'));
        }
        throw new Error(t('bio.failed'));
      }

      const verifyResponse = await fetch('/api/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, credential }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Authentication failed');
      }

      onAuthSuccess({ reservationId: verifyData.reservationId });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{t('bio.title')}</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          {t('bio.description')}
        </p>
      </div>

      <div className="bg-surface-secondary rounded-lg p-4">
        <p className="text-sm text-text-secondary">
          {t('bio.supported')}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/5 border border-danger/20 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <button
        onClick={handleAuthenticate}
        disabled={isLoading}
        className="w-full py-4 px-4 rounded-lg bg-foreground text-background text-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            {t('bio.waiting')}
          </span>
        ) : (
          t('bio.start')
        )}
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

interface SecretCodeInputProps {
  reservationId: string;
  onCheckinComplete: (result: { guestName: string; doorPin: string }) => void;
}

export default function SecretCodeInput({
  reservationId,
  onCheckinComplete,
}: SecretCodeInputProps) {
  const { t } = useI18n();
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatSecretCode = (value: string): string => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < cleaned.length && i < 9; i += 3) {
      parts.push(cleaned.slice(i, i + 3));
    }
    return parts.join('-');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretCode(formatSecretCode(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservationId,
          secret_code: secretCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      onCheckinComplete({
        guestName: data.guest_name,
        doorPin: data.door_pin,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{t('secret.title')}</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          {t('secret.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={secretCode}
            onChange={handleChange}
            className="block w-full rounded-lg border border-border bg-surface px-4 py-4 text-2xl font-mono font-bold text-center text-foreground tracking-widest focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40"
            placeholder={t('secret.placeholder')}
            maxLength={11}
            required
            autoFocus
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-danger/5 border border-danger/20 p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || secretCode.length < 11}
          className="w-full py-4 px-4 rounded-lg bg-foreground text-background text-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('secret.verifying') : t('secret.submit')}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Reservation } from '@/lib/supabase/types';
import GuestInfoForm from './components/GuestInfoForm';
import PasskeyRegistration from './components/PasskeyRegistration';
import { useI18n } from '@/lib/i18n/context';

export default function RegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, toggleLocale } = useI18n();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [guestInfoSubmitted, setGuestInfoSubmitted] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReservation = async () => {
    try {
      const response = await fetch(`/api/reservations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reservation');
      }

      setReservation(data.reservation);
      setGuestInfoSubmitted(Boolean(data.reservation.guest_name));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestInfoSubmitted = (updatedReservation: Reservation) => {
    setReservation(updatedReservation);
    setGuestInfoSubmitted(true);
  };

  const handlePasskeyRegistered = () => {
    setPasskeyRegistered(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-border" />
            <div className="absolute inset-0 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-text-secondary">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="text-5xl mb-6">⚠</div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {t('register.notFound')}
          </h1>
          <p className="text-text-secondary mb-8">
            {error || t('register.notFoundDesc')}
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'guest', label: t('register.stepGuest') },
    { key: 'device', label: t('register.stepDevice') },
  ];
  const currentIndex = guestInfoSubmitted ? (passkeyRegistered ? 2 : 1) : 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-2xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          {t('common.appName')}
        </Link>
        <button
          onClick={toggleLocale}
          className="text-xs font-medium px-2.5 py-1 border border-border rounded-md text-text-secondary hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          {t('lang.toggle')}
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {t('register.title')}
        </h1>
        <p className="text-text-secondary mb-10">
          {t('register.subtitle')}
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                    i < currentIndex
                      ? 'bg-foreground text-background'
                      : i === currentIndex
                      ? 'bg-foreground text-background'
                      : 'bg-surface-secondary text-text-muted border border-border'
                  }`}
                >
                  {i < currentIndex ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${i <= currentIndex ? 'text-foreground font-medium' : 'text-text-muted'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px ${i < currentIndex ? 'bg-foreground' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <GuestInfoForm
            reservation={reservation}
            onGuestInfoSubmitted={handleGuestInfoSubmitted}
          />

          {guestInfoSubmitted && (
            <PasskeyRegistration
              reservation={reservation}
              onPasskeyRegistered={handlePasskeyRegistered}
            />
          )}

          {passkeyRegistered && (
            <div className="text-center py-6 animate-fade-in">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('register.complete')}
              </h2>
              <p className="text-text-secondary mb-8">
                {t('register.completeDesc')}
              </p>
              <div className="bg-surface-secondary rounded-lg p-4 max-w-sm mx-auto text-left">
                <p className="text-sm text-foreground font-medium mb-2">{t('register.howToCheckin')}</p>
                <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                  <li>{t('register.howStep1')}</li>
                  <li>{t('register.howStep2')}</li>
                  <li>{t('register.howStep3')}</li>
                  <li>{t('register.howStep4')}</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

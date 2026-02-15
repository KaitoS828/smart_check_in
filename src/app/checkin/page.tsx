'use client';

import { useState } from 'react';
import Link from 'next/link';
import BiometricAuth from './components/BiometricAuth';
import SecretCodeInput from './components/SecretCodeInput';
import { useI18n } from '@/lib/i18n/context';

type CheckinStep = 'biometric' | 'secret_code' | 'complete';

interface AuthResult {
  reservationId: string;
}

interface CheckinResult {
  guestName: string;
  doorPin: string;
}

export default function CheckinPage() {
  const { t, toggleLocale } = useI18n();
  const [currentStep, setCurrentStep] = useState<CheckinStep>('biometric');
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);

  const handleAuthSuccess = (result: AuthResult) => {
    setAuthResult(result);
    setCurrentStep('secret_code');
  };

  const handleCheckinComplete = (result: CheckinResult) => {
    setCheckinResult(result);
    setCurrentStep('complete');
  };

  const steps = [
    { key: 'biometric', label: t('checkin.stepBiometric') },
    { key: 'secret_code', label: t('checkin.stepSecretCode') },
    { key: 'complete', label: t('checkin.stepComplete') },
  ];
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

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
          {t('checkin.title')}
        </h1>
        <p className="text-text-secondary mb-10">
          {t('checkin.subtitle')}
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                  i <= currentIndex
                    ? 'bg-foreground text-background'
                    : 'bg-surface-secondary text-text-muted border border-border'
                }`}
              >
                {i < currentIndex ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i <= currentIndex ? 'text-foreground font-medium' : 'text-text-muted'}`}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px ${i < currentIndex ? 'bg-foreground' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {currentStep === 'biometric' && (
            <BiometricAuth onAuthSuccess={handleAuthSuccess} />
          )}
          {currentStep === 'secret_code' && authResult && (
            <SecretCodeInput
              reservationId={authResult.reservationId}
              onCheckinComplete={handleCheckinComplete}
            />
          )}
          {currentStep === 'complete' && checkinResult && (
            <div className="text-center py-8 animate-fade-in">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('complete.title')}
              </h2>
              <p className="text-text-secondary mb-8">
                {t('complete.greeting')}、{checkinResult.guestName}
              </p>
              <div className="border-2 border-foreground rounded-xl p-6 max-w-xs mx-auto mb-8">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2">
                  {t('complete.doorPin')}
                </p>
                <p className="text-4xl font-bold font-mono text-foreground tracking-widest">
                  {checkinResult.doorPin}
                </p>
                <p className="text-xs text-text-muted mt-3">
                  {t('complete.doorPinNote')}
                </p>
              </div>
              <Link
                href="/"
                className="text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                {t('complete.backToTop')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

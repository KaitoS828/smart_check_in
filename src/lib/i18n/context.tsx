'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Locale, translations, TranslationKey } from './translations';

interface I18nContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale | null;
      if (saved === 'ja' || saved === 'en') return saved;
      // Auto-detect browser language
      return navigator.language.startsWith('ja') ? 'ja' : 'en';
    }
    return 'ja';
  });

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[key]?.[locale] || key;
    },
    [locale]
  );

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === 'ja' ? 'en' : 'ja';
      localStorage.setItem('locale', next);
      return next;
    });
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

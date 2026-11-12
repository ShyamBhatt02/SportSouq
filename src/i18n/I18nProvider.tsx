import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import en, { type Messages } from './en';

export type Locale = 'en' | 'ar';

interface I18nValue {
  t: Messages;
  locale: Locale;
  dir: 'ltr' | 'rtl';
}

const dictionaries: Record<Locale, Messages> = {
  en,
  // Arabic copy will ship in ./ar.ts; English is used as a safe fallback until then.
  ar: en,
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale = 'en', children }: { locale?: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => ({ t: dictionaries[locale], locale, dir: locale === 'ar' ? 'rtl' : 'ltr' }), [locale]);
  useEffect(() => {
    document.documentElement.lang = locale === 'ar' ? 'ar-AE' : 'en-AE';
    document.documentElement.dir = value.dir;
  }, [locale, value.dir]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { EmirateCode, UserPreferences } from '@/types';
import { EMIRATE_CODES, STORAGE_KEYS } from '@/config/site';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const DEFAULTS: UserPreferences = { theme: 'light', emirate: 'dubai', locale: 'en', newsletter: true, orderUpdates: true };

function isPrefs(v: unknown): v is UserPreferences {
  const p = v as UserPreferences;
  return !!p && typeof p === 'object' && ['light', 'dark', 'system'].includes(p.theme) && EMIRATE_CODES.includes(p.emirate);
}

interface PreferencesValue {
  preferences: UserPreferences;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: UserPreferences['theme']) => void;
  setEmirate: (emirate: EmirateCode) => void;
  update: (patch: Partial<UserPreferences>) => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<UserPreferences>(STORAGE_KEYS.preferences, DEFAULTS, isPrefs);
  const preferences = useMemo(() => ({ ...DEFAULTS, ...stored }), [stored]);
  const resolvedTheme = preferences.theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preferences.theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#0a0f1a' : '#0b1220');
  }, [resolvedTheme]);

  const value = useMemo<PreferencesValue>(
    () => ({
      preferences,
      resolvedTheme,
      setTheme: (theme) => setStored((p) => ({ ...DEFAULTS, ...p, theme })),
      setEmirate: (emirate) => setStored((p) => ({ ...DEFAULTS, ...p, emirate })),
      update: (patch) => setStored((p) => ({ ...DEFAULTS, ...p, ...patch })),
    }),
    [preferences, resolvedTheme, setStored],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}

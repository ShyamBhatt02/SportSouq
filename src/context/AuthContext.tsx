import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthSession, User } from '@/types';
import type { LoginValues, RegisterValues } from '@/schemas';
import { authService } from '@/services/authService';
import { getErrorStatus } from '@/services/api/client';
import { STORAGE_KEYS } from '@/config/site';
import { isObject, readStorage, removeStorage, writeStorage } from '@/utils/storage';

type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface AuthValue {
  user: User | null;
  status: AuthStatus;
  isAdmin: boolean;
  login: (values: LoginValues) => Promise<User>;
  register: (values: RegisterValues) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function readSession(): AuthSession | null {
  const s = readStorage<AuthSession | null>(STORAGE_KEYS.session, null, (v): v is AuthSession => isObject(v) && typeof (v as AuthSession).token === 'string');
  if (!s || new Date(s.expiresAt).getTime() < Date.now()) return null;
  return s;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (readSession() ? 'loading' : 'guest'));

  // Restore the session on boot (token → /auth/me), like a real SPA would.
  useEffect(() => {
    if (!readSession()) return;
    let cancelled = false;
    authService
      .me()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus('authenticated');
      })
      .catch((err) => {
        if (cancelled) return;
        if (getErrorStatus(err) === 401) removeStorage(STORAGE_KEYS.session);
        setUser(null);
        setStatus('guest');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const finish = useCallback(
    (u: User, session: AuthSession) => {
      // Only an opaque token + expiry are persisted client-side — never passwords.
      writeStorage(STORAGE_KEYS.session, session);
      setUser(u);
      setStatus('authenticated');
      queryClient.removeQueries({ queryKey: ['me'] });
      return u;
    },
    [queryClient],
  );

  const login = useCallback(async (values: LoginValues) => {
    const res = await authService.login(values);
    return finish(res.user, res.session);
  }, [finish]);

  const register = useCallback(async (values: RegisterValues) => {
    const res = await authService.register(values);
    return finish(res.user, res.session);
  }, [finish]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      removeStorage(STORAGE_KEYS.session);
      setUser(null);
      setStatus('guest');
      queryClient.removeQueries({ queryKey: ['me'] });
      queryClient.removeQueries({ queryKey: ['admin'] });
    }
  }, [queryClient]);

  const value = useMemo<AuthValue>(
    () => ({ user, status, isAdmin: user?.role === 'admin', login, register, logout, setUser }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * Safe localStorage wrapper. Every read is try/catch-guarded and validated by
 * an optional type guard, so corrupted or tampered values fall back to
 * defaults instead of crashing the app.
 */

type Guard<T> = (value: unknown) => value is T;

const listeners = new Map<string, Set<() => void>>();

export function readStorage<T>(key: string, fallback: T, guard?: Guard<T>): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (guard && !guard(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Quota exceeded or storage disabled — app continues with in-memory state. */
  }
  listeners.get(key)?.forEach((fn) => fn());
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  listeners.get(key)?.forEach((fn) => fn());
}

/** Subscribe to changes of a key in this tab and other tabs. */
export function subscribeStorage(key: string, callback: () => void): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.get(key)?.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

export const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
export const isArray = <T,>(v: unknown): v is T[] => Array.isArray(v);
export const isObject = <T,>(v: unknown): v is T => typeof v === 'object' && v !== null && !Array.isArray(v);

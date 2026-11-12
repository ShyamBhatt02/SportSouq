import { useCallback, useRef, useSyncExternalStore } from 'react';
import { readStorage, subscribeStorage, writeStorage } from '@/utils/storage';

/**
 * Reactive, tab-synchronised localStorage state. Reads are validated by an
 * optional guard; the snapshot is cached by raw string so React sees stable
 * references between renders.
 */
export function useLocalStorage<T>(key: string, initial: T, guard?: (v: unknown) => v is T): [T, (next: T | ((prev: T) => T)) => void] {
  const cache = useRef<{ raw: string | null; value: T } | null>(null);

  const getSnapshot = useCallback((): T => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (cache.current && cache.current.raw === raw) return cache.current.value;
    const value = raw === null ? initial : readStorage(key, initial, guard);
    cache.current = { raw, value };
    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const value = useSyncExternalStore(
    useCallback((cb) => subscribeStorage(key, cb), [key]),
    getSnapshot,
    () => initial,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = getSnapshot();
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
      writeStorage(key, resolved);
    },
    [key, getSnapshot],
  );

  return [value, setValue];
}

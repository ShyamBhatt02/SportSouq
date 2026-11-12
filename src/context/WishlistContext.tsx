import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/config/site';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isStringArray } from '@/utils/storage';

interface WishlistValue {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  /** Returns true if the product was added, false if removed. */
  toggle: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useLocalStorage<string[]>(STORAGE_KEYS.wishlist, [], isStringArray);
  const set = useMemo(() => new Set(ids), [ids]);

  const has = useCallback((id: string) => set.has(id), [set]);
  const add = useCallback((id: string) => setIds((list) => (list.includes(id) ? list : [id, ...list].slice(0, 100))), [setIds]);
  const remove = useCallback((id: string) => setIds((list) => list.filter((x) => x !== id)), [setIds]);
  const toggle = useCallback(
    (id: string) => {
      const adding = !set.has(id);
      if (adding) add(id);
      else remove(id);
      return adding;
    },
    [set, add, remove],
  );
  const clear = useCallback(() => setIds([]), [setIds]);

  const value = useMemo(() => ({ ids, count: ids.length, has, toggle, add, remove, clear }), [ids, has, toggle, add, remove, clear]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}

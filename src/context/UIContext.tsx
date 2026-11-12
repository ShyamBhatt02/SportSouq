import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@/types';

interface UIValue {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickView: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const UIContext = createContext<UIValue | null>(null);

/** Transient UI state (drawers, modals). Deliberately not persisted. */
export function UIProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openQuickView = useCallback((p: Product) => setQuickView(p), []);
  const closeQuickView = useCallback(() => setQuickView(null), []);

  const value = useMemo(
    () => ({ cartOpen, openCart, closeCart, mobileNavOpen, setMobileNavOpen, searchOpen, setSearchOpen, quickView, openQuickView, closeQuickView }),
    [cartOpen, openCart, closeCart, mobileNavOpen, searchOpen, quickView, openQuickView, closeQuickView],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}

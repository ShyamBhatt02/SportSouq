import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CartItem, CouponValidation, OrderTotals, Product, ProductVariant } from '@/types';
import { FREE_DELIVERY_THRESHOLD, MAX_QTY_PER_LINE, STORAGE_KEYS, DELIVERY_METHODS } from '@/config/site';
import { cartKey, cartService, toCartItem } from '@/services/cartService';
import { couponService } from '@/services/couponService';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateTotals, itemCount, subtotalOf } from '@/utils/pricing';
import { normaliseCouponCode } from '@/utils/coupons';
import { isArray } from '@/utils/storage';
import { useAuth } from './AuthContext';

export type AddResult = { ok: true; quantity: number; capped: boolean } | { ok: false; reason: 'out-of-stock' | 'max-reached'; max: number };

interface CartValue {
  items: CartItem[];
  saved: CartItem[];
  count: number;
  subtotal: number;
  totals: OrderTotals;
  /** Standard delivery fee estimate before checkout. */
  estimatedDelivery: number;
  amountToFreeDelivery: number;
  couponCode: string | null;
  coupon: CouponValidation | null;
  couponLoading: boolean;
  add: (product: Product, variant: ProductVariant, quantity?: number) => AddResult;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => CartItem | undefined;
  restore: (item: CartItem) => void;
  clear: () => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  applyCoupon: (code: string) => Promise<CouponValidation>;
  removeCoupon: () => void;
  reconcile: () => Promise<string[]>;
  has: (productId: string) => boolean;
}

const CartContext = createContext<CartValue | null>(null);

const guardItems = (v: unknown): v is CartItem[] => isArray(v) && v.every((x) => typeof (x as CartItem)?.key === 'string');
const guardCode = (v: unknown): v is string | null => v === null || typeof v === 'string';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useLocalStorage<CartItem[]>(STORAGE_KEYS.cart, [], guardItems);
  const [saved, setSaved] = useLocalStorage<CartItem[]>(STORAGE_KEYS.savedForLater, [], guardItems);
  const [couponCode, setCouponCode] = useLocalStorage<string | null>(STORAGE_KEYS.coupon, null, guardCode);

  const signature = items.map((i) => i.key + 'x' + i.quantity).join('|');
  const couponQuery = useQuery({
    queryKey: ['coupon', couponCode, signature, user?.id ?? 'guest'],
    queryFn: () => couponService.validate(couponCode!, items, user?.email),
    enabled: !!couponCode && items.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const coupon = couponCode && items.length ? (couponQuery.data ?? null) : null;

  const subtotal = subtotalOf(items);
  const standard = DELIVERY_METHODS[0];
  const estimatedDelivery = items.length && subtotal < FREE_DELIVERY_THRESHOLD ? standard.fee : 0;
  const totals = useMemo(() => calculateTotals({ lines: items, deliveryFee: estimatedDelivery, coupon }), [items, estimatedDelivery, coupon]);

  const add = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1): AddResult => {
      const max = Math.min(variant.stock, MAX_QTY_PER_LINE);
      if (variant.stock <= 0) return { ok: false, reason: 'out-of-stock', max: 0 };
      const key = cartKey(product.id, variant.id);
      const existing = items.find((i) => i.key === key);
      const current = existing?.quantity ?? 0;
      if (current >= max) return { ok: false, reason: 'max-reached', max };
      const nextQty = Math.min(current + quantity, max);
      const nextItem = toCartItem(product, variant, nextQty);
      setItems((list) => (existing ? list.map((i) => (i.key === key ? nextItem : i)) : [nextItem, ...list]));
      return { ok: true, quantity: nextQty, capped: current + quantity > max };
    },
    [items, setItems],
  );

  const setQuantity = useCallback(
    (key: string, quantity: number) => {
      setItems((list) => list.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock, MAX_QTY_PER_LINE)) } : i)));
    },
    [setItems],
  );

  const remove = useCallback(
    (key: string) => {
      const item = items.find((i) => i.key === key);
      setItems((list) => list.filter((i) => i.key !== key));
      return item;
    },
    [items, setItems],
  );

  const restore = useCallback((item: CartItem) => setItems((list) => (list.some((i) => i.key === item.key) ? list : [item, ...list])), [setItems]);

  const clear = useCallback(() => {
    setItems([]);
    setCouponCode(null);
  }, [setItems, setCouponCode]);

  const saveForLater = useCallback(
    (key: string) => {
      const item = items.find((i) => i.key === key);
      if (!item) return;
      setItems((list) => list.filter((i) => i.key !== key));
      setSaved((list) => [item, ...list.filter((i) => i.key !== key)]);
    },
    [items, setItems, setSaved],
  );

  const moveToCart = useCallback(
    (key: string) => {
      const item = saved.find((i) => i.key === key);
      if (!item) return;
      setSaved((list) => list.filter((i) => i.key !== key));
      setItems((list) => {
        const existing = list.find((i) => i.key === key);
        if (existing) return list.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxStock, MAX_QTY_PER_LINE) } : i));
        return [item, ...list];
      });
    },
    [saved, setItems, setSaved],
  );

  const removeSaved = useCallback((key: string) => setSaved((list) => list.filter((i) => i.key !== key)), [setSaved]);

  const applyCoupon = useCallback(
    async (raw: string) => {
      const code = normaliseCouponCode(raw);
      const result = await couponService.validate(code, items, user?.email);
      if (result.status === 'valid') setCouponCode(code);
      return result;
    },
    [items, user?.email, setCouponCode],
  );

  const removeCoupon = useCallback(() => setCouponCode(null), [setCouponCode]);

  const reconcile = useCallback(async () => {
    const current = cartService.load();
    if (!current.length) return [];
    const { items: next, changed } = await cartService.refresh(current);
    if (changed.length) setItems(next);
    return changed;
  }, [setItems]);

  // Reconcile stock/prices once per session load.
  const reconciled = useRef(false);
  useEffect(() => {
    if (reconciled.current) return;
    reconciled.current = true;
    void reconcile().catch(() => undefined);
  }, [reconcile]);

  const has = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      saved,
      count: itemCount(items),
      subtotal,
      totals,
      estimatedDelivery,
      amountToFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal),
      couponCode,
      coupon,
      couponLoading: couponQuery.isFetching,
      add,
      setQuantity,
      remove,
      restore,
      clear,
      saveForLater,
      moveToCart,
      removeSaved,
      applyCoupon,
      removeCoupon,
      reconcile,
      has,
    }),
    [items, saved, subtotal, totals, estimatedDelivery, couponCode, coupon, couponQuery.isFetching, add, setQuantity, remove, restore, clear, saveForLater, moveToCart, removeSaved, applyCoupon, removeCoupon, reconcile, has],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

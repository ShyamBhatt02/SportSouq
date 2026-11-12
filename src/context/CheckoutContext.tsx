import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AddressInput, DeliveryMethodId, DeliveryQuote, OrderCustomer, OrderTotals, PaymentMethodId } from '@/types';
import { STORAGE_KEYS } from '@/config/site';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { calculateTotals } from '@/utils/pricing';
import { getDeliveryQuotes, isBulky } from '@/utils/delivery';
import { SEED_PRODUCTS } from '@/data/products';

export const CHECKOUT_STEPS = ['contact', 'address', 'delivery', 'payment', 'review', 'confirmation'] as const;
export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export interface CardMeta {
  brand: string;
  last4: string;
  holder: string;
}

interface CheckoutState {
  step: CheckoutStep;
  customer: OrderCustomer | null;
  address: AddressInput | null;
  addressId: string | null;
  saveAddress: boolean;
  deliveryMethod: DeliveryMethodId | null;
  paymentMethod: PaymentMethodId | null;
  /** Only non-sensitive card metadata is kept — never the PAN or CVV. */
  card: CardMeta | null;
  applePayAuthorised: boolean;
}

const INITIAL: CheckoutState = {
  step: 'contact',
  customer: null,
  address: null,
  addressId: null,
  saveAddress: true,
  deliveryMethod: null,
  paymentMethod: null,
  card: null,
  applePayAuthorised: false,
};

function load(): CheckoutState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.checkout);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<CheckoutState>;
    return { ...INITIAL, ...parsed, step: CHECKOUT_STEPS.includes(parsed.step as CheckoutStep) && parsed.step !== 'confirmation' ? (parsed.step as CheckoutStep) : 'contact' };
  } catch {
    return INITIAL;
  }
}

interface CheckoutValue extends CheckoutState {
  goTo: (step: CheckoutStep) => void;
  next: () => void;
  back: () => void;
  update: (patch: Partial<CheckoutState>) => void;
  reset: () => void;
  stepIndex: number;
  canVisit: (step: CheckoutStep) => boolean;
  quotes: DeliveryQuote[];
  selectedQuote: DeliveryQuote | undefined;
  totals: OrderTotals;
  hasBulky: boolean;
}

const CheckoutContext = createContext<CheckoutValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  const { user } = useAuth();
  const [state, setState] = useState<CheckoutState>(load);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEYS.checkout, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // Prefill contact details for signed-in shoppers.
  useEffect(() => {
    if (user && !state.customer) {
      setState((s) => ({ ...s, customer: { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone } }));
    }
  }, [user, state.customer]);

  const hasBulky = useMemo(() => cart.items.some((i) => {
    const p = SEED_PRODUCTS.find((x) => x.id === i.productId);
    return p ? isBulky(p) : false;
  }), [cart.items]);

  const freeDelivery = cart.coupon?.status === 'valid' && cart.coupon.freeDelivery;
  const quotes = useMemo(
    () => getDeliveryQuotes({ emirate: state.address?.emirate ?? 'dubai', subtotal: cart.subtotal, freeDelivery, hasBulky }),
    [state.address?.emirate, cart.subtotal, freeDelivery, hasBulky],
  );
  const selectedQuote = quotes.find((q) => q.method.id === state.deliveryMethod && q.available);

  const totals = useMemo(
    () =>
      calculateTotals({
        lines: cart.items,
        deliveryFee: selectedQuote?.fee ?? (cart.subtotal >= 200 ? 0 : 15),
        coupon: cart.coupon,
        paymentMethod: state.paymentMethod,
      }),
    [cart.items, cart.subtotal, cart.coupon, selectedQuote, state.paymentMethod],
  );

  const completed = useMemo(() => {
    const done: Record<CheckoutStep, boolean> = {
      contact: !!state.customer,
      address: !!state.address,
      delivery: !!selectedQuote,
      payment: state.paymentMethod === 'cod' || (state.paymentMethod === 'card' && !!state.card) || (state.paymentMethod === 'apple-pay' && state.applePayAuthorised),
      review: false,
      confirmation: false,
    };
    return done;
  }, [state, selectedQuote]);

  const canVisit = useCallback(
    (step: CheckoutStep) => {
      const idx = CHECKOUT_STEPS.indexOf(step);
      return CHECKOUT_STEPS.slice(0, idx).every((s) => completed[s]);
    },
    [completed],
  );

  const goTo = useCallback((step: CheckoutStep) => setState((s) => ({ ...s, step })), []);
  const stepIndex = CHECKOUT_STEPS.indexOf(state.step);

  // If a later step becomes invalid (e.g. emirate changed), fall back to the first incomplete step.
  useEffect(() => {
    if (!canVisit(state.step)) {
      const first = CHECKOUT_STEPS.find((s) => !completed[s]) ?? 'contact';
      setState((s) => ({ ...s, step: first }));
    }
  }, [canVisit, completed, state.step]);

  const value = useMemo<CheckoutValue>(
    () => ({
      ...state,
      stepIndex,
      goTo,
      next: () => setState((s) => ({ ...s, step: CHECKOUT_STEPS[Math.min(CHECKOUT_STEPS.indexOf(s.step) + 1, CHECKOUT_STEPS.length - 1)] })),
      back: () => setState((s) => ({ ...s, step: CHECKOUT_STEPS[Math.max(CHECKOUT_STEPS.indexOf(s.step) - 1, 0)] })),
      update: (patch) => setState((s) => ({ ...s, ...patch })),
      reset: () => {
        setState(INITIAL);
        try {
          window.sessionStorage.removeItem(STORAGE_KEYS.checkout);
        } catch {
          /* ignore */
        }
      },
      canVisit,
      quotes,
      selectedQuote,
      totals,
      hasBulky,
    }),
    [state, stepIndex, goTo, canVisit, quotes, selectedQuote, totals, hasBulky],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used inside <CheckoutProvider>');
  return ctx;
}

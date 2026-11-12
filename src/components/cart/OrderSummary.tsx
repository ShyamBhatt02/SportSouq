import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, Tag, X } from 'lucide-react';
import type { CouponValidation, OrderTotals } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useCoupons } from '@/hooks/queries';
import { useI18n } from '@/i18n/I18nProvider';
import { getErrorMessage } from '@/services/api/client';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/States';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

export function couponMessage(t: ReturnType<typeof useI18n>['t'], v: CouponValidation): string {
  switch (v.status) {
    case 'valid':
      return t.coupon.valid(v.coupon?.code ?? '');
    case 'min-not-reached':
      return t.coupon['min-not-reached'](formatPrice(v.shortfall ?? 0));
    case 'expired':
    case 'inactive':
    case 'invalid':
    case 'not-applicable':
    case 'first-order-only':
    case 'limit-reached':
      return t.coupon[v.status];
  }
}

/** Coupon entry with live validation states: valid / invalid / expired / min not reached / etc. */
export function CouponForm() {
  const { t } = useI18n();
  const cart = useCart();
  const toast = useToast();
  const offers = useCoupons();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CouponValidation | null>(null);
  const [pending, setPending] = useState(false);
  const [showOffers, setShowOffers] = useState(false);

  const apply = async (value = code) => {
    if (!value.trim()) return;
    setPending(true);
    try {
      const r = await cart.applyCoupon(value);
      setResult(r);
      if (r.status === 'valid') {
        toast.success(t.toast.couponApplied, { description: couponMessage(t, r) });
        setCode('');
      }
    } catch (err) {
      setResult(null);
      toast.error(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const applied = cart.coupon;
  if (cart.couponCode && applied) {
    const ok = applied.status === 'valid';
    return (
      <div className={cn('flex items-start justify-between gap-3 rounded-xl border px-3.5 py-3', ok ? 'border-success-500/30 bg-success-50 dark:bg-success-600/10' : 'border-warning-500/30 bg-warning-50 dark:bg-warning-500/10')}>
        <div className="flex items-start gap-2.5">
          <Tag className={cn('mt-0.5 h-4 w-4', ok ? 'text-success-600' : 'text-warning-600')} aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-fg">{cart.couponCode}</p>
            <p className={cn('text-xs', ok ? 'text-success-600' : 'text-warning-600')} role="status">
              {ok ? (applied.freeDelivery ? t.coupon.freeDelivery : applied.coupon?.description) : couponMessage(t, applied)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            cart.removeCoupon();
            setResult(null);
            toast.info(t.toast.couponRemoved);
          }}
          className="rounded-lg p-1 text-fg-subtle transition hover:bg-black/5 hover:text-fg"
          aria-label={t.cart.removeCoupon}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void apply();
        }}
      >
        <label htmlFor="coupon-code" className="sr-only">
          {t.cart.coupon}
        </label>
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            id="coupon-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20));
              setResult(null);
            }}
            placeholder={t.cart.couponPlaceholder}
            autoComplete="off"
            aria-invalid={result && result.status !== 'valid' ? true : undefined}
            aria-describedby={result ? 'coupon-feedback' : undefined}
            className="h-11 w-full rounded-xl border border-line-strong bg-surface ps-9 pe-3 text-sm font-semibold uppercase tracking-wide text-fg placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
          />
        </div>
        <Button type="submit" variant="secondary" loading={pending} disabled={!code}>
          {t.cart.applyCoupon}
        </Button>
      </form>
      <AnimatePresence>
        {result && result.status !== 'valid' && (
          <motion.div id="coupon-feedback" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <InlineAlert tone={result.status === 'min-not-reached' ? 'warning' : 'danger'} className="mt-2 py-2 text-xs">
              {couponMessage(t, result)}
            </InlineAlert>
          </motion.div>
        )}
      </AnimatePresence>
      {!!offers.data?.length && (
        <div className="mt-3">
          <button type="button" onClick={() => setShowOffers((v) => !v)} aria-expanded={showOffers} className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400">
            {t.cart.availableOffers} ({offers.data.length})
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showOffers && 'rotate-180')} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {showOffers && (
              <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2 overflow-hidden">
                {offers.data.map((o) => (
                  <li key={o.code} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-line-strong px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black tracking-wider text-fg">{o.code}</p>
                      <p className="truncate text-[11px] text-fg-muted">{o.description}</p>
                    </div>
                    <button type="button" onClick={() => void apply(o.code)} className="shrink-0 rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-bold text-fg hover:bg-surface-sunken">
                      {t.cart.applyCoupon}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface SummaryRowsProps {
  totals: OrderTotals;
  deliveryLabel?: ReactNode;
  couponCode?: string | null;
}

export function SummaryRows({ totals, deliveryLabel, couponCode }: SummaryRowsProps) {
  const { t } = useI18n();
  const row = 'flex items-center justify-between gap-3 text-sm';
  return (
    <dl className="space-y-2.5">
      <div className={row}>
        <dt className="text-fg-muted">{t.cart.subtotal}</dt>
        <dd className="font-semibold tabular-nums text-fg">{formatPrice(totals.subtotal, { decimals: true })}</dd>
      </div>
      {totals.discount > 0 && (
        <div className={row}>
          <dt className="flex items-center gap-1.5 text-success-600">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t.cart.discount}
            {couponCode && <span className="rounded bg-success-50 px-1.5 text-[10px] font-bold dark:bg-success-600/15">{couponCode}</span>}
          </dt>
          <dd className="font-semibold tabular-nums text-success-600">− {formatPrice(totals.discount, { decimals: true })}</dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-fg-muted">{deliveryLabel ?? t.cart.delivery}</dt>
        <dd className={cn('font-semibold tabular-nums', totals.delivery === 0 ? 'text-success-600' : 'text-fg')}>{totals.delivery === 0 ? t.cart.free : formatPrice(totals.delivery, { decimals: true })}</dd>
      </div>
      {totals.codFee > 0 && (
        <div className={row}>
          <dt className="text-fg-muted">{t.cart.codFee}</dt>
          <dd className="font-semibold tabular-nums text-fg">{formatPrice(totals.codFee, { decimals: true })}</dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-fg-muted">{t.cart.vat}</dt>
        <dd className="font-semibold tabular-nums text-fg">{formatPrice(totals.vat, { decimals: true })}</dd>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
        <dt className="text-base font-bold text-fg">{t.cart.total}</dt>
        <dd className="font-display text-xl font-extrabold tabular-nums text-fg">{formatPrice(totals.total, { decimals: true })}</dd>
      </div>
    </dl>
  );
}

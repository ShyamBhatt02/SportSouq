import { motion } from 'framer-motion';
import { Check, CircleCheck, Home, Package, PackageCheck, Truck, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Order, OrderStatus, PaymentStatus } from '@/types';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { ORDER_FLOW, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/utils/orderStatus';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  confirmed: 'info',
  processing: 'warning',
  shipped: 'info',
  'out-for-delivery': 'brand',
  delivered: 'success',
  cancelled: 'danger',
};

const PAYMENT_TONE: Record<PaymentStatus, BadgeTone> = { paid: 'success', pending: 'warning', refunded: 'neutral', failed: 'danger' };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_TONE[status]}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}

const STEP_ICONS: Record<Exclude<OrderStatus, 'cancelled'>, LucideIcon> = {
  confirmed: CircleCheck,
  processing: Package,
  shipped: Truck,
  'out-for-delivery': PackageCheck,
  delivered: Home,
};

/** Visual tracking timeline: Confirmed → Processing → Shipped → Out for Delivery → Delivered. */
export function OrderTimeline({ order }: { order: Order }) {
  const cancelled = order.status === 'cancelled';
  const reached = cancelled ? order.timeline.filter((e) => e.status !== 'cancelled').length - 1 : ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]);
  const eventFor = (s: OrderStatus) => order.timeline.find((e) => e.status === s);
  const cancelEvent = eventFor('cancelled');

  return (
    <div>
      {/* Horizontal progress (tablet+) */}
      <ol className="hidden items-start sm:flex" aria-label="Order progress">
        {ORDER_FLOW.map((s, i) => {
          const Icon = STEP_ICONS[s];
          const done = i <= reached;
          const current = i === reached && !cancelled;
          return (
            <li key={s} className="relative flex flex-1 flex-col items-center text-center">
              {i > 0 && (
                <span className="absolute end-1/2 top-5 -z-0 h-1 w-full -translate-y-1/2 rounded-full bg-line" aria-hidden="true">
                  <motion.span className={cn('block h-full rounded-full', cancelled ? 'bg-ink-300' : 'bg-success-500')} initial={{ width: 0 }} animate={{ width: done ? '100%' : '0%' }} transition={{ duration: 0.5, delay: i * 0.15 }} />
                </span>
              )}
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-surface',
                  done ? (cancelled ? 'bg-ink-400 text-white' : 'bg-success-600 text-white') : 'bg-surface-sunken text-fg-subtle',
                  current && 'ring-success-500/25',
                )}
              >
                {done && !current ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                {current && <span className="absolute inset-0 animate-ping rounded-full bg-success-500/30" aria-hidden="true" />}
              </motion.span>
              <span className={cn('mt-2 text-xs font-bold', done ? 'text-fg' : 'text-fg-subtle')}>{ORDER_STATUS_LABEL[s]}</span>
              <span className="mt-0.5 text-[11px] text-fg-subtle">{eventFor(s) ? formatDateTime(eventFor(s)!.at) : '—'}</span>
            </li>
          );
        })}
      </ol>

      {/* Vertical timeline (mobile + detailed notes) */}
      <ol className="mt-0 space-y-0 sm:mt-8" aria-label="Tracking history">
        {[...ORDER_FLOW.map((s) => ({ s, e: eventFor(s) })), ...(cancelEvent ? [{ s: 'cancelled' as OrderStatus, e: cancelEvent }] : [])].map(({ s, e }, i, arr) => {
          const Icon = s === 'cancelled' ? XCircle : STEP_ICONS[s as keyof typeof STEP_ICONS];
          const done = !!e;
          return (
            <li key={s} className={cn('relative flex gap-4 pb-6 last:pb-0', !done && 'sm:hidden')}>
              {i < arr.length - 1 && <span className={cn('absolute start-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5', done && arr[i + 1].e ? 'bg-success-500' : 'bg-line')} aria-hidden="true" />}
              <span className={cn('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full', s === 'cancelled' ? 'bg-danger-600 text-white' : done ? 'bg-success-600 text-white' : 'bg-surface-sunken text-fg-subtle')}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="pt-1.5">
                <p className={cn('text-sm font-bold', done ? 'text-fg' : 'text-fg-subtle')}>{ORDER_STATUS_LABEL[s]}</p>
                {e ? (
                  <>
                    <p className="text-xs text-fg-subtle">{formatDateTime(e.at)}</p>
                    <p className="mt-0.5 text-sm text-fg-muted">{e.note}</p>
                  </>
                ) : (
                  <p className="text-xs text-fg-subtle">Pending</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

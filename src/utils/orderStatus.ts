import type { Order, OrderStatus, OrderTimelineEvent, PaymentMethodId, PaymentStatus } from '@/types';

export const ORDER_FLOW: Exclude<OrderStatus, 'cancelled'>[] = ['confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered'];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_NOTE: Record<OrderStatus, string> = {
  confirmed: 'Order received and payment verified.',
  processing: 'Picking and packing at our Dubai fulfilment centre.',
  shipped: 'Handed to our courier partner and on its way.',
  'out-for-delivery': 'Your driver is on the way — expect a call before arrival.',
  delivered: 'Delivered. Enjoy your new gear!',
  cancelled: 'Order cancelled. Any payment has been refunded.',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending (COD)',
  refunded: 'Refunded',
  failed: 'Failed',
};

/** Typical hours between each step, used to backfill realistic timelines. */
const STEP_HOURS = [0, 3, 20, 14, 5];

export function buildTimeline(createdAt: string, status: OrderStatus): OrderTimelineEvent[] {
  const start = new Date(createdAt).getTime();
  const events: OrderTimelineEvent[] = [];
  const target = status === 'cancelled' ? 1 : ORDER_FLOW.indexOf(status);
  let t = start;
  for (let i = 0; i <= target; i++) {
    t += STEP_HOURS[i] * 3_600_000;
    events.push({ status: ORDER_FLOW[i], at: new Date(t).toISOString(), note: ORDER_STATUS_NOTE[ORDER_FLOW[i]] });
  }
  if (status === 'cancelled') {
    events.push({ status: 'cancelled', at: new Date(t + 2 * 3_600_000).toISOString(), note: ORDER_STATUS_NOTE.cancelled });
  }
  return events;
}

/** Appends a status change to an existing timeline (used by admin updates). */
export function advanceTimeline(order: Order, next: OrderStatus): OrderTimelineEvent[] {
  if (next === 'cancelled') {
    return [...order.timeline.filter((e) => e.status !== 'cancelled'), { status: 'cancelled', at: new Date().toISOString(), note: ORDER_STATUS_NOTE.cancelled }];
  }
  const idx = ORDER_FLOW.indexOf(next);
  const kept = order.timeline.filter((e) => e.status !== 'cancelled' && ORDER_FLOW.indexOf(e.status as (typeof ORDER_FLOW)[number]) <= idx);
  const existing = new Set(kept.map((e) => e.status));
  const now = Date.now();
  const missing = ORDER_FLOW.slice(0, idx + 1).filter((s) => !existing.has(s));
  return [
    ...kept,
    ...missing.map((s, i) => ({ status: s, at: new Date(now - (missing.length - 1 - i) * 60_000).toISOString(), note: ORDER_STATUS_NOTE[s] })),
  ];
}

export function paymentStatusFor(method: PaymentMethodId, status: OrderStatus): PaymentStatus {
  if (status === 'cancelled') return method === 'cod' ? 'failed' : 'refunded';
  if (method === 'cod') return status === 'delivered' ? 'paid' : 'pending';
  return 'paid';
}

export function canCancel(order: Order): boolean {
  return order.status === 'confirmed' || order.status === 'processing';
}

export function orderNumber(date: Date, seq: number): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return 'SS-' + y + m + d + '-' + String(seq).padStart(4, '0');
}

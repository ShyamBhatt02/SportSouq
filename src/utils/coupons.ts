import type { CartItem, Coupon, CouponValidation, OrderItem } from '@/types';
import { round2 } from './pricing';

export interface CouponContext {
  subtotal: number;
  items: Pick<CartItem | OrderItem, 'sport' | 'price' | 'quantity'>[];
  isFirstOrder: boolean;
  now?: Date;
}

export function normaliseCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
}

/** Pure coupon rule engine (mirrors what a backend would enforce). */
export function evaluateCoupon(coupon: Coupon | undefined, ctx: CouponContext): CouponValidation {
  const none = { discount: 0, freeDelivery: false };
  if (!coupon) return { status: 'invalid', ...none };
  const now = ctx.now ?? new Date();
  if (!coupon.active) return { status: 'inactive', coupon, ...none };
  if (new Date(coupon.expiresAt).getTime() < now.getTime()) return { status: 'expired', coupon, ...none };
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) return { status: 'limit-reached', coupon, ...none };
  if (coupon.firstOrderOnly && !ctx.isFirstOrder) return { status: 'first-order-only', coupon, ...none };

  const eligibleSubtotal = coupon.sports?.length
    ? round2(ctx.items.filter((i) => coupon.sports!.includes(i.sport)).reduce((s, i) => s + i.price * i.quantity, 0))
    : ctx.subtotal;

  if (coupon.sports?.length && eligibleSubtotal === 0) return { status: 'not-applicable', coupon, ...none };
  if (ctx.subtotal < coupon.minOrder) {
    return { status: 'min-not-reached', coupon, ...none, shortfall: round2(coupon.minOrder - ctx.subtotal) };
  }

  let discount = 0;
  if (coupon.type === 'percentage') discount = round2((eligibleSubtotal * coupon.value) / 100);
  if (coupon.type === 'fixed') discount = Math.min(coupon.value, eligibleSubtotal);
  if (coupon.maxDiscount !== undefined) discount = Math.min(discount, coupon.maxDiscount);

  return { status: 'valid', coupon, discount: round2(discount), freeDelivery: coupon.type === 'free-delivery' };
}

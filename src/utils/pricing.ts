import { COD_FEE, VAT_RATE } from '@/config/site';
import type { CouponValidation, OrderTotals, PaymentMethodId } from '@/types';

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface PricedLine {
  price: number;
  quantity: number;
}

export function subtotalOf(lines: PricedLine[]): number {
  return round2(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
}

export function itemCount(lines: { quantity: number }[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function discountPercent(price: number, original: number): number {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

/** VAT is calculated on the taxable amount (goods after discount + delivery + fees). */
export function calculateVat(taxable: number, rate = VAT_RATE): number {
  return round2(Math.max(0, taxable) * rate);
}

export interface TotalsInput {
  lines: PricedLine[];
  deliveryFee: number;
  coupon?: CouponValidation | null;
  paymentMethod?: PaymentMethodId | null;
}

/** Single source of truth for basket maths — used by cart, checkout, order creation and seeds. */
export function calculateTotals({ lines, deliveryFee, coupon, paymentMethod }: TotalsInput): OrderTotals {
  const subtotal = subtotalOf(lines);
  const valid = coupon?.status === 'valid';
  const discount = valid ? Math.min(round2(coupon.discount), subtotal) : 0;
  const delivery = valid && coupon.freeDelivery ? 0 : round2(deliveryFee);
  const codFee = paymentMethod === 'cod' ? COD_FEE : 0;
  const vat = calculateVat(subtotal - discount + delivery + codFee);
  const total = round2(subtotal - discount + delivery + codFee + vat);
  return { subtotal, discount, delivery, codFee, vat, total };
}

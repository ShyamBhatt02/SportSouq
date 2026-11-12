import { DELIVERY_METHODS, SAME_DAY_CUTOFF_HOUR, getEmirate } from '@/config/site';
import type { DeliveryMethodId, DeliveryQuote, EmirateCode, Product } from '@/types';
import { formatDay } from './format';

const HOUR = 3_600_000;

/** Current hour in Dubai (UTC+4, no DST). */
export function dubaiHour(now = new Date()): number {
  return new Date(now.getTime() + 4 * HOUR).getUTCHours();
}

/** Adds business days; the courier network operates Monday–Saturday (no Sunday deliveries). */
export function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) added++;
  }
  if (days === 0 && date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date;
}

function rangeLabel(from: Date, to: Date, now: Date): string {
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const name = (d: Date) => (sameDay(d, now) ? 'Today' : sameDay(d, tomorrow) ? 'Tomorrow' : formatDay(d));
  return sameDay(from, to) ? name(from) : name(from) + ' – ' + name(to);
}

export interface QuoteOptions {
  emirate: EmirateCode;
  subtotal: number;
  freeDelivery?: boolean;
  hasBulky?: boolean;
  now?: Date;
}

export function getDeliveryQuotes({ emirate, subtotal, freeDelivery = false, hasBulky = false, now = new Date() }: QuoteOptions): DeliveryQuote[] {
  const em = getEmirate(emirate);
  const afterCutoff = dubaiHour(now) >= SAME_DAY_CUTOFF_HOUR;
  return DELIVERY_METHODS.map((method) => {
    let fromDays: number;
    let toDays: number;
    let available = true;
    let reason: string | undefined;
    if (method.id === 'standard') {
      [fromDays, toDays] = em.standardDays;
      if (hasBulky) {
        fromDays = Math.max(fromDays, 2);
        toDays = Math.max(toDays, 4);
      }
    } else if (method.id === 'express') {
      fromDays = toDays = em.expressDays;
      if (hasBulky) {
        available = false;
        reason = 'Not available for large items';
      }
    } else {
      fromDays = toDays = 0;
      if (!em.sameDay) {
        available = false;
        reason = 'Same-day delivery is available in Dubai only';
      } else if (hasBulky) {
        available = false;
        reason = 'Not available for large items';
      } else if (afterCutoff) {
        available = false;
        reason = 'Order before 14:00 for same-day delivery';
      }
    }
    const from = addBusinessDays(now, fromDays);
    const to = addBusinessDays(now, toDays);
    const isFree = freeDelivery || (method.freeAbove !== null && subtotal >= method.freeAbove);
    return {
      method,
      available,
      reason,
      fee: isFree ? 0 : method.fee,
      estimatedFrom: from.toISOString(),
      estimatedTo: to.toISOString(),
      label: rangeLabel(from, to, now),
    };
  });
}

export function getDeliveryQuote(id: DeliveryMethodId, opts: QuoteOptions): DeliveryQuote {
  return getDeliveryQuotes(opts).find((q) => q.method.id === id) ?? getDeliveryQuotes(opts)[0];
}

export function isBulky(product: Pick<Product, 'deliveryEstimate'>): boolean {
  return product.deliveryEstimate.startsWith('2–4');
}

/** Product-page estimate for a chosen emirate. */
export function getProductDeliveryMessage(product: Product, emirate: EmirateCode, now = new Date()) {
  const em = getEmirate(emirate);
  if (!product.availableEmirates.includes(emirate)) {
    return { available: false, headline: 'Not available in ' + em.name, detail: 'This large item can’t currently be delivered to ' + em.name + '.' };
  }
  const bulky = isBulky(product);
  const quotes = getDeliveryQuotes({ emirate, subtotal: product.price, hasBulky: bulky, now });
  const sameDay = quotes.find((q) => q.method.id === 'same-day');
  if (sameDay?.available) {
    return { available: true, headline: 'Get it today', detail: 'Order in the next ' + hoursLeftLabel(now) + ' for same-day delivery in Dubai.' };
  }
  const best = quotes.filter((q) => q.available).sort((a, b) => a.estimatedFrom.localeCompare(b.estimatedFrom))[0];
  return {
    available: true,
    headline: 'Delivery ' + best.label,
    detail: best.method.name + ' to ' + em.name + (bulky ? ' · two-person delivery' : '') + '.',
  };
}

function hoursLeftLabel(now: Date): string {
  const minutesLeft = (SAME_DAY_CUTOFF_HOUR - dubaiHour(now)) * 60 - new Date(now.getTime() + 4 * HOUR).getUTCMinutes();
  const h = Math.floor(minutesLeft / 60);
  const m = minutesLeft % 60;
  return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
}

import type { DeliveryMethod, Emirate, EmirateCode, PaymentMethod } from '@/types';

export const SITE = {
  name: 'SportSouq',
  tagline: 'Gear Up. Play Better.',
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'http://localhost:5173',
  supportEmail: 'care@sportsouq.ae',
  supportPhone: '+971 4 555 0123',
  whatsapp: '+971 50 555 0123',
  address: 'Office 1204, Al Quoz Business Centre, Al Quoz 3, Dubai, UAE',
  hours: 'Mon–Sat, 9:00–21:00 GST',
  currency: 'AED',
  locale: 'en-AE',
  timezone: 'Asia/Dubai',
} as const;

/** UAE VAT is 5%. Kept in one place so tax rules can change without touching UI. */
export const VAT_RATE = 0.05;
export const FREE_DELIVERY_THRESHOLD = 200;
export const COD_FEE = 10;
export const SAME_DAY_CUTOFF_HOUR = 14;
export const LOW_STOCK_DEFAULT = 8;
export const MAX_QTY_PER_LINE = 10;

export const EMIRATES: Emirate[] = [
  { code: 'dubai', name: 'Dubai', standardDays: [1, 1], expressDays: 1, sameDay: true, cities: ['Dubai', 'Hatta', 'Jebel Ali'] },
  { code: 'abu-dhabi', name: 'Abu Dhabi', standardDays: [1, 2], expressDays: 1, sameDay: false, cities: ['Abu Dhabi', 'Al Ain', 'Ruwais', 'Madinat Zayed'] },
  { code: 'sharjah', name: 'Sharjah', standardDays: [1, 2], expressDays: 1, sameDay: false, cities: ['Sharjah', 'Khor Fakkan', 'Kalba', 'Dibba Al Hisn'] },
  { code: 'ajman', name: 'Ajman', standardDays: [2, 3], expressDays: 1, sameDay: false, cities: ['Ajman', 'Masfout', 'Manama'] },
  { code: 'ras-al-khaimah', name: 'Ras Al Khaimah', standardDays: [2, 3], expressDays: 2, sameDay: false, cities: ['Ras Al Khaimah', 'Al Jazirah Al Hamra', 'Khatt'] },
  { code: 'fujairah', name: 'Fujairah', standardDays: [2, 3], expressDays: 2, sameDay: false, cities: ['Fujairah', 'Dibba Al Fujairah', 'Masafi'] },
  { code: 'umm-al-quwain', name: 'Umm Al Quwain', standardDays: [2, 3], expressDays: 2, sameDay: false, cities: ['Umm Al Quwain', 'Falaj Al Mualla'] },
];

export const EMIRATE_CODES = EMIRATES.map((e) => e.code) as EmirateCode[];

export function getEmirate(code: EmirateCode | string | undefined): Emirate {
  return EMIRATES.find((e) => e.code === code) ?? EMIRATES[0];
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  { id: 'standard', name: 'Standard Delivery', description: 'Tracked delivery to your door', fee: 15, freeAbove: FREE_DELIVERY_THRESHOLD },
  { id: 'express', name: 'Express Delivery', description: 'Priority dispatch — next business day in most emirates', fee: 30, freeAbove: null },
  { id: 'same-day', name: 'Same-Day Delivery', description: 'Order before 14:00 and receive it tonight by 22:00', fee: 45, freeAbove: null },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card', name: 'Credit / Debit Card', description: 'Visa, Mastercard, American Express', fee: 0 },
  { id: 'apple-pay', name: 'Apple Pay', description: 'Fast, secure checkout with Face ID or Touch ID', fee: 0 },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay in cash or by card at your door (AED 10 handling fee)', fee: COD_FEE },
];

/** UAE mobile (05X XXX XXXX) and landline formats, with optional +971 / 00971 / 0 prefix. */
export const UAE_PHONE_REGEX = /^(?:\+971|00971|0)?(?:5[0-9]\d{7}|[2-9]\d{7})$/;

export const STORAGE_KEYS = {
  db: 'ss.db.v1',
  session: 'ss.session',
  cart: 'ss.cart',
  savedForLater: 'ss.saved',
  coupon: 'ss.coupon',
  wishlist: 'ss.wishlist',
  recentlyViewed: 'ss.recent',
  recentSearches: 'ss.searches',
  preferences: 'ss.preferences',
  checkout: 'ss.checkout',
} as const;

import type { DeliveryMethodId, Order, OrderItem, OrderStatus, PaymentMethodId, Product } from '@/types';
import { DELIVERY_METHODS, PAYMENT_METHODS, getEmirate } from '@/config/site';
import { createRng, randInt } from '@/utils/random';
import { calculateTotals } from '@/utils/pricing';
import { buildTimeline, orderNumber, paymentStatusFor } from '@/utils/orderStatus';
import { addBusinessDays } from '@/utils/delivery';
import type { SeedCustomer } from './customers';
import { SEED_ADDRESSES, SEED_USERS, TEST_USER_ID } from './users';

const DAY = 86_400_000;
const AREAS: Record<string, string[]> = {
  dubai: ['Jumeirah Village Circle', 'Downtown Dubai', 'Al Barsha', 'Business Bay', 'Mirdif', 'Dubai Silicon Oasis', 'Arabian Ranches'],
  'abu-dhabi': ['Khalifa City', 'Al Reem Island', 'Yas Island', 'Al Khalidiyah', 'Mohammed Bin Zayed City'],
  sharjah: ['Al Nahda', 'Al Majaz', 'Muwaileh', 'Al Khan'],
  ajman: ['Al Nuaimiya', 'Al Rashidiya', 'Emirates City'],
  'ras-al-khaimah': ['Al Hamra Village', 'Al Nakheel', 'Mina Al Arab'],
  fujairah: ['Al Faseel', 'Merashid'],
  'umm-al-quwain': ['Al Salamah', 'Al Raas'],
};

function statusForAge(ageDays: number, rng: () => number): OrderStatus {
  if (rng() < 0.04 && ageDays > 1) return 'cancelled';
  if (ageDays > 6) return 'delivered';
  if (ageDays > 3) return rng() < 0.7 ? 'delivered' : 'out-for-delivery';
  if (ageDays > 1.5) return rng() < 0.5 ? 'shipped' : 'out-for-delivery';
  if (ageDays > 0.4) return 'processing';
  return 'confirmed';
}

function pickWeighted(products: Product[], cumulative: number[], rng: () => number): Product {
  const r = rng() * cumulative[cumulative.length - 1];
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  return products[lo];
}

function toItem(p: Product, rng: () => number, qty: number): OrderItem {
  const variant = p.variants[Math.floor(rng() * p.variants.length)];
  return {
    productId: p.id,
    variantId: variant.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    image: variant.image,
    sku: variant.sku,
    sport: p.sport,
    category: p.category,
    attributes: variant.attributes,
    price: variant.price,
    quantity: qty,
  };
}

interface Draft {
  id: string;
  seq: number;
  createdAt: Date;
  userId: string | null;
  customer: Order['customer'];
  address: Order['address'];
  items: OrderItem[];
  method: DeliveryMethodId;
  payment: PaymentMethodId;
  status: OrderStatus;
  coupon?: string;
}

function finalise(d: Draft): Order {
  const methodDef = DELIVERY_METHODS.find((m) => m.id === d.method)!;
  const lines = d.items;
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const fee = methodDef.freeAbove !== null && subtotal >= methodDef.freeAbove ? 0 : methodDef.fee;
  const couponDiscount = d.coupon === 'SAVE50' ? 50 : d.coupon === 'WELCOME10' ? Math.min(150, subtotal * 0.1) : 0;
  const totals = calculateTotals({
    lines,
    deliveryFee: fee,
    paymentMethod: d.payment,
    coupon: d.coupon ? { status: 'valid', discount: couponDiscount, freeDelivery: d.coupon === 'UAEFREE' } : null,
  });
  const em = getEmirate(d.address.emirate);
  const [minDays, maxDays] = d.method === 'same-day' ? [0, 0] : d.method === 'express' ? [em.expressDays, em.expressDays] : em.standardDays;
  const paymentDef = PAYMENT_METHODS.find((p) => p.id === d.payment)!;
  return {
    id: d.id,
    number: orderNumber(d.createdAt, d.seq),
    userId: d.userId,
    customer: d.customer,
    items: d.items,
    address: d.address,
    delivery: {
      method: d.method,
      name: methodDef.name,
      estimatedFrom: addBusinessDays(d.createdAt, minDays).toISOString(),
      estimatedTo: addBusinessDays(d.createdAt, maxDays).toISOString(),
    },
    payment: {
      method: d.payment,
      label: paymentDef.name,
      cardBrand: d.payment === 'card' ? (d.seq % 3 === 0 ? 'Mastercard' : 'Visa') : undefined,
      cardLast4: d.payment === 'card' ? String(1000 + ((d.seq * 7919) % 9000)) : undefined,
      transactionId: d.payment === 'cod' ? undefined : 'txn_' + (d.seq * 104729).toString(36),
    },
    paymentStatus: paymentStatusFor(d.payment, d.status),
    status: d.status,
    couponCode: d.coupon,
    totals,
    timeline: buildTimeline(d.createdAt.toISOString(), d.status),
    createdAt: d.createdAt.toISOString(),
    trackingNumber: d.status === 'confirmed' || d.status === 'processing' ? undefined : 'AE' + String(80000000 + d.seq * 37),
  };
}

/** Deterministic historical orders (≈12 months) so analytics, customers and stock tell one consistent story. */
export function generateOrders(products: Product[], customers: SeedCustomer[], now = Date.now()): Order[] {
  const rng = createRng(777);
  const published = products.filter((p) => p.status === 'published');
  const cumulative: number[] = [];
  published.reduce((acc, p, i) => (cumulative[i] = acc + Math.sqrt(p.salesCount + 10)), 0);

  const orders: Order[] = [];
  let seq = 1000;
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);

  for (let daysAgo = 364; daysAgo >= 0; daysAgo--) {
    const day = new Date(today.getTime() - daysAgo * DAY);
    const month = day.getUTCMonth();
    const growth = 0.55 + (0.6 * (364 - daysAgo)) / 364;
    const season = month >= 10 || month <= 2 ? 1.25 : month >= 5 && month <= 7 ? 0.8 : 1;
    const weekday = day.getUTCDay();
    const weekend = weekday === 5 || weekday === 6 ? 1.2 : 1;
    const lambda = 3.4 * growth * season * weekend;
    const count = Math.max(0, Math.round(lambda + (rng() - 0.5) * 3));
    for (let k = 0; k < count; k++) {
      const createdAt = new Date(day.getTime() + randInt(rng, 6 * 3600, 23 * 3600) * 1000);
      if (createdAt.getTime() > now) continue;
      const eligible = customers.filter((c) => new Date(c.registeredAt) <= createdAt);
      if (!eligible.length) continue;
      const c = eligible[Math.floor(Math.pow(rng(), 0.8) * eligible.length)];
      const lines = rng() < 0.62 ? 1 : rng() < 0.75 ? 2 : 3;
      const chosen = new Map<string, OrderItem>();
      for (let l = 0; l < lines; l++) {
        const p = pickWeighted(published, cumulative, rng);
        if (!chosen.has(p.id)) chosen.set(p.id, toItem(p, rng, rng() < 0.82 ? 1 : 2));
      }
      const [first, ...rest] = c.name.split(' ');
      const areas = AREAS[c.emirate];
      const r = rng();
      const payment: PaymentMethodId = r < 0.55 ? 'card' : r < 0.75 ? 'apple-pay' : 'cod';
      const m = rng();
      const method: DeliveryMethodId = c.emirate === 'dubai' && m < 0.25 ? 'same-day' : m < 0.7 ? 'standard' : 'express';
      const ageDays = (now - createdAt.getTime()) / DAY;
      const couponRoll = rng();
      orders.push(
        finalise({
          id: 'o-' + seq,
          seq: seq++,
          createdAt,
          userId: c.id,
          customer: { firstName: first, lastName: rest.join(' '), email: c.email, phone: c.phone },
          address: {
            fullName: c.name,
            phone: c.phone,
            emirate: c.emirate,
            city: getEmirate(c.emirate).cities[0],
            area: areas[Math.floor(rng() * areas.length)],
            building: 'Building ' + randInt(rng, 1, 48),
            unit: 'Apt ' + randInt(rng, 101, 2405),
            street: 'Street ' + randInt(rng, 1, 60),
            label: rng() < 0.8 ? 'home' : 'office',
          },
          items: Array.from(chosen.values()),
          method,
          payment,
          status: statusForAge(ageDays, rng),
          coupon: couponRoll < 0.06 ? 'SAVE50' : couponRoll < 0.1 ? 'UAEFREE' : undefined,
        }),
      );
    }
  }
  return [...orders, ...testUserOrders(products, now)];
}

/** Hand-crafted order history for the test account, covering every tracking state. */
function testUserOrders(products: Product[], now: number): Order[] {
  const user = SEED_USERS.find((u) => u.id === TEST_USER_ID)!;
  const home = SEED_ADDRESSES[0];
  const office = SEED_ADDRESSES[1];
  const by = (slugPart: string) => products.find((p) => p.slug.includes(slugPart))!;
  const rng = createRng(4242);
  const customer = { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone };
  const addr = (a: typeof home) => ({
    fullName: a.fullName, phone: a.phone, emirate: a.emirate, city: a.city, area: a.area, building: a.building,
    unit: a.unit, street: a.street, landmark: a.landmark, label: a.label,
  });
  const specs: { days: number; status: OrderStatus; slugs: string[]; method: DeliveryMethodId; pay: PaymentMethodId; office?: boolean; coupon?: string }[] = [
    { days: 0.08, status: 'processing', slugs: ['air-zoom-pegasus-41', 'kiprun-insulated-bottle'], method: 'same-day', pay: 'card' },
    { days: 1.6, status: 'out-for-delivery', slugs: ['forerunner-265'], method: 'standard', pay: 'apple-pay', office: true },
    { days: 1.3, status: 'shipped', slugs: ['premium-yoga-mat', 'resistance-band-set'], method: 'standard', pay: 'cod' },
    { days: 24, status: 'delivered', slugs: ['dri-fit-legend-training-tee', 'one-high-waisted-leggings'], method: 'standard', pay: 'card', coupon: 'WELCOME10' },
    { days: 61, status: 'cancelled', slugs: ['pro-staff-97'], method: 'express', pay: 'card' },
    { days: 118, status: 'delivered', slugs: ['domyos-hex-dumbbell-pair', 'speed-rope'], method: 'standard', pay: 'apple-pay' },
  ];
  return specs.map((s, i) => {
    const createdAt = new Date(now - s.days * DAY);
    return finalise({
      id: 'o-test-' + (i + 1),
      seq: 9000 + i,
      createdAt,
      userId: TEST_USER_ID,
      customer,
      address: addr(s.office ? office : home),
      items: s.slugs.map((slug) => toItem(by(slug), rng, 1)),
      method: s.method,
      payment: s.pay,
      status: s.status,
      coupon: s.coupon,
    });
  });
}

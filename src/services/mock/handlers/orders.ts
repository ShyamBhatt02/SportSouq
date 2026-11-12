import type { Coupon, DeliveryMethodId, Order, OrderItem, PaymentMethodId, Product, StoredUser } from '@/types';
import { addressSchema, customerInfoSchema } from '@/schemas';
import { PAYMENT_METHODS, getEmirate } from '@/config/site';
import { calculateTotals } from '@/utils/pricing';
import { evaluateCoupon, normaliseCouponCode } from '@/utils/coupons';
import { getDeliveryQuote, isBulky } from '@/utils/delivery';
import { buildTimeline, canCancel, orderNumber, paymentStatusFor, advanceTimeline } from '@/utils/orderStatus';
import { formatPhone, formatPrice } from '@/utils/format';
import { sanitizeSingleLine } from '@/utils/sanitize';
import { uid } from '@/utils/random';
import { db } from '../db';
import { ApiError, currentUser, requireUser, route, str, type RequestContext } from '../router';

/** Mock COD limit, common for UAE retailers. */
const COD_LIMIT = 3000;
/** Test card that always declines (documented in README). */
const DECLINE_CARD_LAST4 = '0002';

interface LineInput {
  productId: string;
  variantId: string;
  quantity: number;
}

function parseLines(raw: unknown): LineInput[] {
  if (!Array.isArray(raw) || !raw.length) throw new ApiError(400, 'Your bag is empty.', 'empty_cart');
  if (raw.length > 50) throw new ApiError(400, 'Too many items in one order.', 'too_many');
  return raw.map((r) => {
    const o = (r ?? {}) as Record<string, unknown>;
    const quantity = Number(o.quantity);
    if (typeof o.productId !== 'string' || typeof o.variantId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new ApiError(400, 'Invalid item in bag.', 'invalid_item');
    }
    return { productId: o.productId, variantId: o.variantId, quantity };
  });
}

function priceLines(lines: LineInput[]): { items: OrderItem[]; products: Product[] } {
  const all = db.products();
  const products: Product[] = [];
  const items = lines.map((l) => {
    const p = all.find((x) => x.id === l.productId && x.status === 'published');
    const v = p?.variants.find((x) => x.id === l.variantId);
    if (!p || !v) throw new ApiError(409, 'An item in your bag is no longer available. Please remove it and try again.', 'unavailable');
    if (v.stock < l.quantity) {
      throw new ApiError(409, v.stock === 0 ? p.name + ' is now out of stock.' : 'Only ' + v.stock + ' left of ' + p.name + '. Please update the quantity.', 'insufficient_stock');
    }
    products.push(p);
    return {
      productId: p.id, variantId: v.id, slug: p.slug, name: p.name, brand: p.brand, image: v.image, sku: v.sku,
      sport: p.sport, category: p.category, attributes: v.attributes, price: v.price, quantity: l.quantity,
    };
  });
  return { items, products };
}

function isFirstOrder(user: StoredUser | null, email: string): boolean {
  return !db.orders().some((o) => (user && o.userId === user.id) || o.customer.email === email);
}

function findCoupon(code: string): Coupon | undefined {
  const c = normaliseCouponCode(code);
  return db.coupons().find((x) => x.code === c);
}

route('POST', '/coupons/validate', (ctx) => {
  const user = currentUser(ctx);
  const lines = parseLines(ctx.body.items);
  const { items } = priceLines(lines.map((l) => ({ ...l, quantity: Math.min(l.quantity, 10) })));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const email = user?.email ?? str(ctx.body, 'email', 120).toLowerCase();
  return evaluateCoupon(findCoupon(str(ctx.body, 'code', 40)), { subtotal, items, isFirstOrder: isFirstOrder(user, email) });
});

route('GET', '/coupons/available', () => {
  const now = Date.now();
  return db
    .coupons()
    .filter((c) => c.active && new Date(c.expiresAt).getTime() > now && (c.usageLimit === undefined || c.usedCount < c.usageLimit))
    .map(({ code, description, minOrder, type, value, firstOrderOnly, sports, expiresAt }) => ({ code, description, minOrder, type, value, firstOrderOnly, sports, expiresAt }));
});

route('POST', '/orders', (ctx) => {
  const user = currentUser(ctx);
  const customer = customerInfoSchema.safeParse(ctx.body.customer);
  if (!customer.success) throw new ApiError(422, 'Please check your contact details.', 'validation');
  const address = addressSchema.safeParse({ ...(ctx.body.address as object), isDefault: false });
  if (!address.success) throw new ApiError(422, 'Please check your delivery address.', 'validation');
  const method = str(ctx.body, 'deliveryMethod') as DeliveryMethodId;
  const paymentRaw = (ctx.body.payment ?? {}) as Record<string, unknown>;
  const paymentMethod = String(paymentRaw.method) as PaymentMethodId;
  const paymentDef = PAYMENT_METHODS.find((p) => p.id === paymentMethod);
  if (!paymentDef) throw new ApiError(400, 'Choose a payment method.', 'payment_method');

  const { items, products } = priceLines(parseLines(ctx.body.items));
  const emirate = address.data.emirate;
  const blocked = products.find((p) => !p.availableEmirates.includes(emirate));
  if (blocked) throw new ApiError(400, blocked.name + ' can’t be delivered to ' + getEmirate(emirate).name + '.', 'emirate_unavailable');

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const couponCode = str(ctx.body, 'couponCode', 40);
  const coupon = couponCode
    ? evaluateCoupon(findCoupon(couponCode), { subtotal, items, isFirstOrder: isFirstOrder(user, customer.data.email) })
    : null;
  if (coupon && coupon.status !== 'valid') throw new ApiError(400, 'Your coupon is no longer valid. Please remove it and try again.', 'coupon_invalid');

  const quote = getDeliveryQuote(method, { emirate, subtotal, freeDelivery: coupon?.freeDelivery, hasBulky: products.some(isBulky) });
  if (!quote.available || quote.method.id !== method) throw new ApiError(400, quote.reason ?? 'That delivery option is unavailable.', 'delivery_unavailable');

  const totals = calculateTotals({ lines: items, deliveryFee: quote.fee, coupon, paymentMethod });

  // ---- Mock payment processing (no real card data ever reaches this layer) ----
  const last4 = typeof paymentRaw.cardLast4 === 'string' ? paymentRaw.cardLast4.replace(/\D/g, '').slice(-4) : undefined;
  if (paymentMethod === 'card') {
    if (!last4 || last4.length !== 4) throw new ApiError(400, 'Card details are incomplete.', 'card_invalid');
    if (last4 === DECLINE_CARD_LAST4) throw new ApiError(402, 'Your card was declined by the issuing bank. Please try another card or payment method.', 'card_declined');
  }
  if (paymentMethod === 'cod' && totals.total > COD_LIMIT) {
    throw new ApiError(400, 'Cash on Delivery is available for orders up to ' + formatPrice(COD_LIMIT) + '. Please pay by card or Apple Pay.', 'cod_limit');
  }

  const now = new Date();
  const order: Order = {
    id: uid('o-'),
    number: orderNumber(now, db.nextOrderSeq()),
    userId: user?.id ?? null,
    customer: {
      firstName: sanitizeSingleLine(customer.data.firstName, 40),
      lastName: sanitizeSingleLine(customer.data.lastName, 40),
      email: customer.data.email,
      phone: formatPhone(customer.data.phone),
    },
    items,
    address: {
      fullName: sanitizeSingleLine(address.data.fullName, 80),
      phone: formatPhone(address.data.phone),
      emirate,
      city: sanitizeSingleLine(address.data.city, 80),
      area: sanitizeSingleLine(address.data.area, 80),
      building: sanitizeSingleLine(address.data.building, 80),
      unit: sanitizeSingleLine(address.data.unit, 20),
      street: sanitizeSingleLine(address.data.street, 80),
      landmark: address.data.landmark ? sanitizeSingleLine(address.data.landmark, 80) : undefined,
      label: address.data.label,
    },
    delivery: { method, name: quote.method.name, estimatedFrom: quote.estimatedFrom, estimatedTo: quote.estimatedTo },
    payment: {
      method: paymentMethod,
      label: paymentDef.name,
      cardBrand: paymentMethod === 'card' ? sanitizeSingleLine(String(paymentRaw.cardBrand ?? 'Card'), 20) : undefined,
      cardLast4: paymentMethod === 'card' ? last4 : undefined,
      transactionId: paymentMethod === 'cod' ? undefined : uid('txn_'),
    },
    paymentStatus: paymentStatusFor(paymentMethod, 'confirmed'),
    status: 'confirmed',
    couponCode: coupon?.coupon?.code,
    totals,
    timeline: buildTimeline(now.toISOString(), 'confirmed'),
    createdAt: now.toISOString(),
  };

  // Commit: decrement stock, count coupon usage, optionally save address.
  for (const item of items) {
    const p = db.products().find((x) => x.id === item.productId)!;
    const variants = p.variants.map((v) => (v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.quantity) } : v));
    db.updateProduct(p.id, { variants, stock: variants.reduce((s, v) => s + v.stock, 0), salesCount: p.salesCount + item.quantity });
  }
  if (coupon?.coupon) db.saveCoupons(db.coupons().map((c) => (c.code === coupon.coupon!.code ? { ...c, usedCount: c.usedCount + 1 } : c)));
  if (user && ctx.body.saveAddress === true) {
    const existing = db.addresses(user.id);
    const duplicate = existing.some((a) => a.building === order.address.building && a.unit === order.address.unit && a.emirate === emirate);
    if (!duplicate && existing.length < 10) {
      db.saveAddresses(user.id, [...existing, { ...order.address, id: uid('a-'), userId: user.id, isDefault: existing.length === 0 }]);
    }
  }
  db.addOrder(order);
  return order;
});

route('GET', '/orders', (ctx) => {
  const user = requireUser(ctx);
  return db.orders().filter((o) => o.userId === user.id);
});

function accessibleOrder(ctx: RequestContext): Order {
  const user = currentUser(ctx);
  const order = db.orders().find((o) => o.id === ctx.params.id || o.number === ctx.params.id);
  const email = (ctx.query.get('email') ?? '').toLowerCase();
  const allowed = order && (user?.role === 'admin' || (user && order.userId === user.id) || (!order.userId && email && order.customer.email === email));
  if (!order || !allowed) throw new ApiError(404, 'We couldn’t find that order.', 'order_not_found');
  return order;
}

route('GET', '/orders/:id', (ctx) => accessibleOrder(ctx));

route('POST', '/orders/:id/cancel', (ctx) => {
  const user = requireUser(ctx);
  const order = accessibleOrder(ctx);
  if (order.userId !== user.id) throw new ApiError(403, 'You can only cancel your own orders.', 'forbidden');
  if (!canCancel(order)) throw new ApiError(400, 'This order has already shipped and can no longer be cancelled.', 'not_cancellable');
  for (const item of order.items) {
    const p = db.products().find((x) => x.id === item.productId);
    if (!p) continue;
    const variants = p.variants.map((v) => (v.id === item.variantId ? { ...v, stock: v.stock + item.quantity } : v));
    db.updateProduct(p.id, { variants, stock: variants.reduce((s, v) => s + v.stock, 0) });
  }
  const patch = { status: 'cancelled' as const, timeline: advanceTimeline(order, 'cancelled'), paymentStatus: paymentStatusFor(order.payment.method, 'cancelled') };
  db.updateOrder(order.id, patch);
  return { ...order, ...patch };
});

route('POST', '/newsletter', (ctx) => {
  const email = str(ctx.body, 'email', 120).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(422, 'Enter a valid email address.', 'validation');
  const added = db.addNewsletter(email);
  return { ok: true, alreadySubscribed: !added, code: 'WELCOME10' };
});

route('POST', '/contact', (ctx) => {
  const name = sanitizeSingleLine(str(ctx.body, 'name', 60));
  const email = str(ctx.body, 'email', 120).trim().toLowerCase();
  const message = sanitizeSingleLine(str(ctx.body, 'message', 1500), 1500);
  if (name.length < 2 || !email.includes('@') || message.length < 20) throw new ApiError(422, 'Please complete all required fields.', 'validation');
  db.addContactMessage({ name, email, topic: sanitizeSingleLine(str(ctx.body, 'topic', 20)), message, at: new Date().toISOString() });
  return { ok: true, ticket: 'CS-' + Math.floor(100000 + Math.random() * 900000) };
});

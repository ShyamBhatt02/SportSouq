import type {
  AnalyticsData,
  AnalyticsKpis,
  AnalyticsRange,
  BreakdownPoint,
  Category,
  Coupon,
  Customer,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ReviewStatus,
} from '@/types';
import { couponFormSchema, productFormSchema } from '@/schemas';
import { CATEGORY_MAP } from '@/data/categories';
import { SPORT_MAP } from '@/data/sports';
import { EMIRATE_CODES, LOW_STOCK_DEFAULT } from '@/config/site';
import { slugify } from '@/data/products';
import { advanceTimeline, paymentStatusFor } from '@/utils/orderStatus';
import { sanitizeSingleLine, sanitizeText } from '@/utils/sanitize';
import { discountPercent } from '@/utils/pricing';
import { db } from '../db';
import { ApiError, requireAdmin, route, type RequestContext } from '../router';

function paginate<T>(list: T[], ctx: RequestContext, defaultSize = 15): Paginated<T> {
  const pageSize = Math.min(100, Math.max(1, Number(ctx.query.get('pageSize')) || defaultSize));
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Number(ctx.query.get('page')) || 1));
  return { items: list.slice((page - 1) * pageSize, page * pageSize), total: list.length, page, pageSize, totalPages };
}

/* ---------------- Orders ---------------- */

const STATUSES: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];

route('GET', '/admin/orders', (ctx) => {
  requireAdmin(ctx);
  const status = ctx.query.get('status');
  const q = (ctx.query.get('q') ?? '').trim().toLowerCase();
  let list = db.orders();
  if (status && STATUSES.includes(status as OrderStatus)) list = list.filter((o) => o.status === status);
  if (q) {
    list = list.filter((o) =>
      [o.number, o.customer.firstName + ' ' + o.customer.lastName, o.customer.email].some((f) => f.toLowerCase().includes(q)),
    );
  }
  const counts = Object.fromEntries(STATUSES.map((s) => [s, db.orders().filter((o) => o.status === s).length]));
  return { ...paginate(list, ctx), counts };
});

route('PATCH', '/admin/orders/:id/status', (ctx) => {
  requireAdmin(ctx);
  const order = db.orders().find((o) => o.id === ctx.params.id);
  if (!order) throw new ApiError(404, 'Order not found.', 'not_found');
  const next = String(ctx.body.status) as OrderStatus;
  if (!STATUSES.includes(next)) throw new ApiError(400, 'Invalid status.', 'validation');
  if (order.status === 'cancelled') throw new ApiError(400, 'Cancelled orders cannot be updated.', 'locked');
  if (order.status === 'delivered' && next !== 'delivered') throw new ApiError(400, 'Delivered orders cannot move backwards.', 'locked');
  const patch = {
    status: next,
    timeline: advanceTimeline(order, next),
    paymentStatus: paymentStatusFor(order.payment.method, next),
    trackingNumber: order.trackingNumber ?? (['shipped', 'out-for-delivery', 'delivered'].includes(next) ? 'AE' + Math.floor(80000000 + Math.random() * 9999999) : undefined),
  };
  db.updateOrder(order.id, patch);
  return { ...order, ...patch };
});

/* ---------------- Customers ---------------- */

function buildCustomers(): Customer[] {
  const stats = new Map<string, { count: number; spent: number; last: string | null }>();
  for (const o of db.orders()) {
    if (!o.userId || o.status === 'cancelled') continue;
    const s = stats.get(o.userId) ?? { count: 0, spent: 0, last: null };
    s.count++;
    s.spent += o.totals.total;
    if (!s.last || o.createdAt > s.last) s.last = o.createdAt;
    stats.set(o.userId, s);
  }
  const seed = db.customers().map((c) => ({ ...c }));
  const registered = db
    .users()
    .filter((u) => u.role === 'customer')
    .map((u) => ({
      id: u.id,
      name: u.firstName + ' ' + u.lastName,
      email: u.email,
      phone: u.phone,
      emirate: db.addresses(u.id).find((a) => a.isDefault)?.emirate ?? 'dubai',
      registeredAt: u.createdAt,
    }));
  return [...registered, ...seed].map((c) => {
    const s = stats.get(c.id);
    return { ...c, ordersCount: s?.count ?? 0, totalSpent: Math.round((s?.spent ?? 0) * 100) / 100, lastOrderAt: s?.last ?? null };
  });
}

route('GET', '/admin/customers', (ctx) => {
  requireAdmin(ctx);
  const q = (ctx.query.get('q') ?? '').trim().toLowerCase();
  const sort = ctx.query.get('sort') ?? 'recent';
  let list = buildCustomers();
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')));
  list.sort((a, b) =>
    sort === 'spent' ? b.totalSpent - a.totalSpent : sort === 'orders' ? b.ordersCount - a.ordersCount : b.registeredAt.localeCompare(a.registeredAt),
  );
  return paginate(list, ctx);
});

/* ---------------- Products / inventory ---------------- */

function productFromForm(body: Record<string, unknown>, base?: Product): Product {
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? 'Please check the form.', 'validation');
  const v = parsed.data;
  const id = base?.id ?? 'p-' + Date.now().toString(36);
  const name = sanitizeSingleLine(v.name, 100);
  const fullName = name.toLowerCase().startsWith(v.brand.toLowerCase()) ? name : v.brand + ' ' + name;
  let slug = base?.slug ?? slugify(fullName);
  if (!base && db.products().some((p) => p.slug === slug)) slug = slug + '-' + id.slice(-4);
  const sku = base?.sku ?? v.brand.slice(0, 3).toUpperCase() + '-' + v.sport.slice(0, 2).toUpperCase() + '-' + id.slice(-5).toUpperCase();
  const keepVariants = base && base.variants.length > 1;
  const variants = keepVariants
    ? base.variants.map((x) => ({ ...x, price: v.price, originalPrice: v.originalPrice }))
    : [{ id: id + '-0', sku, attributes: {}, price: v.price, originalPrice: v.originalPrice, stock: v.stock, image: v.image }];
  if (keepVariants) {
    // Re-distribute new total stock proportionally across existing variants.
    const current = base.variants.reduce((s, x) => s + x.stock, 0) || base.variants.length;
    let left = v.stock;
    variants.forEach((x, i) => {
      const share = i === variants.length - 1 ? left : Math.round(((base.variants[i].stock || 1) / current) * v.stock);
      x.stock = Math.max(0, Math.min(share, left));
      left -= x.stock;
    });
  }
  return {
    ...(base ?? {
      secondaryCategories: [],
      highlights: [],
      colors: [{ name: 'Default', hex: '#111827' }],
      sizes: [],
      configurations: [],
      genders: [v.gender],
      variantAxes: [],
      tags: [],
      rating: 0,
      reviewCount: 0,
      ageGroup: v.gender === 'kids' ? 'kids' : 'adult',
      deliveryEstimate: 'Same-day in Dubai · 1–3 business days across the UAE',
      availableEmirates: [...EMIRATE_CODES],
      specs: [],
      attributes: {},
      salesCount: 0,
      createdAt: new Date().toISOString(),
      lowStockThreshold: LOW_STOCK_DEFAULT,
      currency: 'AED' as const,
    }),
    id,
    slug,
    sku,
    name: fullName,
    brand: v.brand,
    sport: v.sport as Product['sport'],
    category: v.category as Product['category'],
    subcategory: v.subcategory,
    price: v.price,
    originalPrice: v.originalPrice,
    discountPercentage: discountPercent(v.price, v.originalPrice),
    stock: variants.reduce((s, x) => s + x.stock, 0),
    variants,
    shortDescription: sanitizeText(v.shortDescription, 200),
    description: sanitizeText(v.description, 3000),
    images: base && base.images[0] === v.image ? base.images : [v.image, ...(base?.images.filter((i) => i !== v.image) ?? [])],
    thumbnail: v.image,
    gender: v.gender,
    status: v.status,
    featured: v.featured,
    bestseller: v.bestseller,
    newArrival: v.newArrival,
    deal: v.deal,
    dealEndsAt: v.deal ? base?.dealEndsAt ?? new Date(Date.now() + 3 * 86_400_000).toISOString() : undefined,
  };
}

route('POST', '/admin/products', (ctx) => {
  requireAdmin(ctx);
  return db.createProduct(productFromForm(ctx.body));
});

route('PUT', '/admin/products/:id', (ctx) => {
  requireAdmin(ctx);
  const base = db.products().find((p) => p.id === ctx.params.id);
  if (!base) throw new ApiError(404, 'Product not found.', 'not_found');
  const next = productFromForm(ctx.body, base);
  return db.updateProduct(base.id, next);
});

route('DELETE', '/admin/products/:id', (ctx) => {
  requireAdmin(ctx);
  if (!db.products().some((p) => p.id === ctx.params.id)) throw new ApiError(404, 'Product not found.', 'not_found');
  db.deleteProduct(ctx.params.id);
  return { ok: true };
});

route('PATCH', '/admin/products/:id/status', (ctx) => {
  requireAdmin(ctx);
  const status = ctx.body.status === 'draft' ? 'draft' : 'published';
  const p = db.updateProduct(ctx.params.id, { status });
  if (!p) throw new ApiError(404, 'Product not found.', 'not_found');
  return p;
});

route('PATCH', '/admin/inventory/:id', (ctx) => {
  requireAdmin(ctx);
  const p = db.products().find((x) => x.id === ctx.params.id);
  if (!p) throw new ApiError(404, 'Product not found.', 'not_found');
  const patch: Partial<Product> = {};
  if (ctx.body.lowStockThreshold !== undefined) {
    const t = Number(ctx.body.lowStockThreshold);
    if (!Number.isInteger(t) || t < 0 || t > 1000) throw new ApiError(422, 'Threshold must be 0–1000.', 'validation');
    patch.lowStockThreshold = t;
  }
  if (ctx.body.variantStock && typeof ctx.body.variantStock === 'object') {
    const map = ctx.body.variantStock as Record<string, unknown>;
    patch.variants = p.variants.map((v) => {
      const n = Number(map[v.id]);
      return Number.isInteger(n) && n >= 0 && n <= 100000 ? { ...v, stock: n } : v;
    });
    patch.stock = patch.variants.reduce((s, v) => s + v.stock, 0);
  }
  return db.updateProduct(p.id, patch);
});

/* ---------------- Coupons ---------------- */

function couponFromBody(body: Record<string, unknown>, existing?: Coupon): Coupon {
  const parsed = couponFormSchema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? 'Please check the form.', 'validation');
  const v = parsed.data;
  return {
    code: v.code,
    description: sanitizeSingleLine(v.description, 120),
    type: v.type,
    value: v.type === 'free-delivery' ? 0 : v.value,
    minOrder: v.minOrder,
    maxDiscount: v.type === 'percentage' ? v.maxDiscount : undefined,
    expiresAt: new Date(v.expiresAt).toISOString(),
    active: v.active,
    firstOrderOnly: v.firstOrderOnly,
    usageLimit: v.usageLimit,
    usedCount: existing?.usedCount ?? 0,
    sports: existing?.sports,
  };
}

route('GET', '/admin/coupons', (ctx) => {
  requireAdmin(ctx);
  return db.coupons();
});

route('POST', '/admin/coupons', (ctx) => {
  requireAdmin(ctx);
  const coupon = couponFromBody(ctx.body);
  if (db.coupons().some((c) => c.code === coupon.code)) throw new ApiError(409, 'A coupon with this code already exists.', 'duplicate');
  db.saveCoupons([coupon, ...db.coupons()]);
  return coupon;
});

route('PUT', '/admin/coupons/:code', (ctx) => {
  requireAdmin(ctx);
  const existing = db.coupons().find((c) => c.code === ctx.params.code);
  if (!existing) throw new ApiError(404, 'Coupon not found.', 'not_found');
  const coupon = couponFromBody(ctx.body, existing);
  if (coupon.code !== existing.code && db.coupons().some((c) => c.code === coupon.code)) throw new ApiError(409, 'Code already in use.', 'duplicate');
  db.saveCoupons(db.coupons().map((c) => (c.code === existing.code ? coupon : c)));
  return coupon;
});

route('PATCH', '/admin/coupons/:code/toggle', (ctx) => {
  requireAdmin(ctx);
  const list = db.coupons().map((c) => (c.code === ctx.params.code ? { ...c, active: !c.active } : c));
  db.saveCoupons(list);
  return list.find((c) => c.code === ctx.params.code);
});

route('DELETE', '/admin/coupons/:code', (ctx) => {
  requireAdmin(ctx);
  db.saveCoupons(db.coupons().filter((c) => c.code !== ctx.params.code));
  return { ok: true };
});

/* ---------------- Reviews ---------------- */

route('GET', '/admin/reviews', (ctx) => {
  requireAdmin(ctx);
  const status = ctx.query.get('status');
  const products = db.products();
  const all = db.reviews().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const list = status && status !== 'all' ? all.filter((r) => r.status === status) : all;
  const page = paginate(list, ctx, 12);
  return {
    ...page,
    items: page.items.map((r) => {
      const p = products.find((x) => x.id === r.productId);
      return { ...r, productName: p?.name ?? 'Deleted product', productImage: p?.thumbnail ?? '', productSlug: p?.slug ?? '' };
    }),
    counts: { all: all.length, pending: all.filter((r) => r.status === 'pending').length, approved: all.filter((r) => r.status === 'approved').length, rejected: all.filter((r) => r.status === 'rejected').length },
  };
});

route('PATCH', '/admin/reviews/:id', (ctx) => {
  requireAdmin(ctx);
  const status = String(ctx.body.status) as ReviewStatus;
  if (!['approved', 'rejected', 'pending'].includes(status)) throw new ApiError(400, 'Invalid status.', 'validation');
  db.setReviewStatus(ctx.params.id, status);
  return { ok: true };
});

route('DELETE', '/admin/reviews/:id', (ctx) => {
  requireAdmin(ctx);
  db.setReviewStatus(ctx.params.id, 'deleted');
  return { ok: true };
});

/* ---------------- Categories ---------------- */

route('PUT', '/admin/categories', (ctx) => {
  requireAdmin(ctx);
  const list = ctx.body.categories;
  if (!Array.isArray(list)) throw new ApiError(400, 'Invalid payload.', 'validation');
  const clean: Category[] = (list as Category[]).map((c) => {
    const base = CATEGORY_MAP[c.slug];
    if (!base) throw new ApiError(400, 'Unknown category.', 'validation');
    return {
      ...base,
      name: sanitizeSingleLine(String(c.name || base.name), 40),
      description: sanitizeSingleLine(String(c.description || base.description), 200),
      subcategories: (Array.isArray(c.subcategories) ? c.subcategories : []).slice(0, 30).map((s) => ({
        slug: slugify(String(s.slug || s.name)),
        name: sanitizeSingleLine(String(s.name), 40),
        category: base.slug,
        image: typeof s.image === 'string' && s.image ? s.image : base.image,
      })),
    };
  });
  db.saveCategories(clean);
  return clean;
});

route('POST', '/admin/reset', (ctx) => {
  requireAdmin(ctx);
  db.reset();
  return { ok: true };
});

/* ---------------- Analytics ---------------- */

const DAY = 86_400_000;

interface Bucket {
  start: number;
  end: number;
  label: string;
}

function buildBuckets(range: AnalyticsRange, now: number): Bucket[] {
  const d = new Date(now);
  const fmtDay = (t: number) => new Date(t).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' });
  if (range === 'today') {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 24 }, (_, h) => ({ start: start.getTime() + h * 3_600_000, end: start.getTime() + (h + 1) * 3_600_000, label: String(h).padStart(2, '0') + ':00' }));
  }
  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 7 : 30;
    const end = new Date(d);
    end.setHours(24, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => {
      const s = end.getTime() - (days - i) * DAY;
      return { start: s, end: s + DAY, label: fmtDay(s) };
    });
  }
  if (range === '3m') {
    const end = new Date(d);
    end.setHours(24, 0, 0, 0);
    return Array.from({ length: 13 }, (_, i) => {
      const s = end.getTime() - (13 - i) * 7 * DAY;
      return { start: s, end: s + 7 * DAY, label: fmtDay(s) };
    });
  }
  return Array.from({ length: 12 }, (_, i) => {
    const s = new Date(d.getFullYear(), d.getMonth() - 11 + i, 1).getTime();
    const e = new Date(d.getFullYear(), d.getMonth() - 10 + i, 1).getTime();
    return { start: s, end: e, label: new Date(s).toLocaleDateString('en-AE', { month: 'short', year: '2-digit' }) };
  });
}

function kpisFor(orders: Order[], productsCount: number): AnalyticsKpis {
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const revenue = valid.reduce((s, o) => s + o.totals.total, 0);
  const units = valid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);
  const customers = new Set(valid.map((o) => o.userId ?? o.customer.email)).size;
  return {
    revenue: Math.round(revenue),
    orders: valid.length,
    customers,
    products: productsCount,
    productsSold: units,
    averageOrderValue: valid.length ? Math.round((revenue / valid.length) * 100) / 100 : 0,
  };
}

function breakdown(orders: Order[], key: (o: Order['items'][number]) => string, name: (k: string) => string): BreakdownPoint[] {
  const map = new Map<string, BreakdownPoint>();
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    for (const i of o.items) {
      const k = key(i);
      const b = map.get(k) ?? { key: k, name: name(k), revenue: 0, units: 0 };
      b.revenue += i.price * i.quantity;
      b.units += i.quantity;
      map.set(k, b);
    }
  }
  return Array.from(map.values())
    .map((b) => ({ ...b, revenue: Math.round(b.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

route('GET', '/admin/analytics', (ctx): AnalyticsData => {
  requireAdmin(ctx);
  const range = (['today', '7d', '30d', '3m', '12m'].includes(String(ctx.query.get('range'))) ? ctx.query.get('range') : '30d') as AnalyticsRange;
  const now = Date.now();
  const buckets = buildBuckets(range, now);
  const start = buckets[0].start;
  const end = buckets[buckets.length - 1].end;
  const span = end - start;
  const all = db.orders();
  const inRange = all.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= start && t < end;
  });
  const prev = all.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= start - span && t < start;
  });
  const productsCount = db.products().filter((p) => p.status === 'published').length;
  const customers = buildCustomers();

  const series = buckets.map((b) => {
    const os = inRange.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= b.start && t < b.end && o.status !== 'cancelled';
    });
    return {
      date: new Date(b.start).toISOString(),
      label: b.label,
      revenue: Math.round(os.reduce((s, o) => s + o.totals.total, 0)),
      orders: os.length,
      customers: customers.filter((c) => {
        const t = new Date(c.registeredAt).getTime();
        return t >= b.start && t < b.end;
      }).length,
    };
  });

  const customerGrowth = buckets.map((b) => ({
    label: b.label,
    total: customers.filter((c) => new Date(c.registeredAt).getTime() < b.end).length,
    new: customers.filter((c) => {
      const t = new Date(c.registeredAt).getTime();
      return t >= b.start && t < b.end;
    }).length,
  }));

  const productMap = new Map(db.products().map((p) => [p.id, p]));
  const top = breakdown(inRange, (i) => i.productId, (k) => productMap.get(k)?.name ?? 'Removed product')
    .slice(0, 6)
    .map((b) => ({ id: b.key, name: b.name, image: productMap.get(b.key)?.thumbnail ?? '', units: b.units, revenue: b.revenue }));

  return {
    range,
    kpis: kpisFor(inRange, productsCount),
    // Only compare when the previous period is fully covered by order history.
    previous: all.length && start - span >= Math.min(...all.map((o) => new Date(o.createdAt).getTime())) ? kpisFor(prev, productsCount) : null,
    series,
    bySport: breakdown(inRange, (i) => i.sport, (k) => SPORT_MAP[k as Product['sport']]?.name ?? k),
    byCategory: breakdown(inRange, (i) => i.category, (k) => CATEGORY_MAP[k as Product['category']]?.name ?? k).slice(0, 8),
    customerGrowth,
    topProducts: top,
    statusBreakdown: STATUSES.map((s) => ({ status: s, count: inRange.filter((o) => o.status === s).length })),
  };
});

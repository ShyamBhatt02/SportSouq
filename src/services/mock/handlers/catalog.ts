import type { Product } from '@/types';
import { BRANDS } from '@/data/brands';
import { SPORTS } from '@/data/sports';
import { ALL_SUBCATEGORIES } from '@/data/categories';
import { queryFromParams, queryProducts, searchScore, sortProducts, tokenize } from '@/utils/productQuery';
import { sanitizeQuery } from '@/utils/sanitize';
import { db } from '../db';
import { ApiError, currentUser, route } from '../router';

route('GET', '/products', (ctx) => {
  const q = queryFromParams(ctx.query);
  if (q.includeDrafts && currentUser(ctx)?.role !== 'admin') q.includeDrafts = false;
  if (q.q) q.q = sanitizeQuery(q.q);
  return queryProducts(db.products(), q);
});

route('GET', '/products/suggest', (ctx) => {
  const raw = sanitizeQuery(ctx.query.get('q') ?? '');
  const tokens = tokenize(raw);
  if (!tokens.length) return { products: [], suggestions: [] };
  const published = db.products().filter((p) => p.status === 'published');
  const products = published
    .map((p) => ({ p, s: searchScore(p, tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.p.salesCount - a.p.salesCount)
    .slice(0, 6)
    .map((x) => x.p);
  const needle = raw.toLowerCase();
  const suggestions = [
    ...SPORTS.filter((s) => s.name.toLowerCase().includes(needle)).map((s) => ({ type: 'sport' as const, label: s.name, value: s.slug })),
    ...BRANDS.filter((b) => b.name.toLowerCase().includes(needle)).map((b) => ({ type: 'brand' as const, label: b.name, value: b.name })),
    ...ALL_SUBCATEGORIES.filter((s) => s.name.toLowerCase().includes(needle)).map((s) => ({ type: 'category' as const, label: s.name, value: s.slug, parent: s.category })),
  ]
    .filter((s, i, arr) => arr.findIndex((x) => x.label === s.label) === i)
    .slice(0, 6);
  return { products, suggestions, total: published.filter((p) => searchScore(p, tokens) > 0).length };
});

function findProduct(slugOrId: string, allowDraft: boolean): Product {
  const p = db.products().find((x) => x.slug === slugOrId || x.id === slugOrId);
  if (!p || (p.status !== 'published' && !allowDraft)) throw new ApiError(404, 'We couldn’t find that product.', 'product_not_found');
  return p;
}

route('GET', '/products/:slug', (ctx) => findProduct(ctx.params.slug, currentUser(ctx)?.role === 'admin'));

route('GET', '/products/:id/related', (ctx) => {
  const p = findProduct(ctx.params.id, false);
  const pool = db.products().filter((x) => x.status === 'published' && x.id !== p.id && x.stock > 0);
  const scored = pool
    .map((x) => ({
      x,
      s:
        (x.subcategory === p.subcategory ? 6 : 0) +
        (x.sport === p.sport ? 4 : 0) +
        (x.category === p.category ? 2 : 0) +
        (x.brand === p.brand ? 1 : 0) +
        x.rating / 5,
    }))
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, 8).map((r) => r.x);
});

/** Complementary products: same sport, different subcategory, frequently co-purchased in order history. */
route('GET', '/products/:id/bought-together', (ctx) => {
  const p = findProduct(ctx.params.id, false);
  const counts = new Map<string, number>();
  for (const o of db.orders()) {
    if (!o.items.some((i) => i.productId === p.id)) continue;
    for (const i of o.items) if (i.productId !== p.id) counts.set(i.productId, (counts.get(i.productId) ?? 0) + 1);
  }
  const pool = db.products().filter((x) => x.status === 'published' && x.id !== p.id && x.stock > 0 && x.subcategory !== p.subcategory);
  const ranked = pool
    .map((x) => ({ x, s: (counts.get(x.id) ?? 0) * 3 + (x.sport === p.sport ? 5 : 0) + (x.price < p.price ? 1 : 0) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);
  return ranked.slice(0, 3).map((r) => r.x);
});

/** Personalised picks from sports the shopper engaged with (recently viewed / wishlist). */
route('GET', '/recommendations', (ctx) => {
  const ids = (ctx.query.get('ids') ?? '').split(',').filter(Boolean).slice(0, 30);
  const products = db.products().filter((p) => p.status === 'published');
  const seen = products.filter((p) => ids.includes(p.id));
  const sportWeight = new Map<string, number>();
  seen.forEach((p, i) => sportWeight.set(p.sport, (sportWeight.get(p.sport) ?? 0) + (ids.length - i)));
  const pool = products.filter((p) => !ids.includes(p.id) && p.stock > 0);
  if (!sportWeight.size) return sortProducts(pool.filter((p) => p.featured || p.bestseller), 'recommended').slice(0, 8);
  return pool
    .map((p) => ({ p, s: (sportWeight.get(p.sport) ?? 0) * 2 + p.rating + (p.bestseller ? 1 : 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((r) => r.p);
});

route('GET', '/catalog/categories', () => db.categories());

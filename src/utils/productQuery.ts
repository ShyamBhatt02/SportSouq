import type { FacetOption, Product, ProductFacets, ProductListResponse, ProductQuery, SortOption } from '@/types';
import { CATEGORY_MAP, getSubcategory } from '@/data/categories';
import { SPORT_MAP } from '@/data/sports';
import { titleCase } from './format';

type FilterKey =
  | 'q' | 'sport' | 'category' | 'subcategory' | 'brand' | 'price' | 'rating' | 'size' | 'color'
  | 'gender' | 'ageGroup' | 'availability' | 'discount' | 'flags' | 'ids' | `attr:${string}`;

export function tokenize(q: string): string[] {
  return q.toLowerCase().split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}

/** Relevance score; 0 means "does not match every token". */
export function searchScore(product: Product, tokens: string[]): number {
  if (!tokens.length) return 1;
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  const sport = SPORT_MAP[product.sport].name.toLowerCase();
  const cat = CATEGORY_MAP[product.category].name.toLowerCase();
  const sub = (getSubcategory(product.subcategory)?.name ?? '').toLowerCase();
  const sku = product.sku.toLowerCase();
  const tags = product.tags.join(' ').toLowerCase();
  const desc = (product.shortDescription + ' ' + product.description).toLowerCase();
  let score = 0;
  for (const raw of tokens) {
    const t = raw.replace(/s$/, '');
    let s = 0;
    if (sku === raw || product.variants.some((v) => v.sku.toLowerCase() === raw)) s += 20;
    else if (sku.includes(raw)) s += 8;
    if (name.includes(t)) s += name.split(/\s+/).some((w) => w.startsWith(t)) ? 6 : 4;
    if (brand.includes(t)) s += 5;
    if (sport.includes(t) || cat.includes(t)) s += 3;
    if (sub.includes(t)) s += 3;
    if (tags.includes(t)) s += 2;
    if (desc.includes(t)) s += 1;
    if (s === 0) return 0;
    score += s;
  }
  return score;
}

function inAnyCategory(p: Product, categories: string[]): boolean {
  return categories.includes(p.category) || p.secondaryCategories.some((c) => categories.includes(c.category));
}

function inAnySubcategory(p: Product, subs: string[]): boolean {
  return subs.includes(p.subcategory) || p.secondaryCategories.some((c) => subs.includes(c.subcategory));
}

function attrValues(p: Product, key: string): string[] {
  return (p.attributes[key] ?? '').split('|').filter(Boolean);
}

function matches(p: Product, q: ProductQuery, tokens: string[], skip?: FilterKey): boolean {
  if (!q.includeDrafts && p.status !== 'published') return false;
  if (skip !== 'ids' && q.ids?.length && !q.ids.includes(p.id)) return false;
  if (skip !== 'q' && tokens.length && searchScore(p, tokens) === 0) return false;
  if (skip !== 'sport' && q.sport?.length && !q.sport.includes(p.sport)) return false;
  if (skip !== 'category' && q.category?.length && !inAnyCategory(p, q.category)) return false;
  if (skip !== 'subcategory' && q.subcategory?.length && !inAnySubcategory(p, q.subcategory)) return false;
  if (skip !== 'brand' && q.brand?.length && !q.brand.includes(p.brand)) return false;
  if (skip !== 'price') {
    if (q.minPrice !== undefined && p.price < q.minPrice) return false;
    if (q.maxPrice !== undefined && p.price > q.maxPrice) return false;
  }
  if (skip !== 'rating' && q.rating && p.rating < q.rating) return false;
  if (skip !== 'size' && q.size?.length && !p.sizes.some((s) => q.size!.includes(s))) return false;
  if (skip !== 'color' && q.color?.length && !p.colors.some((c) => q.color!.includes(c.name))) return false;
  if (skip !== 'gender' && q.gender?.length && !q.gender.some((g) => p.genders.includes(g) || p.gender === g || (p.gender === 'unisex' && g !== 'kids'))) return false;
  if (skip !== 'ageGroup' && q.ageGroup?.length && !q.ageGroup.includes(p.ageGroup)) return false;
  if (skip !== 'availability') {
    if (q.availability === 'in-stock' && p.stock <= 0) return false;
    if (q.availability === 'low-stock' && (p.stock <= 0 || p.stock > p.lowStockThreshold)) return false;
  }
  if (skip !== 'discount' && q.discount && p.discountPercentage < q.discount) return false;
  if (skip !== 'flags' && q.flags?.length && !q.flags.every((f) => p[f])) return false;
  if (q.attributes) {
    for (const [key, values] of Object.entries(q.attributes)) {
      if (skip === ('attr:' + key) || !values.length) continue;
      if (!attrValues(p, key).some((v) => values.includes(v))) return false;
    }
  }
  return true;
}

function recommendedScore(p: Product): number {
  return (
    p.rating * 10 +
    Math.log10(p.reviewCount + 1) * 6 +
    Math.log10(p.salesCount + 1) * 6 +
    (p.featured ? 8 : 0) +
    (p.bestseller ? 5 : 0) +
    (p.newArrival ? 3 : 0) +
    (p.stock > 0 ? 0 : -50)
  );
}

export function sortProducts(list: Product[], sort: SortOption = 'recommended', tokens: string[] = []): Product[] {
  const sorted = [...list];
  const cmp: Record<SortOption, (a: Product, b: Product) => number> = {
    recommended: (a, b) =>
      (tokens.length ? searchScore(b, tokens) * 3 - searchScore(a, tokens) * 3 : 0) + (recommendedScore(b) - recommendedScore(a)),
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    'best-selling': (a, b) => b.salesCount - a.salesCount,
    'top-rated': (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    discount: (a, b) => b.discountPercentage - a.discountPercentage || b.salesCount - a.salesCount,
  };
  return sorted.sort(cmp[sort] ?? cmp.recommended);
}

function countBy(list: Product[], keyFn: (p: Product) => string[], labelFn: (v: string) => string, hexFn?: (v: string) => string | undefined): FacetOption[] {
  const counts = new Map<string, number>();
  for (const p of list) for (const v of new Set(keyFn(p))) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts, ([value, count]) => ({ value, label: labelFn(value), count, hex: hexFn?.(value) }));
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'S/M', 'M/L', 'L/XL'];
function sizeSort(a: FacetOption, b: FacetOption): number {
  const na = parseFloat(a.value);
  const nb = parseFloat(b.value);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;
  const ia = SIZE_ORDER.indexOf(a.value);
  const ib = SIZE_ORDER.indexOf(b.value);
  if (ia !== -1 && ib !== -1) return ia - ib;
  return a.value.localeCompare(b.value);
}

export function computeFacets(all: Product[], q: ProductQuery, tokens: string[]): ProductFacets {
  const scoped = (skip: FilterKey) => all.filter((p) => matches(p, q, tokens, skip));
  const byCount = (a: FacetOption, b: FacetOption) => b.count - a.count || a.label.localeCompare(b.label);
  const colorHex = new Map(all.flatMap((p) => p.colors.map((c) => [c.name, c.hex] as const)));

  const attributeKeys = Array.from(new Set(all.flatMap((p) => Object.keys(p.attributes))));
  const attributes: Record<string, FacetOption[]> = {};
  for (const key of attributeKeys) {
    attributes[key] = countBy(scoped(('attr:' + key) as FilterKey), (p) => attrValues(p, key), (v) => v).sort(byCount);
  }

  const priced = scoped('price');
  const prices = priced.map((p) => p.price);

  return {
    sports: countBy(scoped('sport'), (p) => [p.sport], (v) => SPORT_MAP[v as Product['sport']]?.name ?? titleCase(v)).sort(byCount),
    categories: countBy(scoped('category'), (p) => [p.category, ...p.secondaryCategories.map((c) => c.category)], (v) => CATEGORY_MAP[v as Product['category']]?.name ?? titleCase(v)).sort(byCount),
    subcategories: countBy(scoped('subcategory'), (p) => [p.subcategory, ...p.secondaryCategories.map((c) => c.subcategory)], (v) => getSubcategory(v)?.name ?? titleCase(v)).sort(byCount),
    brands: countBy(scoped('brand'), (p) => [p.brand], (v) => v).sort((a, b) => a.label.localeCompare(b.label)),
    sizes: countBy(scoped('size'), (p) => p.sizes, (v) => v).sort(sizeSort),
    colors: countBy(scoped('color'), (p) => p.colors.map((c) => c.name), (v) => v, (v) => colorHex.get(v)).sort(byCount),
    genders: countBy(scoped('gender'), (p) => (p.genders.length > 1 ? p.genders : [p.gender]), (v) => titleCase(v)).sort(byCount),
    ageGroups: countBy(scoped('ageGroup'), (p) => [p.ageGroup], (v) => titleCase(v)).sort(byCount),
    attributes,
    priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
  };
}

export function queryProducts(all: Product[], q: ProductQuery): ProductListResponse {
  const tokens = tokenize(q.q ?? '');
  const filtered = all.filter((p) => matches(p, q, tokens));
  const sorted = sortProducts(filtered, q.sort ?? 'recommended', tokens);
  const pageSize = Math.min(Math.max(q.pageSize ?? 12, 1), 100);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(q.page ?? 1, 1), totalPages);
  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageSize,
    totalPages,
    facets: computeFacets(all, q, tokens),
  };
}

/* ---------- URL <-> query serialisation (shareable filter URLs) ---------- */

const LIST_KEYS = ['sport', 'category', 'subcategory', 'brand', 'size', 'color', 'gender', 'ageGroup'] as const;
const SORTS: SortOption[] = ['recommended', 'newest', 'best-selling', 'top-rated', 'price-asc', 'price-desc', 'discount'];

export function queryFromParams(params: URLSearchParams): ProductQuery {
  const q: ProductQuery = {};
  const text = params.get('q');
  if (text) q.q = text.slice(0, 80);
  for (const key of LIST_KEYS) {
    const v = params.get(key);
    if (v) (q as Record<string, unknown>)[key] = v.split(',').filter(Boolean).slice(0, 30);
  }
  const num = (k: string) => {
    const v = params.get(k);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  q.minPrice = num('min');
  q.maxPrice = num('max');
  q.rating = num('rating');
  q.discount = num('discount');
  q.page = num('page');
  const availability = params.get('availability');
  if (availability === 'in-stock' || availability === 'low-stock') q.availability = availability;
  const sort = params.get('sort') as SortOption | null;
  if (sort && SORTS.includes(sort)) q.sort = sort;
  const flags = params.get('flags');
  if (flags) q.flags = flags.split(',').filter((f): f is NonNullable<ProductQuery['flags']>[number] => ['deal', 'newArrival', 'bestseller', 'featured'].includes(f));
  const ids = params.get('ids');
  if (ids) q.ids = ids.split(',').filter(Boolean).slice(0, 100);
  const pageSize = num('pageSize');
  if (pageSize) q.pageSize = pageSize;
  if (params.get('drafts') === '1') q.includeDrafts = true;
  const attributes: Record<string, string[]> = {};
  params.forEach((value, key) => {
    if (key.startsWith('attr.') && value) attributes[key.slice(5)] = value.split(',').filter(Boolean);
  });
  if (Object.keys(attributes).length) q.attributes = attributes;
  return q;
}

export function paramsFromQuery(q: ProductQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (q.q) params.set('q', q.q);
  for (const key of LIST_KEYS) {
    const v = q[key] as string[] | undefined;
    if (v?.length) params.set(key, v.join(','));
  }
  if (q.minPrice !== undefined) params.set('min', String(q.minPrice));
  if (q.maxPrice !== undefined) params.set('max', String(q.maxPrice));
  if (q.rating) params.set('rating', String(q.rating));
  if (q.discount) params.set('discount', String(q.discount));
  if (q.availability && q.availability !== 'all') params.set('availability', q.availability);
  if (q.sort && q.sort !== 'recommended') params.set('sort', q.sort);
  if (q.page && q.page > 1) params.set('page', String(q.page));
  for (const [key, values] of Object.entries(q.attributes ?? {})) if (values.length) params.set('attr.' + key, values.join(','));
  return params;
}

/** Full API serialisation (URL params + API-only fields such as page size and flags). */
export function apiParamsFromQuery(q: ProductQuery): URLSearchParams {
  const params = paramsFromQuery(q);
  if (q.flags?.length) params.set('flags', q.flags.join(','));
  if (q.ids?.length) params.set('ids', q.ids.join(','));
  if (q.pageSize) params.set('pageSize', String(q.pageSize));
  if (q.includeDrafts) params.set('drafts', '1');
  return params;
}

/** Number of user-applied filters (excluding sort/page/scope). */
export function activeFilterCount(q: ProductQuery, locked: (keyof ProductQuery)[] = []): number {
  let n = 0;
  for (const key of LIST_KEYS) if (!locked.includes(key) && (q[key] as string[] | undefined)?.length) n += (q[key] as string[]).length;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) n++;
  if (q.rating) n++;
  if (q.discount) n++;
  if (q.availability && q.availability !== 'all') n++;
  for (const values of Object.values(q.attributes ?? {})) n += values.length;
  return n;
}

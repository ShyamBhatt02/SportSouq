import { useEffect, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import type { FacetOption, ProductFacets, ProductQuery, SortOption } from '@/types';
import { Accordion, type AccordionItem } from '@/components/ui/Disclosure';
import { Checkbox, Radio } from '@/components/ui/Choice';
import { Stars } from './ProductMeta';
import { useI18n } from '@/i18n/I18nProvider';
import { SPORT_FILTERS } from '@/data/sports';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

type ListKey = 'sport' | 'category' | 'subcategory' | 'brand' | 'size' | 'color' | 'gender' | 'ageGroup';

interface ProductFiltersProps {
  query: ProductQuery;
  facets: ProductFacets | undefined;
  onChange: (next: ProductQuery) => void;
  locked?: (keyof ProductQuery)[];
  className?: string;
}

function toggleIn(list: string[] | undefined, value: string): string[] {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return Array.from(set);
}

function OptionList({ options, selected, onToggle, limit = 8, name }: { options: FacetOption[]; selected: string[]; onToggle: (v: string) => void; limit?: number; name: string }) {
  const [expanded, setExpanded] = useState(false);
  const visible = options.filter((o) => o.count > 0 || selected.includes(o.value));
  const shown = expanded ? visible : visible.slice(0, limit);
  if (!visible.length) return <p className="text-xs text-fg-subtle">No options for current results.</p>;
  return (
    <div className="flex flex-col gap-2.5">
      {shown.map((o) => (
        <Checkbox key={o.value} name={name} checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} label={o.label} trailing={o.count} />
      ))}
      {visible.length > limit && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="self-start text-xs font-bold text-brand-600 hover:underline dark:text-brand-400">
          {expanded ? 'Show less' : 'Show all ' + visible.length}
        </button>
      )}
    </div>
  );
}

function PriceFilter({ query, range, onChange }: { query: ProductQuery; range: { min: number; max: number }; onChange: (min?: number, max?: number) => void }) {
  const { t } = useI18n();
  const [min, setMin] = useState(query.minPrice?.toString() ?? '');
  const [max, setMax] = useState(query.maxPrice?.toString() ?? '');
  useEffect(() => {
    setMin(query.minPrice?.toString() ?? '');
    setMax(query.maxPrice?.toString() ?? '');
  }, [query.minPrice, query.maxPrice]);

  const commit = () => {
    const lo = min === '' ? undefined : Math.max(0, Number(min));
    const hi = max === '' ? undefined : Math.max(0, Number(max));
    if (lo !== undefined && hi !== undefined && lo > hi) onChange(hi, lo);
    else onChange(Number.isFinite(lo) ? lo : undefined, Number.isFinite(hi) ? hi : undefined);
  };
  const presets: [string, number | undefined, number | undefined][] = [
    ['Under AED 100', undefined, 100],
    ['AED 100–300', 100, 300],
    ['AED 300–700', 300, 700],
    ['AED 700+', 700, undefined],
  ];
  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
      >
        <label className="sr-only" htmlFor="price-min">{t.listing.min}</label>
        <input id="price-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} onBlur={commit} placeholder={String(range.min || 0)} className="h-10 w-full min-w-0 rounded-xl border border-line-strong bg-surface px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
        <span className="text-fg-subtle" aria-hidden="true">–</span>
        <label className="sr-only" htmlFor="price-max">{t.listing.max}</label>
        <input id="price-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} onBlur={commit} placeholder={String(range.max || 5000)} className="h-10 w-full min-w-0 rounded-xl border border-line-strong bg-surface px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
        <button type="submit" className="h-10 shrink-0 rounded-xl bg-ink-950 px-3 text-xs font-bold text-white dark:bg-white dark:text-ink-950">
          Go
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {presets.map(([label, lo, hi]) => {
          const active = query.minPrice === lo && query.maxPrice === hi;
          return (
            <button key={label} type="button" aria-pressed={active} onClick={() => onChange(active ? undefined : lo, active ? undefined : hi)} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition', active ? 'border-fg bg-fg text-canvas' : 'border-line-strong text-fg-muted hover:border-fg hover:text-fg')}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductFilters({ query, facets, onChange, locked = [], className }: ProductFiltersProps) {
  const { t } = useI18n();
  const set = (patch: Partial<ProductQuery>) => onChange({ ...query, ...patch, page: 1 });
  const toggle = (key: ListKey, value: string) => set({ [key]: toggleIn(query[key] as string[] | undefined, value) } as Partial<ProductQuery>);
  const sel = (key: ListKey) => (query[key] as string[] | undefined) ?? [];

  if (!facets) {
    return (
      <div className={cn('space-y-4', className)} aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-10 rounded-xl" />
        ))}
      </div>
    );
  }

  const count = (n: number) => (n ? <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{n}</span> : undefined);
  const items: AccordionItem[] = [];
  const push = (key: string, title: string, content: ReactNode, badge?: number) => items.push({ key, title, content, badge: count(badge ?? 0) });

  if (!locked.includes('sport')) push('sport', t.listing.sport, <OptionList name="sport" options={facets.sports} selected={sel('sport')} onToggle={(v) => toggle('sport', v)} />, sel('sport').length);
  if (!locked.includes('category')) push('category', t.listing.category, <OptionList name="category" options={facets.categories} selected={sel('category')} onToggle={(v) => toggle('category', v)} />, sel('category').length);
  if (!locked.includes('subcategory')) push('subcategory', t.listing.subcategory, <OptionList name="subcategory" options={facets.subcategories} selected={sel('subcategory')} onToggle={(v) => toggle('subcategory', v)} limit={6} />, sel('subcategory').length);
  push('brand', t.listing.brand, <OptionList name="brand" options={facets.brands} selected={sel('brand')} onToggle={(v) => toggle('brand', v)} limit={6} />, sel('brand').length);
  push('price', t.listing.price, <PriceFilter query={query} range={facets.priceRange} onChange={(min, max) => set({ minPrice: min, maxPrice: max })} />, query.minPrice !== undefined || query.maxPrice !== undefined ? 1 : 0);
  push(
    'rating',
    t.listing.rating,
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={t.listing.rating}>
      {[4.5, 4, 3].map((r) => (
        <Radio
          key={r}
          name="rating"
          checked={query.rating === r}
          onChange={() => set({ rating: r })}
          onClick={() => query.rating === r && set({ rating: undefined })}
          label={
            <span className="flex items-center gap-2">
              <Stars value={r} size="sm" />
              <span className="text-xs text-fg-muted">
                {r}+ {t.listing.andUp}
              </span>
            </span>
          }
        />
      ))}
    </div>,
    query.rating ? 1 : 0,
  );
  if (facets.sizes.length) {
    push(
      'size',
      t.listing.size,
      <div className="flex flex-wrap gap-2">
        {facets.sizes
          .filter((o) => o.count > 0 || sel('size').includes(o.value))
          .map((o) => {
            const active = sel('size').includes(o.value);
            return (
              <button key={o.value} type="button" aria-pressed={active} onClick={() => toggle('size', o.value)} className={cn('h-9 min-w-11 rounded-lg border px-2.5 text-xs font-semibold transition', active ? 'border-fg bg-fg text-canvas' : 'border-line-strong text-fg hover:border-fg')}>
                {o.label}
              </button>
            );
          })}
      </div>,
      sel('size').length,
    );
  }
  push(
    'color',
    t.listing.color,
    <div className="flex flex-wrap gap-2.5">
      {facets.colors
        .filter((o) => o.count > 0 || sel('color').includes(o.value))
        .map((o) => {
          const active = sel('color').includes(o.value);
          return (
            <button key={o.value} type="button" aria-pressed={active} onClick={() => toggle('color', o.value)} title={o.label + ' (' + o.count + ')'} aria-label={o.label + ', ' + o.count + ' products'} className={cn('relative flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition', active ? 'ring-2 ring-fg' : 'ring-1 ring-line-strong hover:ring-ink-400')}>
              <span className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: o.hex }} />
              {active && <Check className="absolute h-3.5 w-3.5 text-white mix-blend-difference" strokeWidth={3} aria-hidden="true" />}
            </button>
          );
        })}
    </div>,
    sel('color').length,
  );
  push('gender', t.listing.gender, <OptionList name="gender" options={facets.genders} selected={sel('gender')} onToggle={(v) => toggle('gender', v)} />, sel('gender').length);
  push('ageGroup', t.listing.ageGroup, <OptionList name="ageGroup" options={facets.ageGroups} selected={sel('ageGroup')} onToggle={(v) => toggle('ageGroup', v)} />, sel('ageGroup').length);
  push(
    'availability',
    t.listing.availability,
    <div className="flex flex-col gap-2.5">
      <Checkbox checked={query.availability === 'in-stock'} onChange={() => set({ availability: query.availability === 'in-stock' ? undefined : 'in-stock' })} label={t.listing.inStockOnly} />
      <Checkbox checked={query.availability === 'low-stock'} onChange={() => set({ availability: query.availability === 'low-stock' ? undefined : 'low-stock' })} label={t.listing.lowStockOnly} />
    </div>,
    query.availability ? 1 : 0,
  );
  push(
    'discount',
    t.listing.discount,
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={t.listing.discount}>
      {[10, 20, 30].map((d) => (
        <Radio key={d} name="discount" checked={query.discount === d} onChange={() => set({ discount: d })} onClick={() => query.discount === d && set({ discount: undefined })} label={t.listing.discountAtLeast(d)} />
      ))}
    </div>,
    query.discount ? 1 : 0,
  );

  // Sport-specific filters appear when the scope (or selection) includes that sport.
  const sportsInScope = new Set([...(query.sport ?? []), ...facets.sports.filter((s) => s.count > 0).map((s) => s.value)]);
  const sportSpecific = (query.sport?.length ? SPORT_FILTERS.filter((f) => query.sport!.includes(f.sport)) : SPORT_FILTERS.filter((f) => sportsInScope.has(f.sport) && facets.sports.length === 1));
  for (const def of sportSpecific) {
    const opts = facets.attributes[def.key] ?? [];
    if (!opts.some((o) => o.count > 0)) continue;
    const selected = query.attributes?.[def.key] ?? [];
    push(
      'attr-' + def.key,
      def.label,
      <OptionList
        name={def.key}
        options={def.options.map((o) => ({ value: o, label: o, count: opts.find((x) => x.value === o)?.count ?? 0 }))}
        selected={selected}
        onToggle={(v) => set({ attributes: { ...query.attributes, [def.key]: toggleIn(selected, v) } })}
      />,
      selected.length,
    );
  }

  return <Accordion className={className} items={items} defaultOpen={['sport', 'category', 'subcategory', 'brand', 'price', ...sportSpecific.map((d) => 'attr-' + d.key)]} />;
}

/* ---------------- Active filter chips ---------------- */

export function ActiveFilters({ query, facets, onChange, locked = [], onClear }: { query: ProductQuery; facets?: ProductFacets; onChange: (q: ProductQuery) => void; locked?: (keyof ProductQuery)[]; onClear: () => void }) {
  const { t } = useI18n();
  const chips: { key: string; label: string; remove: () => void }[] = [];
  const labelFor = (list: FacetOption[] | undefined, v: string) => list?.find((o) => o.value === v)?.label ?? v;
  const lists: [ListKey, FacetOption[] | undefined][] = [
    ['sport', facets?.sports], ['category', facets?.categories], ['subcategory', facets?.subcategories], ['brand', facets?.brands],
    ['size', facets?.sizes], ['color', facets?.colors], ['gender', facets?.genders], ['ageGroup', facets?.ageGroups],
  ];
  for (const [key, opts] of lists) {
    if (locked.includes(key)) continue;
    for (const v of (query[key] as string[] | undefined) ?? []) {
      chips.push({ key: key + v, label: labelFor(opts, v), remove: () => onChange({ ...query, [key]: toggleIn(query[key] as string[], v), page: 1 }) });
    }
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const label = query.minPrice !== undefined && query.maxPrice !== undefined ? formatPrice(query.minPrice) + ' – ' + formatPrice(query.maxPrice) : query.minPrice !== undefined ? formatPrice(query.minPrice) + '+' : 'Under ' + formatPrice(query.maxPrice!);
    chips.push({ key: 'price', label, remove: () => onChange({ ...query, minPrice: undefined, maxPrice: undefined, page: 1 }) });
  }
  if (query.rating) chips.push({ key: 'rating', label: query.rating + '★ & up', remove: () => onChange({ ...query, rating: undefined, page: 1 }) });
  if (query.discount) chips.push({ key: 'discount', label: query.discount + '%+ off', remove: () => onChange({ ...query, discount: undefined, page: 1 }) });
  if (query.availability) chips.push({ key: 'avail', label: query.availability === 'in-stock' ? t.listing.inStockOnly : t.listing.lowStockOnly, remove: () => onChange({ ...query, availability: undefined, page: 1 }) });
  for (const [k, values] of Object.entries(query.attributes ?? {})) {
    for (const v of values) chips.push({ key: k + v, label: v, remove: () => onChange({ ...query, attributes: { ...query.attributes, [k]: values.filter((x) => x !== v) }, page: 1 }) });
  }
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <button key={c.key} type="button" onClick={c.remove} className="group inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface py-1.5 ps-3 pe-2 text-xs font-semibold text-fg transition hover:border-fg" aria-label={'Remove filter ' + c.label}>
          {c.label}
          <X className="h-3.5 w-3.5 text-fg-subtle group-hover:text-fg" aria-hidden="true" />
        </button>
      ))}
      <button type="button" onClick={onClear} className="px-2 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400">
        {t.listing.clearFilters}
      </button>
    </div>
  );
}

/* ---------------- ProductSort ---------------- */

const SORTS: SortOption[] = ['recommended', 'newest', 'best-selling', 'top-rated', 'price-asc', 'price-desc', 'discount'];

export function ProductSort({ value, onChange, className }: { value: SortOption; onChange: (s: SortOption) => void; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn('relative', className)}>
      <label htmlFor="sort-select" className="sr-only">
        {t.listing.sortBy}
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-line-strong bg-surface ps-3.5 pe-9 text-sm font-semibold text-fg focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {t.listing.sortBy}: {t.listing.sort[s]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-fg-subtle" aria-hidden="true">
        ▾
      </span>
    </div>
  );
}

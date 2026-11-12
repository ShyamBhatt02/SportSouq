import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product, Sport, Subcategory } from '@/types';
import { SafeImage } from '@/components/ui/SafeImage';
import { Breadcrumb, type Crumb } from '@/components/ui/Navigation';
import { SportIcon } from '@/components/common/SportIcon';
import { SectionHeading } from '@/components/common/Section';
import { ProductCarousel } from '@/components/product/ProductGrid';
import { getSportFilters } from '@/data/sports';
import { cn } from '@/utils/cn';

/* ---------------- SportCard / SportGrid ---------------- */

export function SportCard({ sport, index = 0, size = 'md' }: { sport: Sport; index?: number; size?: 'md' | 'lg' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04, duration: 0.4 }}>
      <Link to={'/sport/' + sport.slug} className="group relative block overflow-hidden rounded-[var(--radius-card)] bg-ink-900" aria-label={'Shop ' + sport.name}>
        <SafeImage src={sport.image} alt="" width={420} ratio={size === 'lg' ? 1.1 : 1.25} widths={[280, 420, 560]} sizes="(min-width: 1024px) 20vw, 45vw" wrapperClassName={size === 'lg' ? 'aspect-[10/11]' : 'aspect-[4/5]'} className="transition-transform duration-700 ease-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent" />
        <span className="absolute start-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition group-hover:bg-brand-600 group-hover:ring-brand-600">
          <SportIcon name={sport.icon} className="h-5 w-5" />
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
          <div>
            <h3 className="font-display text-lg font-extrabold leading-tight text-white sm:text-xl">{sport.slug === 'boxing' ? 'Boxing' : sport.name}</h3>
            <p className="mt-0.5 hidden text-xs text-ink-200 sm:block">{sport.tagline}</p>
          </div>
          <span className="flex h-8 w-8 shrink-0 translate-y-1 items-center justify-center rounded-full bg-white text-ink-950 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function SportGrid({ sports }: { sports: Sport[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {sports.map((s, i) => (
        <li key={s.slug}>
          <SportCard sport={s} index={i} />
        </li>
      ))}
    </ul>
  );
}

/* ---------------- SportBanner ---------------- */

interface SportBannerProps {
  title: string;
  eyebrow?: string;
  description: string;
  image: string;
  crumbs: Crumb[];
  icon?: Sport['icon'];
  stats?: { label: string; value: string }[];
  children?: ReactNode;
}

export function SportBanner({ title, eyebrow, description, image, crumbs, icon, stats, children }: SportBannerProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white">
      <SafeImage src={image} alt="" width={1600} ratio={0.45} widths={[800, 1200, 1600, 2000]} sizes="100vw" priority wrapperClassName="absolute! inset-0 -z-10 bg-ink-900" className="opacity-70" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/75 to-ink-950/10 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/60 to-transparent" />
      <div className="container-page py-10 sm:py-14 lg:py-20">
        <Breadcrumb items={crumbs} className="[&_a]:text-ink-300 [&_a:hover]:text-white [&_span]:text-white [&_ol]:text-ink-400" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 max-w-2xl">
          {eyebrow && (
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-volt-400">
              {icon && <SportIcon name={icon} className="h-4 w-4" />}
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-200 sm:text-base">{description}</p>
          {children}
          {stats && (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-ink-300">{s.label}</dt>
                  <dd className="font-display text-2xl font-extrabold">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- SportCategory (subcategory tiles) ---------------- */

export function SportCategory({ subcategories, counts }: { subcategories: Subcategory[]; counts?: Map<string, number> }) {
  const [params, setParams] = useSearchParams();
  const active = (params.get('subcategory') ?? '').split(',').filter(Boolean);
  const toggle = (slug: string) => {
    const next = new URLSearchParams(params);
    if (active.length === 1 && active[0] === slug) next.delete('subcategory');
    else next.set('subcategory', slug);
    next.delete('page');
    setParams(next, { replace: true, preventScrollReset: true });
  };
  return (
    <ul className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-7 lg:px-0">
      {subcategories.map((s) => {
        const isActive = active.includes(s.slug);
        const count = counts?.get(s.slug);
        return (
          <li key={s.slug} className="w-28 shrink-0 sm:w-32 lg:w-auto">
            <button type="button" onClick={() => toggle(s.slug)} aria-pressed={isActive} className="group block w-full text-start">
              <span className={cn('block overflow-hidden rounded-2xl ring-offset-2 ring-offset-canvas transition', isActive ? 'ring-2 ring-brand-600' : 'ring-1 ring-line group-hover:ring-fg')}>
                <SafeImage src={s.image} alt="" width={240} ratio={1} wrapperClassName="aspect-square" className="transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className={cn('mt-2 block truncate text-xs font-semibold sm:text-sm', isActive ? 'text-brand-600' : 'text-fg')}>{s.name}</span>
              {count !== undefined && <span className="block text-[11px] text-fg-subtle">{count} items</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- SportFilters (quick chips for sport-specific attributes) ---------------- */

export function SportFilters({ sport }: { sport: Sport['slug'] }) {
  const defs = getSportFilters([sport]);
  const [params, setParams] = useSearchParams();
  if (!defs.length) return null;
  const toggle = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    const current = (next.get('attr.' + key) ?? '').split(',').filter(Boolean);
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (updated.length) next.set('attr.' + key, updated.join(','));
    else next.delete('attr.' + key);
    next.delete('page');
    setParams(next, { replace: true, preventScrollReset: true });
  };
  return (
    <div className="flex flex-col gap-3">
      {defs.map((d) => {
        const selected = (params.get('attr.' + d.key) ?? '').split(',');
        return (
          <div key={d.key} className="flex flex-wrap items-center gap-2" role="group" aria-label={d.label}>
            <span className="me-1 text-xs font-bold uppercase tracking-wider text-fg-subtle">{d.label}</span>
            {d.options.map((o) => {
              const on = selected.includes(o);
              return (
                <button key={o} type="button" aria-pressed={on} onClick={() => toggle(d.key, o)} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line-strong bg-surface text-fg hover:border-fg')}>
                  {o}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- SportCollection (featured carousel block) ---------------- */

export function SportCollection({ title, description, products, loading, action }: { title: string; description?: string; products?: Product[]; loading?: boolean; action?: { label: string; to: string } }) {
  if (!loading && !products?.length) return null;
  return (
    <section className="py-10" aria-label={title}>
      <SectionHeading eyebrow="Featured" title={title} description={description} action={action} />
      <ProductCarousel products={products} loading={loading} label={title} />
    </section>
  );
}

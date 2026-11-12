import { useMemo } from 'react';
import { Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import type { ProductQuery } from '@/types';
import { useSeo } from '@/hooks/useSeo';
import { useProducts } from '@/hooks/queries';
import { nextDubaiMidnightIso } from '@/hooks/useCountdown';
import { useI18n } from '@/i18n/I18nProvider';
import { SPORTS } from '@/data/sports';
import { Breadcrumb } from '@/components/ui/Navigation';
import { Countdown } from '@/components/common/Countdown';
import { SectionHeading } from '@/components/common/Section';
import { SportIcon } from '@/components/common/SportIcon';
import { SafeImage } from '@/components/ui/SafeImage';
import { ProductCarousel } from '@/components/product/ProductGrid';
import { ProductListing } from '@/components/product/ProductListing';
import { Link } from 'react-router-dom';

function CuratedHero({ icon: Icon, eyebrow, title, description, children, crumb }: { icon: typeof Zap; eyebrow: string; title: string; description: string; children?: React.ReactNode; crumb: string }) {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-[100px]" aria-hidden="true" />
      <div className="container-page relative py-10 sm:py-14">
        <Breadcrumb items={[{ label: crumb }]} className="[&_a]:text-ink-300 [&_span]:text-white [&_ol]:text-ink-400" />
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-volt-400">
              <Icon className="h-4 w-4" aria-hidden="true" /> {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm text-ink-300 sm:text-base">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Deals ---------------- */

export function DealsPage() {
  const { t } = useI18n();
  useSeo({ title: 'Deals & flash sales', description: 'Limited-time sports deals in the UAE: flash sales, discounted boots, shoes, fitness equipment and more — with live countdowns.' });
  const scope = useMemo<ProductQuery>(() => ({ flags: ['deal'] }), []);
  const flash = useProducts({ flags: ['deal'], sort: 'discount', pageSize: 10, availability: 'in-stock' });
  const ending = useProducts({ flags: ['deal'], sort: 'discount', pageSize: 40 });
  const endingSoon = useMemo(() => [...(ending.data?.items ?? [])].filter((p) => p.dealEndsAt).sort((a, b) => a.dealEndsAt!.localeCompare(b.dealEndsAt!)).slice(0, 10), [ending.data]);

  return (
    <>
      <CuratedHero icon={Zap} eyebrow="Limited-time offers" title="Deals of the week" description="Real discounts on authentic gear — new flash deals drop every midnight (GST)." crumb={t.nav.deals}>
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-300">Today’s flash deals end in</p>
          <Countdown endsAt={nextDubaiMidnightIso()} variant="blocks" className="[&_div>div]:bg-white/10" />
        </div>
      </CuratedHero>
      <div className="container-page">
        <section className="py-10" aria-label="Flash deals">
          <SectionHeading eyebrow="Flash deals" title={<span className="flex items-center gap-2"><Flame className="h-7 w-7 text-brand-600" aria-hidden="true" /> Biggest discounts right now</span>} />
          <ProductCarousel products={flash.data?.items} loading={flash.isLoading} showCountdown label="Flash deals" />
        </section>
        <section className="py-6" aria-label="Sports deals">
          <SectionHeading eyebrow="Sports deals" title="Shop deals by sport" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {SPORTS.map((s) => (
              <li key={s.slug}>
                <Link to={'/deals?sport=' + s.slug} className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:border-fg">
                  <SafeImage src={s.image} alt="" width={120} ratio={1} wrapperClassName="h-12 w-12 shrink-0 rounded-xl" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 truncate text-sm font-bold text-fg">
                      <SportIcon name={s.icon} className="h-4 w-4 text-brand-600" />
                      {s.slug === 'boxing' ? 'Boxing' : s.name}
                    </span>
                    <span className="text-xs text-brand-600">Up to 25% off</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="py-10" aria-label="Ending soon">
          <SectionHeading eyebrow="Limited-time" title="Ending soon — don’t miss out" />
          <ProductCarousel products={endingSoon} loading={ending.isLoading} showCountdown label="Deals ending soon" />
        </section>
        <section className="pb-16 pt-4" aria-label="All discounted products">
          <SectionHeading eyebrow="All deals" title="Every discounted product" />
          <ProductListing scope={scope} defaultSort="discount" showCountdown />
        </section>
      </div>
    </>
  );
}

/* ---------------- New arrivals ---------------- */

export function NewArrivalsPage() {
  const { t } = useI18n();
  useSeo({ title: 'New arrivals', description: 'The latest sports gear just landed in the UAE — new boots, running shoes, rackets, watches and apparel.' });
  const scope = useMemo<ProductQuery>(() => ({ flags: ['newArrival'] }), []);
  return (
    <>
      <CuratedHero icon={Sparkles} eyebrow="Just landed" title="New Arrivals" description="Fresh drops from Nike, Adidas, ASICS, Garmin and more — first in the UAE." crumb={t.nav.newArrivals} />
      <div className="container-page py-10 pb-16">
        <ProductListing scope={scope} defaultSort="newest" />
      </div>
    </>
  );
}

/* ---------------- Best sellers ---------------- */

export function BestSellersPage() {
  const { t } = useI18n();
  useSeo({ title: 'Best sellers', description: 'The most popular sports gear in the UAE, ranked by what athletes are actually buying.' });
  const scope = useMemo<ProductQuery>(() => ({ flags: ['bestseller'] }), []);
  return (
    <>
      <CuratedHero icon={Trophy} eyebrow="Most loved" title="Best Sellers" description="Ranked by real orders from customers across all seven emirates." crumb={t.nav.bestSellers} />
      <div className="container-page py-10 pb-16">
        <ProductListing scope={scope} defaultSort="best-selling" />
      </div>
    </>
  );
}

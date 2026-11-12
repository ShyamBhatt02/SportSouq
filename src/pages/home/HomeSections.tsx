import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Copy, Headphones, Mail, Quote, RotateCcw, ShieldCheck, Star, Truck, Zap, Check } from 'lucide-react';
import { useProducts } from '@/hooks/queries';
import { nextDubaiMidnightIso } from '@/hooks/useCountdown';
import { useI18n } from '@/i18n/I18nProvider';
import { useToast } from '@/context/ToastContext';
import { miscService } from '@/services/orderService';
import { getErrorMessage } from '@/services/api/client';
import { newsletterSchema, type NewsletterValues } from '@/schemas';
import { SPORTS, SPORT_MAP } from '@/data/sports';
import { TESTIMONIALS } from '@/data/content';
import { SafeImage } from '@/components/ui/SafeImage';
import { ButtonLink, Button } from '@/components/ui/Button';
import { Section, SectionHeading } from '@/components/common/Section';
import { Countdown } from '@/components/common/Countdown';
import { SportIcon } from '@/components/common/SportIcon';
import { SportGrid } from '@/components/sports/SportComponents';
import { ProductCarousel } from '@/components/product/ProductGrid';
import { ProductPrice, Stars } from '@/components/product/ProductMeta';
import { cn } from '@/utils/cn';

/* ---------------- 3. Hero ---------------- */

export function Hero() {
  const { t } = useI18n();
  const { data } = useProducts({ q: 'pegasus 41', pageSize: 1 });
  const featured = data?.items[0];
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute -end-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-brand-600/25 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-48 -start-32 -z-10 h-[420px] w-[420px] rounded-full bg-volt-400/10 blur-[110px]" aria-hidden="true" />
      <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-ink-200 ring-1 ring-white/12">
            <span className="flex h-2 w-2 rounded-full bg-volt-400" aria-hidden="true" />
            The UAE’s sports superstore · 7 emirates
          </p>
          <h1 className="mt-5 font-display text-[2.9rem] font-black leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
            Gear Up.
            <br />
            <span className="relative inline-block text-brand-500">
              Play Better.
              <svg viewBox="0 0 300 12" className="absolute -bottom-2 start-0 h-3 w-full text-volt-400" preserveAspectRatio="none" aria-hidden="true">
                <motion.path d="M2 9 C 80 2, 200 2, 298 7" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.8 }} />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-300 sm:text-lg">Premium sports gear and equipment delivered across the UAE.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/shop" size="lg" rightIcon={<ArrowRight className="h-5 w-5 rtl:rotate-180" />}>
              {t.common.shopNow}
            </ButtonLink>
            <ButtonLink to="#sports" size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:border-white hover:bg-white/10">
              Explore Sports
            </ButtonLink>
          </div>
          <ul className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              ['Same-day', 'in Dubai'],
              ['AED 200+', 'free delivery'],
              ['COD', 'across UAE'],
            ].map(([a, b]) => (
              <li key={a}>
                <p className="font-display text-lg font-extrabold sm:text-xl">{a}</p>
                <p className="text-xs text-ink-400">{b}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }} className="relative lg:col-span-6">
          <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4">
            <div className="relative col-span-3 row-span-6 overflow-hidden rounded-[2rem]">
              <SafeImage src="runningTrack" alt="Sprinter in the blocks on a running track" width={720} ratio={1.45} widths={[420, 640, 860]} sizes="(min-width: 1024px) 30vw, 60vw" priority wrapperClassName="h-full min-h-[340px] sm:min-h-[460px] lg:min-h-[540px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
            </div>
            <div className="col-span-2 row-span-3 overflow-hidden rounded-[2rem]">
              <SafeImage src="footballBootBall" alt="Football boot resting on a match ball" width={460} ratio={1.15} priority wrapperClassName="h-full" />
            </div>
            <div className="col-span-2 row-span-3 overflow-hidden rounded-[2rem]">
              <SafeImage src="fitnessDumbbellGrip" alt="Athlete gripping a dumbbell" width={460} ratio={1.15} priority wrapperClassName="h-full" />
            </div>
          </div>
          {featured && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="absolute -bottom-4 start-3 max-w-[260px] sm:-start-6 sm:bottom-8">
              <Link to={'/product/' + featured.slug} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 pe-4 text-ink-950 shadow-pop transition hover:-translate-y-0.5">
                <SafeImage src={featured.thumbnail} alt="" width={120} ratio={1} wrapperClassName="h-14 w-14 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Trending now</p>
                  <p className="truncate text-sm font-bold">{featured.name}</p>
                  <ProductPrice price={featured.price} originalPrice={featured.originalPrice} size="sm" />
                </div>
              </Link>
            </motion.div>
          )}
          <div className="absolute -top-3 end-3 flex items-center gap-2 rounded-2xl bg-ink-950/80 px-3 py-2 text-xs ring-1 ring-white/10 backdrop-blur sm:end-6 sm:top-6">
            <Stars value={4.8} size="xs" />
            <span className="font-semibold">4.8/5</span>
            <span className="text-ink-400">· 12,400+ reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- 4. Shop by sport ---------------- */

export function ShopBySport() {
  return (
    <Section labelledBy="sports-heading" className="scroll-mt-28" >
      <div id="sports" className="scroll-mt-32" />
      <SectionHeading id="sports-heading" eyebrow="Shop by sport" title="Find your game" description="Ten sports, thousands of products — everything you need from first training session to final whistle." action={{ label: 'All products', to: '/shop' }} />
      <SportGrid sports={SPORTS} />
    </Section>
  );
}

/* ---------------- 5. Flash deals ---------------- */

export function FlashDeals() {
  const { data, isLoading } = useProducts({ flags: ['deal'], sort: 'discount', pageSize: 10, availability: 'in-stock' });
  return (
    <Section labelledBy="deals-heading" muted>
      <SectionHeading
        id="deals-heading"
        eyebrow="Flash deals"
        title={
          <span className="flex items-center gap-2">
            <Zap className="h-7 w-7 fill-brand-600 text-brand-600" aria-hidden="true" /> Today’s flash deals
          </span>
        }
        extra={<Countdown endsAt={nextDubaiMidnightIso()} variant="blocks" />}
        action={{ label: 'All deals', to: '/deals' }}
      />
      <ProductCarousel products={data?.items} loading={isLoading} showCountdown label="Flash deals" />
    </Section>
  );
}

/* ---------------- 6 & 7. Best sellers / New arrivals ---------------- */

export function ProductRow({ flag, eyebrow, title, to, sort }: { flag: 'bestseller' | 'newArrival'; eyebrow: string; title: string; to: string; sort: 'best-selling' | 'newest' }) {
  const { data, isLoading } = useProducts({ flags: [flag], sort, pageSize: 10 });
  return (
    <Section labelledBy={flag + '-heading'}>
      <SectionHeading id={flag + '-heading'} eyebrow={eyebrow} title={title} action={{ label: 'View all', to }} />
      <ProductCarousel products={data?.items} loading={isLoading} label={title} />
    </Section>
  );
}

/* ---------------- 8. Featured sports ---------------- */

export function FeaturedSports() {
  const featured = (['football', 'cricket', 'running', 'fitness'] as const).map((s) => SPORT_MAP[s]);
  const copy: Record<string, string> = {
    football: 'Boots for every surface, FIFA-certified balls and pro goalkeeper gear.',
    cricket: 'Grade 1 English willow, certified helmets and match-ready leather.',
    running: 'Carbon racers, daily trainers and GPS watches for every PB.',
    fitness: 'Build your home gym — weights, mats, bands and cardio.',
  };
  return (
    <Section labelledBy="featured-heading">
      <SectionHeading id="featured-heading" eyebrow="Featured sports" title="Collections built for the UAE season" />
      <div className="grid gap-4 sm:grid-cols-2">
        {featured.map((s, i) => (
          <motion.div key={s.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Link to={'/collections/' + s.slug} className="group relative block overflow-hidden rounded-[2rem] bg-ink-900">
              <SafeImage src={s.banner} alt="" width={900} ratio={0.62} widths={[480, 720, 960]} sizes="(min-width: 640px) 50vw, 100vw" wrapperClassName="aspect-[16/10]" className="transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                <div className="text-white">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-volt-400">
                    <SportIcon name={s.icon} className="h-4 w-4" /> {s.name}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black sm:text-3xl">{s.tagline}</h3>
                  <p className="mt-1.5 max-w-sm text-sm text-ink-200">{copy[s.slug]}</p>
                </div>
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink-950 transition group-hover:bg-brand-600 group-hover:text-white sm:flex">
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- 9. Sports shoes ---------------- */

export function ShoesCollection() {
  const { data, isLoading } = useProducts({ category: ['sports-shoes'], sort: 'best-selling', pageSize: 8 });
  return (
    <Section labelledBy="shoes-heading" muted>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Link to="/category/sports-shoes" className="group relative overflow-hidden rounded-[2rem] bg-brand-600 lg:col-span-4">
          <SafeImage src="shoeRed" alt="Red performance running shoe" width={640} ratio={1.2} wrapperClassName="aspect-[4/3] lg:aspect-auto lg:h-full" className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-volt-400">Sports shoes</p>
            <h2 id="shoes-heading" className="mt-2 font-display text-3xl font-black">Engineered for every surface</h2>
            <p className="mt-2 text-sm text-ink-200">Football, running, court, training and trail — sizes 38 to 45.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold">
              Shop all footwear <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" aria-hidden="true" />
            </span>
          </div>
        </Link>
        <div className="min-w-0 lg:col-span-8">
          <ProductCarousel products={data?.items} loading={isLoading} label="Sports shoes" />
        </div>
      </div>
    </Section>
  );
}

/* ---------------- 10. Sportswear with tabs ---------------- */

const WEAR_TABS = [
  { key: 'jerseys', label: 'Jerseys' },
  { key: 't-shirts', label: 'T-Shirts' },
  { key: 'shorts', label: 'Shorts' },
  { key: 'tracksuits', label: 'Tracksuits & layers' },
];

export function SportswearCollection() {
  const [tab, setTab] = useState('t-shirts');
  const subs = tab === 'tracksuits' ? ['tracksuits', 'jackets', 'training-clothing', 'leggings'] : [tab];
  const { data, isLoading, isFetching } = useProducts({ category: ['sportswear'], subcategory: subs, sort: 'best-selling', pageSize: 8 });
  return (
    <Section labelledBy="wear-heading">
      <SectionHeading id="wear-heading" eyebrow="Sportswear" title="Kit that keeps up in the heat" description="Moisture-wicking, UV-protective and built for 40°C summers." action={{ label: 'Shop sportswear', to: '/category/sportswear' }} />
      <div role="tablist" aria-label="Sportswear categories" className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {WEAR_TABS.map((w) => (
          <button key={w.key} role="tab" type="button" aria-selected={tab === w.key} onClick={() => setTab(w.key)} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition', tab === w.key ? 'border-fg bg-fg text-canvas' : 'border-line-strong text-fg hover:border-fg')}>
            {w.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={cn('transition-opacity', isFetching && 'opacity-60')}>
        <ProductCarousel products={data?.items} loading={isLoading} label="Sportswear" />
      </div>
    </Section>
  );
}

/* ---------------- 11. UAE exclusive deals ---------------- */

export function UaeDeals() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText('UAE55');
      setCopied(true);
      toast.success('Code UAE55 copied', { description: 'Apply it in your bag at checkout.' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info('Your code is UAE55');
    }
  };
  return (
    <section className="py-12 sm:py-16" aria-labelledby="uae-heading">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink-950 text-white">
          <SafeImage src="dubaiBurjAlArab" alt="" width={1400} ratio={0.5} widths={[700, 1100, 1500]} sizes="100vw" wrapperClassName="absolute! inset-0 -z-10" className="opacity-55" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent rtl:bg-gradient-to-l" />
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:p-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">UAE exclusive · National Day</p>
              <h2 id="uae-heading" className="mt-5 font-display text-4xl font-black leading-tight sm:text-5xl">
                Train More.
                <br />
                <span className="text-volt-400">Spend Less.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-200 sm:text-base">
                Celebrate the UAE’s 55th National Day with 15% off everything over AED 150 — plus free same-day delivery in Dubai on orders above AED 200.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button type="button" onClick={copy} className="group flex items-center gap-3 rounded-2xl border-2 border-dashed border-white/40 bg-white/5 px-5 py-3 backdrop-blur transition hover:border-volt-400" aria-label="Copy coupon code UAE55">
                  <span className="font-display text-2xl font-black tracking-[0.15em]">UAE55</span>
                  {copied ? <Check className="h-5 w-5 text-volt-400" aria-hidden="true" /> : <Copy className="h-5 w-5 text-ink-300 group-hover:text-white" aria-hidden="true" />}
                </button>
                <ButtonLink to="/deals" size="lg">
                  Shop UAE deals
                </ButtonLink>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-3 self-end">
              {[
                ['15% off', 'with code UAE55'],
                ['Same-day', 'Dubai before 2pm'],
                ['COD', 'all 7 emirates'],
                ['30 days', 'free returns'],
              ].map(([a, b]) => (
                <li key={a} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10 backdrop-blur-md">
                  <p className="font-display text-xl font-extrabold">{a}</p>
                  <p className="text-xs text-ink-300">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 12. Why SportSouq ---------------- */

export function WhySportSouq() {
  const items = [
    { icon: Truck, title: 'Fast UAE Delivery', text: 'Same-day in Dubai, next day to Abu Dhabi and Sharjah, and 2–3 days to every other emirate.' },
    { icon: ShieldCheck, title: 'Secure Checkout', text: 'Encrypted payments with Visa, Mastercard, Amex and Apple Pay — or pay cash on delivery.' },
    { icon: RotateCcw, title: 'Easy Returns', text: '30 days to change your mind. We collect from your door anywhere in the UAE, free.' },
    { icon: BadgeCheck, title: 'Authentic Products', text: 'Sourced directly from brands and authorised distributors. Every item, guaranteed genuine.' },
    { icon: Headphones, title: 'Customer Support', text: 'Real people on chat, WhatsApp and phone — Monday to Saturday, 9am to 9pm.' },
  ];
  return (
    <Section labelledBy="why-heading" muted>
      <SectionHeading id="why-heading" eyebrow="Why SportSouq?" title="Built for athletes in the Emirates" align="center" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((it, i) => (
          <motion.li key={it.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-line">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <it.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold text-fg">{it.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{it.text}</p>
          </motion.li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------------- 13. Testimonials ---------------- */

export function Testimonials() {
  return (
    <Section labelledBy="reviews-heading">
      <SectionHeading id="reviews-heading" eyebrow="Customer reviews" title="Loved by 40,000+ athletes across the UAE" description="Rated 4.8/5 from over 12,400 verified reviews." />
      <ul className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {TESTIMONIALS.map((tst) => (
          <li key={tst.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
            <figure className="flex h-full flex-col rounded-3xl border border-line bg-surface p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5" aria-label={tst.rating + ' out of 5 stars'}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < tst.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200')} aria-hidden="true" />
                  ))}
                </div>
                <Quote className="h-7 w-7 text-brand-200 dark:text-brand-900" aria-hidden="true" />
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-fg">“{tst.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <SafeImage src={tst.avatar} alt={tst.name} width={96} ratio={1} wrapperClassName="h-11 w-11 shrink-0 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-fg">{tst.name}</p>
                  <p className="text-xs text-fg-subtle">
                    {tst.location} · {tst.sport}
                  </p>
                </div>
                <span className="ms-auto flex items-center gap-1 text-[11px] font-semibold text-success-600">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------------- 14. Newsletter ---------------- */

export function Newsletter() {
  const { t } = useI18n();
  const toast = useToast();
  const [done, setDone] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NewsletterValues>({ resolver: zodResolver(newsletterSchema) });
  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const res = await miscService.subscribe(email);
      setDone(res.alreadySubscribed ? t.footer.alreadySubscribed : t.footer.subscribed);
      toast.success(res.alreadySubscribed ? t.footer.alreadySubscribed : t.footer.subscribed);
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });
  return (
    <section className="pb-16 pt-4" aria-labelledby="newsletter-heading">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-600 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 end-40 h-64 w-64 rounded-full bg-brand-500/60" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 id="newsletter-heading" className="font-display text-3xl font-black sm:text-4xl">
                {t.footer.newsletterTitle}
              </h2>
              <p className="mt-3 max-w-md text-sm text-brand-50 sm:text-base">{t.footer.newsletterText}</p>
            </div>
            <div>
              {done ? (
                <p role="status" className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 text-sm font-semibold">
                  <Check className="h-5 w-5" aria-hidden="true" /> {done}
                </p>
              ) : (
                <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label htmlFor="newsletter-email" className="sr-only">
                      {t.auth.email}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                      <input id="newsletter-email" type="email" autoComplete="email" placeholder={t.footer.emailPlaceholder} aria-invalid={!!errors.email || undefined} aria-describedby={errors.email ? 'newsletter-error' : undefined} className="h-13 w-full rounded-2xl bg-white ps-12 pe-4 text-sm text-ink-950 placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-white/40" {...register('email')} />
                    </div>
                    {errors.email && (
                      <p id="newsletter-error" role="alert" className="mt-1.5 text-xs font-semibold text-white">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" variant="secondary" size="lg" loading={isSubmitting} className="dark:bg-ink-950 dark:text-white">
                    {t.footer.subscribe}
                  </Button>
                </form>
              )}
              <p className="mt-3 text-xs text-brand-100">No spam. Unsubscribe anytime. By subscribing you agree to our privacy policy.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import type { ProductQuery, SportSlug } from '@/types';
import { useSeo } from '@/hooks/useSeo';
import { useProducts } from '@/hooks/queries';
import { getSport } from '@/data/sports';
import { SafeImage } from '@/components/ui/SafeImage';
import { SportBanner, SportCollection, SportFilters } from '@/components/sports/SportComponents';
import { ProductListing } from '@/components/product/ProductListing';
import { NotFoundContent } from '@/pages/errors/NotFoundPage';

/** Editorial copy per collection (sold-in stories, not just a filtered grid). */
const STORIES: Partial<Record<SportSlug, { headline: string; body: string; points: string[]; image: string; secondary: string }>> = {
  football: {
    headline: 'From cage football to club pitch',
    body: 'Most UAE football is played on artificial grass and turf, often after sunset. We stock boots engineered for exactly those surfaces — plus FIFA-certified balls, keeper gloves that grip in humidity and kit that breathes in 35°C evenings.',
    points: ['AG & TF boots for UAE surfaces', 'FIFA Quality Pro match balls', 'Academy & team kit orders'],
    image: 'footballKick',
    secondary: 'footballKids',
  },
  cricket: {
    headline: 'Willow, leather and serious protection',
    body: 'Every English willow bat is graded, knocked-in and oiled by our partner workshop in Sharjah before dispatch, so it’s ready for the nets the day it arrives. Helmets meet BS 7928:2013, and our leather balls are hand-stitched.',
    points: ['Bats pre-knocked & oiled', 'BS 7928:2013 certified helmets', 'Junior sizes for academies'],
    image: 'cricketGlovesBall',
    secondary: 'cricketStadiumDusk',
  },
  running: {
    headline: 'Built for heat, humidity and PBs',
    body: 'From Kite Beach sunrise runs to the Dubai Marathon, our running team selects shoes, watches and hydration gear that perform when it’s 30°C at 6am. Breathable uppers, cold-for-24-hours bottles and multi-band GPS that works between towers.',
    points: ['Road, trail and carbon race shoes', 'Multi-band GPS watches', 'Insulated hydration'],
    image: 'runningSunset',
    secondary: 'runningStairs',
  },
  fitness: {
    headline: 'Your home gym, delivered',
    body: 'Train indoors when summer peaks. Space-saving adjustable dumbbells, floor-friendly rubber weights, studio-grade spin bikes and mats that grip — with two-person delivery and setup for large equipment.',
    points: ['Free setup for large equipment', 'Apartment-friendly kit', 'Yoga, strength & cardio'],
    image: 'gymBright',
    secondary: 'yogaSunset',
  },
  tennis: {
    headline: 'Rackets for every playing style',
    body: 'Whether you play the hard courts at your compound or the clay at a club, find control, spin and power frames from Wilson, Babolat and Yonex — plus stringing advice from our team and bags that protect strings from the heat.',
    points: ['Grip sizes L1–L4', 'Heat-shield racket bags', 'Extra-duty hard-court balls'],
    image: 'tennisPlayer',
    secondary: 'tennisCourt',
  },
};

export function CollectionPage() {
  const { slug } = useParams();
  const sport = getSport(slug);
  const story = sport ? STORIES[sport.slug] : undefined;
  const scope = useMemo<ProductQuery>(() => (sport ? { sport: [sport.slug] } : {}), [sport]);
  const featured = useProducts({ sport: sport ? [sport.slug] : [], flags: ['featured'], pageSize: 10 }, { enabled: !!sport });
  const bestsellers = useProducts({ sport: sport ? [sport.slug] : [], sort: 'best-selling', pageSize: 10 }, { enabled: !!sport });

  useSeo({ title: sport ? sport.name + ' Collection' : 'Collection not found', description: story?.body ?? sport?.description, image: sport?.banner, noindex: !story });

  if (!sport || !story) return <NotFoundContent />;
  const highlight = featured.data?.items.length ? featured.data.items : bestsellers.data?.items;

  return (
    <>
      <SportBanner
        title={sport.name + ' Collection'}
        eyebrow="SportSouq collections"
        description={sport.description}
        image={sport.banner}
        icon={sport.icon}
        crumbs={[{ label: 'Collections', to: '/shop' }, { label: sport.name }]}
      />
      <div className="container-page">
        <section className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-14" aria-labelledby="story-heading">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">The collection</p>
            <h2 id="story-heading" className="mt-2 text-3xl font-black tracking-tight text-fg sm:text-4xl">
              {story.headline}
            </h2>
            <p className="mt-4 leading-relaxed text-fg-muted">{story.body}</p>
            <ul className="mt-6 space-y-3">
              {story.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm font-semibold text-fg">
                  <CheckCircle2 className="h-5 w-5 text-success-600" aria-hidden="true" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <SafeImage src={story.image} alt={sport.name + ' in action'} width={640} ratio={1.3} wrapperClassName="col-span-3 rounded-3xl aspect-[3/4]" />
            <SafeImage src={story.secondary} alt="" width={420} ratio={1.6} wrapperClassName="col-span-2 mt-10 rounded-3xl aspect-[3/5]" />
          </div>
        </section>
        <SportCollection title={'Featured in ' + sport.name} description="Hand-picked by our team this season." products={highlight} loading={featured.isLoading} />
        <section className="pb-16" aria-label={'Shop the ' + sport.name + ' collection'}>
          <div className="mb-6 flex flex-col gap-4 border-t border-line pt-8">
            <h2 className="text-2xl font-extrabold text-fg">Shop the collection</h2>
            <SportFilters sport={sport.slug} />
          </div>
          <ProductListing scope={scope} />
        </section>
      </div>
    </>
  );
}

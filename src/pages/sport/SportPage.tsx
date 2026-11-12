import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { ProductQuery } from '@/types';
import { useSeo } from '@/hooks/useSeo';
import { useCategories, useProducts } from '@/hooks/queries';
import { useI18n } from '@/i18n/I18nProvider';
import { getSport } from '@/data/sports';
import { SportBanner, SportCategory, SportCollection, SportFilters } from '@/components/sports/SportComponents';
import { ProductListing } from '@/components/product/ProductListing';
import { ButtonLink } from '@/components/ui/Button';
import { NotFoundContent } from '@/pages/errors/NotFoundPage';

export function SportPage() {
  const { slug } = useParams();
  const { t } = useI18n();
  const sport = getSport(slug);
  const categories = useCategories();
  const scope = useMemo<ProductQuery>(() => (sport ? { sport: [sport.slug] } : {}), [sport]);
  const summary = useProducts({ sport: sport ? [sport.slug] : [], pageSize: 1 }, { enabled: !!sport });
  const featured = useProducts({ sport: sport ? [sport.slug] : [], sort: 'recommended', pageSize: 10, availability: 'in-stock' }, { enabled: !!sport });

  useSeo({
    title: sport ? sport.name + ' gear & equipment' : t.errors.notFoundTitle,
    description: sport?.description,
    image: sport?.banner,
    noindex: !sport,
  });

  const counts = useMemo(() => new Map(summary.data?.facets.subcategories.map((s) => [s.value, s.count]) ?? []), [summary.data]);
  if (!sport) return <NotFoundContent />;

  const category = categories.data?.find((c) => c.slug === sport.slug);
  const subcategories = category?.subcategories ?? [];
  const brandCount = summary.data?.facets.brands.length;

  return (
    <>
      <SportBanner
        title={sport.name}
        eyebrow={sport.tagline}
        description={sport.description}
        image={sport.banner}
        icon={sport.icon}
        crumbs={[{ label: t.nav.sports, to: '/shop' }, { label: sport.name }]}
        stats={summary.data ? [{ label: 'Products', value: String(summary.data.total) }, { label: 'Brands', value: String(brandCount ?? 0) }, { label: 'Delivery', value: 'Same-day DXB' }] : undefined}
      >
        {sport.hasCollection && (
          <ButtonLink to={'/collections/' + sport.slug} variant="outline" className="mt-6 border-white/30 bg-white/5 text-white hover:border-white hover:bg-white/10">
            Explore the {sport.name} collection
          </ButtonLink>
        )}
      </SportBanner>
      <div className="container-page">
        {subcategories.length > 0 && (
          <section className="pt-8" aria-label="Subcategories">
            <h2 className="mb-4 text-lg font-bold text-fg">Shop {sport.name.toLowerCase()} by type</h2>
            <SportCategory subcategories={subcategories} counts={counts} />
          </section>
        )}
        <SportCollection title={'Featured ' + sport.name.toLowerCase() + ' gear'} products={featured.data?.items} loading={featured.isLoading} />
        <section className="pb-16" aria-label={'All ' + sport.name + ' products'}>
          <div className="mb-6 flex flex-col gap-4 border-t border-line pt-8">
            <h2 className="text-2xl font-extrabold text-fg">All {sport.name.toLowerCase()} products</h2>
            <SportFilters sport={sport.slug} />
          </div>
          <ProductListing scope={scope} />
        </section>
      </div>
    </>
  );
}

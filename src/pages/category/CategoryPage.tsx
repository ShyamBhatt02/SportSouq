import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import type { CategorySlug, ProductQuery } from '@/types';
import { useSeo } from '@/hooks/useSeo';
import { useCategories, useProducts } from '@/hooks/queries';
import { getSubcategory } from '@/data/categories';
import { getSport } from '@/data/sports';
import { SportBanner, SportCategory } from '@/components/sports/SportComponents';
import { ProductListing } from '@/components/product/ProductListing';
import { PageSpinner } from '@/components/ui/Spinner';
import { NotFoundContent } from '@/pages/errors/NotFoundPage';

export function CategoryPage() {
  const { slug } = useParams();
  const categories = useCategories();
  const category = categories.data?.find((c) => c.slug === slug);
  const scope = useMemo<ProductQuery>(() => (category ? { category: [category.slug as CategorySlug] } : {}), [category]);
  const summary = useProducts({ category: category ? [category.slug] : [], pageSize: 1 }, { enabled: !!category });
  const counts = useMemo(() => new Map(summary.data?.facets.subcategories.map((s) => [s.value, s.count]) ?? []), [summary.data]);

  useSeo({ title: category ? category.name : 'Category', description: category?.description, image: category?.image, noindex: !category && !categories.isLoading });

  if (categories.isLoading) return <PageSpinner />;
  if (!category) {
    // Support /category/<subcategory-slug> by redirecting to its parent with a filter.
    const sub = getSubcategory(slug);
    if (sub) return <Navigate to={'/category/' + sub.category + '?subcategory=' + sub.slug} replace />;
    return <NotFoundContent />;
  }
  const sport = getSport(category.slug);

  return (
    <>
      <SportBanner
        title={category.name}
        eyebrow={category.isSport ? 'Sport category' : 'Category'}
        description={sport?.description ?? category.description}
        image={sport?.banner ?? category.image}
        icon={sport?.icon}
        crumbs={[{ label: 'Shop', to: '/shop' }, { label: category.name }]}
        stats={summary.data ? [{ label: 'Products', value: String(summary.data.total) }, { label: 'Types', value: String(category.subcategories.length) }] : undefined}
      />
      <div className="container-page">
        <section className="pt-8" aria-label="Subcategories">
          <h2 className="mb-4 text-lg font-bold text-fg">Browse {category.name.toLowerCase()}</h2>
          <SportCategory subcategories={category.subcategories} counts={counts} />
        </section>
        <section className="pb-16 pt-10" aria-label={'All ' + category.name}>
          <ProductListing scope={scope} />
        </section>
      </div>
    </>
  );
}

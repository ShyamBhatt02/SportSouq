import { Link, useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { useProducts } from '@/hooks/queries';
import { useI18n } from '@/i18n/I18nProvider';
import { POPULAR_SEARCHES } from '@/data/content';
import { SPORTS } from '@/data/sports';
import { sanitizeQuery } from '@/utils/sanitize';
import { PageHeader } from '@/components/common/Section';
import { Breadcrumb } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/States';
import { ProductListing } from '@/components/product/ProductListing';
import { ProductRecommendations } from '@/components/product/ProductRecommendations';
import { SearchBox } from '@/components/layout/SearchBox';

export function SearchPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const q = sanitizeQuery(params.get('q') ?? '');
  // Lightweight probe so the zero-result state can show richer guidance than the grid's empty state.
  const probe = useProducts({ q, pageSize: 1 }, { enabled: q.length > 0 });
  useSeo({ title: q ? t.search.resultsFor(q) : t.search.title, description: 'Search SportSouq for sports gear by product, brand, sport, SKU or category.', noindex: true });

  const noResults = q && probe.data && probe.data.total === 0;

  return (
    <>
      <PageHeader title={q ? t.search.resultsFor(q) : t.search.title} description={q && probe.data ? t.common.products(probe.data.total) : 'Search by product name, brand, sport, category, SKU or tag.'}>
        <Breadcrumb items={[{ label: t.search.title }]} />
      </PageHeader>
      <div className="container-page py-8">
        {!q ? (
          <div className="mx-auto max-w-2xl">
            <SearchBox variant="overlay" autoFocus />
          </div>
        ) : noResults ? (
          <>
            <EmptyState
              icon={SearchX}
              title={t.search.noResults(q)}
              description={t.search.noResultsHint}
              action={
                <div className="flex max-w-xl flex-wrap justify-center gap-2">
                  {[...POPULAR_SEARCHES.slice(0, 5)].map((term) => (
                    <Link key={term} to={'/search?q=' + encodeURIComponent(term)} className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm font-semibold text-fg hover:border-fg">
                      {term}
                    </Link>
                  ))}
                  {SPORTS.slice(0, 4).map((s) => (
                    <Link key={s.slug} to={'/sport/' + s.slug} className="rounded-full bg-surface-muted px-3.5 py-1.5 text-sm font-semibold text-fg hover:bg-surface-sunken">
                      {s.name}
                    </Link>
                  ))}
                </div>
              }
            />
            <ProductRecommendations kind="best-sellers" />
          </>
        ) : (
          <ProductListing />
        )}
      </div>
    </>
  );
}

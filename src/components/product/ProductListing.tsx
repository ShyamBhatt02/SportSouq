import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import type { ProductQuery, SortOption } from '@/types';
import { useProducts } from '@/hooks/queries';
import { useI18n } from '@/i18n/I18nProvider';
import { activeFilterCount, paramsFromQuery, queryFromParams } from '@/utils/productQuery';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Overlay';
import { Pagination } from '@/components/ui/Navigation';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ProductGrid } from './ProductGrid';
import { ActiveFilters, ProductFilters, ProductSort } from './ProductFilters';

interface ProductListingProps {
  /** Fixed scope for the page (e.g. sport=football). Not editable by filters. */
  scope?: ProductQuery;
  pageSize?: number;
  showCountdown?: boolean;
  emptyAction?: ReactNode;
  defaultSort?: SortOption;
  headerSlot?: ReactNode;
}

const PAGE_SIZE = 12;

/**
 * Shared listing engine for Shop, Sport, Category, Collection, Search, Deals,
 * New Arrivals and Best Sellers. Filters, sort and page are kept in the URL.
 */
export function ProductListing({ scope = {}, pageSize = PAGE_SIZE, showCountdown, emptyAction, defaultSort = 'recommended', headerSlot }: ProductListingProps) {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const userQuery = useMemo(() => queryFromParams(params), [params]);
  const locked = useMemo(() => (Object.keys(scope) as (keyof ProductQuery)[]).filter((k) => scope[k] !== undefined), [scope]);
  const query = useMemo<ProductQuery>(
    () => ({ ...userQuery, ...scope, sort: userQuery.sort ?? defaultSort, pageSize, attributes: { ...userQuery.attributes, ...scope.attributes } }),
    [userQuery, scope, defaultSort, pageSize],
  );
  const { data, isLoading, isFetching, isError, refetch } = useProducts(query);

  const update = useCallback(
    (next: ProductQuery) => {
      const clean: ProductQuery = { ...next };
      for (const k of locked) delete clean[k];
      if (clean.sort === defaultSort) delete clean.sort;
      setParams(paramsFromQuery(clean), { replace: true, preventScrollReset: true });
    },
    [locked, setParams, defaultSort],
  );

  const clearAll = () => {
    const keep = new URLSearchParams();
    const q = params.get('q');
    if (q && !locked.includes('q')) keep.set('q', q);
    setParams(keep, { replace: true, preventScrollReset: true });
  };

  const onPage = (page: number) => {
    update({ ...userQuery, page });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filterCount = activeFilterCount(userQuery, locked);
  const total = data?.total ?? 0;
  const from = total ? (data!.page - 1) * data!.pageSize + 1 : 0;
  const to = total ? Math.min(total, data!.page * data!.pageSize) : 0;

  const filters = <ProductFilters query={query} facets={data?.facets} onChange={update} locked={locked} />;

  return (
    <div ref={topRef} className="scroll-mt-28 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 xl:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block" aria-label={t.listing.filters}>
        <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pe-2 [scrollbar-width:thin]">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-bold text-fg">{t.listing.filters}</h2>
            {filterCount > 0 && (
              <button type="button" onClick={clearAll} className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400">
                {t.common.clearAll}
              </button>
            )}
          </div>
          {filters}
        </div>
      </aside>

      <div className="min-w-0">
        {headerSlot}
        <div className="sticky top-[var(--header-h,64px)] z-20 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <p className="shrink-0 text-xs text-fg-muted sm:text-sm" aria-live="polite">
            {isLoading ? t.common.loading : total ? (<><span className="sm:hidden">{t.common.products(total)}</span><span className="hidden sm:inline">{t.listing.showing(from, to, total)}</span></>) : t.common.products(0)}
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawerOpen(true)} leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
              {t.listing.filters}
              {filterCount > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{filterCount}</span>}
            </Button>
            <ProductSort value={query.sort ?? defaultSort} onChange={(sort) => update({ ...userQuery, sort, page: 1 })} className="w-36 min-w-0 sm:w-60" />
          </div>
        </div>

        <div className="mb-5">
          <ActiveFilters query={userQuery} facets={data?.facets} onChange={update} locked={locked} onClear={clearAll} />
        </div>

        {isError ? (
          <ErrorState title={t.search.searchFailed} description={t.errors.genericHint} onRetry={() => refetch()} />
        ) : (
          <ProductGrid
            products={data?.items}
            loading={isLoading || (isFetching && !data)}
            skeletonCount={pageSize > 12 ? 12 : pageSize}
            showCountdown={showCountdown}
            empty={
              <EmptyState
                icon={PackageSearch}
                title={t.listing.noProducts}
                description={t.listing.noProductsHint}
                action={
                  <>
                    {filterCount > 0 && <Button onClick={clearAll}>{t.listing.clearFilters}</Button>}
                    {emptyAction}
                  </>
                }
              />
            }
          />
        )}

        {data && <Pagination className="mt-12" page={data.page} totalPages={data.totalPages} onChange={onPage} />}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="bottom"
        title={
          <>
            {t.listing.filters}
            {filterCount > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{filterCount}</span>}
          </>
        }
        headerExtra={
          filterCount > 0 ? (
            <button type="button" onClick={clearAll} className="me-2 text-sm font-bold text-brand-600">
              {t.common.clearAll}
            </button>
          ) : undefined
        }
        footer={
          <Button fullWidth size="lg" onClick={() => setDrawerOpen(false)} loading={isFetching}>
            {t.listing.showResults(total)}
          </Button>
        }
      >
        <div className="px-5 pb-4">{filters}</div>
      </Drawer>
    </div>
  );
}

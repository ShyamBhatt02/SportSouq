import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '@/types';
import { useBoughtTogether, useProducts, useProductsByIds, useRecommendations, useRelatedProducts } from '@/hooks/queries';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useWishlist } from '@/context/WishlistContext';
import { useCartActions, defaultVariant } from '@/hooks/useCartActions';
import { useI18n } from '@/i18n/I18nProvider';
import { SectionHeading } from '@/components/common/Section';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { ProductCarousel } from './ProductGrid';
import { ProductPrice } from './ProductMeta';

type Kind = 'related' | 'recently-viewed' | 'recommended' | 'best-sellers';

/** One component, four recommendation strategies (all driven by sport/category relationships). */
export function ProductRecommendations({ kind, product, excludeId, title }: { kind: Kind; product?: Product; excludeId?: string; title?: string }) {
  const { t } = useI18n();
  const recent = useRecentlyViewed();
  const wishlist = useWishlist();
  const recentIds = useMemo(() => recent.ids.filter((id) => id !== excludeId).slice(0, 12), [recent.ids, excludeId]);
  const seedIds = useMemo(() => Array.from(new Set([...recent.ids, ...wishlist.ids])), [recent.ids, wishlist.ids]);

  const related = useRelatedProducts(kind === 'related' ? product?.id : undefined);
  const recentQ = useProductsByIds(kind === 'recently-viewed' ? recentIds : []);
  const recommended = useRecommendations(kind === 'recommended' ? seedIds : []);
  const best = useProducts({ flags: ['bestseller'], sort: 'best-selling', pageSize: 10 }, { enabled: kind === 'best-sellers' });

  const config = {
    related: { title: t.product.related, data: related.data, loading: related.isLoading },
    'recently-viewed': { title: t.product.recentlyViewed, data: recentQ.data, loading: recentQ.isLoading && recentIds.length > 0 },
    recommended: { title: t.product.recommended, data: recommended.data, loading: recommended.isLoading },
    'best-sellers': { title: t.nav.bestSellers, data: best.data?.items, loading: best.isLoading },
  }[kind];

  const items = config.data?.filter((p) => p.id !== excludeId);
  if (kind === 'recently-viewed' && !recentIds.length) return null;
  if (!config.loading && !items?.length) return null;

  return (
    <section className="py-10 sm:py-12" aria-label={title ?? config.title}>
      <SectionHeading title={title ?? config.title} action={kind === 'best-sellers' ? { label: t.common.viewAll, to: '/best-sellers' } : undefined} />
      <ProductCarousel products={items} loading={config.loading} label={title ?? config.title} />
    </section>
  );
}

/** "Frequently bought together" bundle with selectable items and a combined add-to-bag. */
export function FrequentlyBoughtTogether({ product }: { product: Product }) {
  const { t } = useI18n();
  const { data } = useBoughtTogether(product.id);
  const { addToCart } = useCartActions();
  const bundle = useMemo(() => [product, ...(data ?? []).filter((p) => p.variantAxes.length === 0 || p.variants.some((v) => v.stock > 0)).slice(0, 2)], [product, data]);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => setSelected(bundle.map((p) => p.id)), [bundle]);

  if (!data?.length) return null;
  const chosen = bundle.filter((p) => selected.includes(p.id));
  const total = chosen.reduce((s, p) => s + p.price, 0);

  const addAll = () => {
    let added = 0;
    for (const p of chosen) if (addToCart(p, defaultVariant(p), 1, { silent: chosen.length > 1 && p !== chosen[chosen.length - 1] })) added++;
    return added;
  };

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="fbt-title">
      <h2 id="fbt-title" className="text-xl font-extrabold text-fg">
        {t.product.boughtTogether}
      </h2>
      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
        <ul className="flex flex-1 flex-wrap items-center gap-3">
          {bundle.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3">
              {i > 0 && <Plus className="h-5 w-5 shrink-0 text-fg-subtle" aria-hidden="true" />}
              <label className={cn('relative block w-28 cursor-pointer sm:w-36', !selected.includes(p.id) && 'opacity-50')}>
                <input
                  type="checkbox"
                  className="absolute start-2 top-2 z-10 h-5 w-5 accent-brand-600"
                  checked={selected.includes(p.id)}
                  disabled={i === 0}
                  onChange={() => setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                  aria-label={'Include ' + p.name}
                />
                <SafeImage src={p.thumbnail} alt={p.name} width={240} ratio={1} wrapperClassName="aspect-square rounded-2xl" />
                <span className="mt-2 line-clamp-2 block text-xs font-semibold text-fg">{i === 0 ? 'This item: ' : ''}{p.name}</span>
                <ProductPrice price={p.price} originalPrice={p.originalPrice} size="sm" className="mt-1" />
              </label>
              {i > 0 && (
                <Link to={'/product/' + p.slug} className="sr-only">
                  View {p.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 flex-col gap-3 rounded-2xl bg-surface-muted p-5 lg:w-64">
          <p className="text-sm text-fg-muted">{t.product.boughtTogetherTotal}</p>
          <p className="font-display text-2xl font-extrabold text-fg">{formatPrice(total)}</p>
          <Button onClick={addAll} disabled={!chosen.length}>
            {t.product.addSelected(chosen.length)}
          </Button>
        </div>
      </div>
    </section>
  );
}

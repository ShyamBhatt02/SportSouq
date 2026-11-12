import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, PackageX, Share2, ShieldCheck, Zap } from 'lucide-react';
import { useProduct } from '@/hooks/queries';
import { useSeo } from '@/hooks/useSeo';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCartActions } from '@/hooks/useCartActions';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { getErrorStatus } from '@/services/api/client';
import { SPORT_MAP } from '@/data/sports';
import { getSubcategory } from '@/data/categories';
import { SITE, MAX_QTY_PER_LINE } from '@/config/site';
import { imageUrl } from '@/data/images';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Breadcrumb } from '@/components/ui/Navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Tabs } from '@/components/ui/Disclosure';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Countdown } from '@/components/common/Countdown';
import { DeliveryPerks } from '@/components/common/DeliveryPerks';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductBadge, ProductPrice, ProductRating, StockStatus, productBadges } from '@/components/product/ProductMeta';
import { VariantSelector, matchesSelection, useVariantSelection } from '@/components/product/VariantSelector';
import { ProductDeliveryInfo, ProductSpecifications } from '@/components/product/ProductDetails';
import { FrequentlyBoughtTogether, ProductRecommendations } from '@/components/product/ProductRecommendations';
import { ProductReviews } from '@/components/product/ProductReviews';

function ProductPageSkeleton() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Loading product">
      <Skeleton className="h-3 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        <Skeleton className="aspect-square rounded-3xl lg:col-span-7" />
        <div className="space-y-5 lg:col-span-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-48" />
          <SkeletonText lines={3} />
          <div className="flex gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-12 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-13 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductPage() {
  const { slug } = useParams();
  const { t } = useI18n();
  const toast = useToast();
  const { data: product, isLoading, error, refetch } = useProduct(slug);
  const { selection, variant, preview, select, isAvailable, missing } = useVariantSelection(product);
  const { addToCart, buyNow, toggleWishlist, isWishlisted } = useCartActions();
  const recent = useRecentlyViewed();
  const [qty, setQty] = useState(1);
  const [showError, setShowError] = useState(false);
  const [added, setAdded] = useState(false);
  const { track } = recent;

  useEffect(() => {
    if (product) track(product.id);
  }, [product, track]);

  useEffect(() => {
    setQty(1);
    setShowError(false);
  }, [product?.id]);

  const sport = product ? SPORT_MAP[product.sport] : undefined;
  const display = preview ?? product?.variants[0];
  const price = display?.price ?? product?.price ?? 0;

  useSeo({
    title: product ? product.name + ' — ' + formatPrice(price) : isLoading ? 'Loading…' : t.product.notFound,
    description: product ? product.shortDescription + ' Buy online in the UAE with fast delivery and Cash on Delivery.' : undefined,
    image: product?.thumbnail,
    type: 'product',
    noindex: !product && !isLoading,
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.images.map((i) => imageUrl(i, 1200, 1200)),
          description: product.shortDescription,
          sku: product.sku,
          brand: { '@type': 'Brand', name: product.brand },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount },
          offers: {
            '@type': 'Offer',
            url: SITE.url + '/product/' + product.slug,
            priceCurrency: 'AED',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            areaServed: 'AE',
          },
        }
      : null,
  });

  if (isLoading) return <ProductPageSkeleton />;
  if (error || !product) {
    const notFound = getErrorStatus(error) === 404;
    return (
      <div className="container-page">
        {notFound ? (
          <EmptyState icon={PackageX} title={t.product.notFound} description={t.product.notFoundHint} action={<ButtonLink to="/shop">{t.common.shopNow}</ButtonLink>} />
        ) : (
          <ErrorState onRetry={() => refetch()} />
        )}
      </div>
    );
  }

  // Before a full selection, show stock across all variants matching the partial choice (e.g. all sizes of Crimson).
  const stock = variant ? variant.stock : product.variants.filter((v) => matchesSelection(v, selection)).reduce((s, v) => s + v.stock, 0);
  const soldOut = product.stock <= 0 || (!!variant && variant.stock <= 0);
  const wished = isWishlisted(product.id);
  const maxQty = Math.max(1, Math.min(stock, MAX_QTY_PER_LINE));
  const sub = getSubcategory(product.subcategory);

  const requireVariant = () => {
    if (missing.length || !variant) {
      setShowError(true);
      document.getElementById('variant-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const onAdd = () => {
    if (!requireVariant()) return;
    if (addToCart(product, variant, qty)) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    }
  };
  const onBuy = () => {
    if (requireVariant()) buyNow(product, variant, qty);
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success(t.toast.linkCopied);
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <>
      <div className="container-page py-6 sm:py-8">
        <Breadcrumb
          items={[
            { label: sport!.name, to: '/sport/' + product.sport },
            ...(sub ? [{ label: sub.name, to: '/category/' + sub.category + '?subcategory=' + sub.slug }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} activeImage={display?.image} />
          </div>

          <div className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="flex flex-wrap items-center gap-2">
                {productBadges(product).map((b) => (
                  <ProductBadge key={b} kind={b} discount={b === 'sale' ? product.discountPercentage : undefined} />
                ))}
              </div>
              <Link to={'/shop?brand=' + encodeURIComponent(product.brand)} className="mt-3 inline-block text-xs font-bold uppercase tracking-wider text-fg-subtle hover:text-brand-600">
                {product.brand}
              </Link>
              <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-fg sm:text-3xl">{product.name}</h1>
              <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm hover:underline">
                <ProductRating rating={product.rating} count={product.reviewCount} size="md" />
              </a>

              <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2" aria-live="polite">
                <ProductPrice price={price} originalPrice={display?.originalPrice} size="lg" showSave />
              </div>
              <p className="mt-1 text-xs text-fg-subtle">{t.product.vatNote}</p>
              {product.deal && product.dealEndsAt && <Countdown endsAt={product.dealEndsAt} className="mt-3" />}

              <p className="mt-5 text-sm leading-relaxed text-fg-muted">{product.shortDescription}</p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
                <StockStatus stock={stock} threshold={product.lowStockThreshold} />
                <p className="text-xs text-fg-subtle">
                  {t.product.sku}: <span className="font-mono font-semibold text-fg-muted">{variant?.sku ?? product.sku}</span>
                </p>
              </div>

              {product.variantAxes.length > 0 && (
                <div id="variant-selector" className="mt-5 scroll-mt-40">
                  <VariantSelector product={product} selection={selection} onSelect={select} isAvailable={isAvailable} showError={showError} />
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <QuantityStepper value={Math.min(qty, maxQty)} max={maxQty} onChange={setQty} />
                  <motion.div className="min-w-0 flex-1" whileTap={{ scale: 0.98 }}>
                    <Button size="lg" fullWidth onClick={onAdd} disabled={soldOut} className={cn(added && 'bg-success-600 hover:bg-success-600')}>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={added ? 'a' : 'b'} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                          {added ? <Check className="h-5 w-5" /> : null}
                          {soldOut ? t.product.outOfStock : added ? t.product.added : t.product.addToCart}
                        </motion.span>
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                  <Button variant="outline" size="icon" className="h-13 w-13 rounded-2xl" onClick={() => toggleWishlist(product)} aria-pressed={wished} aria-label={wished ? t.product.removeFromWishlist : t.product.addToWishlist}>
                    <motion.span key={String(wished)} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
                      <Heart className={cn('h-5 w-5', wished && 'fill-brand-600 text-brand-600')} />
                    </motion.span>
                  </Button>
                </div>
                <Button size="lg" variant="secondary" fullWidth onClick={onBuy} disabled={soldOut} leftIcon={<Zap className="h-4.5 w-4.5" />}>
                  {t.product.buyNow}
                </Button>
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-success-600" aria-hidden="true" /> {t.delivery.secure} · {t.delivery.authentic}
                  </span>
                  <button type="button" onClick={share} className="flex items-center gap-1.5 font-semibold hover:text-fg">
                    <Share2 className="h-4 w-4" aria-hidden="true" /> Share
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <ProductDeliveryInfo product={product} price={price} />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-14" aria-label="Product information">
          <Tabs
            items={[
              {
                key: 'description',
                label: t.product.description,
                content: (
                  <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-4 text-sm leading-relaxed text-fg-muted sm:text-base">
                      {product.description.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-surface-muted p-5">
                      <h3 className="text-sm font-bold text-fg">{t.product.highlights}</h3>
                      <ul className="mt-3 space-y-2.5">
                        {product.highlights.map((h) => (
                          <li key={h} className="flex gap-2.5 text-sm text-fg-muted">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" /> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ),
              },
              {
                key: 'specs',
                label: t.product.specifications,
                content: (
                  <div className="max-w-3xl">
                    <ProductSpecifications product={product} extra={[{ label: 'SKU', value: variant?.sku ?? product.sku }, { label: 'Gender', value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1) }]} />
                  </div>
                ),
              },
              {
                key: 'delivery',
                label: t.product.deliveryReturns,
                content: (
                  <div className="grid max-w-4xl gap-6 md:grid-cols-2">
                    <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
                      <h3 className="text-base font-bold text-fg">Delivery across the UAE</h3>
                      <p>Dubai: same-day delivery for orders placed before 2pm, otherwise next day. Abu Dhabi and Sharjah: 1–2 business days. Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain: 2–3 business days.</p>
                      <p>Free standard delivery on orders above AED 200. Express and same-day options are shown at checkout. {product.deliveryEstimate}.</p>
                    </div>
                    <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
                      <h3 className="text-base font-bold text-fg">Easy returns</h3>
                      <p>{t.product.returnsInfo}</p>
                      <DeliveryPerks perks={['cod', 'secure', 'authentic']} layout="list" />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </section>

        <div className="mt-14">
          <FrequentlyBoughtTogether product={product} />
        </div>

        <section id="reviews" className="mt-16 scroll-mt-28" aria-labelledby="reviews-title">
          <h2 id="reviews-title" className="mb-6 text-2xl font-extrabold text-fg">
            {t.reviews.title}
          </h2>
          <ProductReviews product={product} />
        </section>

        <ProductRecommendations kind="related" product={product} excludeId={product.id} />
        <ProductRecommendations kind="recently-viewed" excludeId={product.id} />
        <ProductRecommendations kind="recommended" excludeId={product.id} />
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-fg-muted">{product.name}</p>
            <p className="font-display text-lg font-extrabold text-fg">{formatPrice(price)}</p>
          </div>
          <Button onClick={onAdd} disabled={soldOut} className="shrink-0">
            {soldOut ? t.product.outOfStock : t.product.addToCart}
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </>
  );
}

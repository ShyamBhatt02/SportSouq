import { AnimatePresence, motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { useUI } from '@/context/UIContext';
import { useProductsByIds } from '@/hooks/queries';
import { useCartActions, defaultVariant } from '@/hooks/useCartActions';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { PageHeader } from '@/components/common/Section';
import { Breadcrumb } from '@/components/ui/Navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductRecommendations } from '@/components/product/ProductRecommendations';

function WishlistContent() {
  const { t } = useI18n();
  const wishlist = useWishlist();
  const toast = useToast();
  const ui = useUI();
  const { addToCart } = useCartActions();
  const { data, isLoading } = useProductsByIds(wishlist.ids);
  const products = (data ?? []).filter((p) => wishlist.has(p.id));

  const moveToCart = (p: Product) => {
    if (p.variantAxes.length) {
      ui.openQuickView(p);
      return;
    }
    if (addToCart(p, defaultVariant(p), 1, { silent: true })) {
      wishlist.remove(p.id);
      toast.success(t.toast.movedToCart, { description: p.name });
    }
  };

  const moveAll = () => {
    let moved = 0;
    for (const p of products) {
      if (p.variantAxes.length || p.stock <= 0) continue;
      if (addToCart(p, defaultVariant(p), 1, { silent: true })) {
        wishlist.remove(p.id);
        moved++;
      }
    }
    if (moved) toast.success(t.toast.movedToCart, { description: t.common.items(moved), action: { label: t.cart.viewCart, onClick: ui.openCart } });
    else toast.info('Choose a size or colour for these items first', { description: 'Use “Move to bag” on each item.' });
  };

  if (!wishlist.count) {
    return (
      <>
        <EmptyState icon={Heart} title={t.wishlist.empty} description={t.wishlist.emptyHint} action={<ButtonLink to="/shop">{t.common.shopNow}</ButtonLink>} />
        <ProductRecommendations kind="best-sellers" />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-fg-muted" aria-live="polite">
          {t.wishlist.count(wishlist.count)}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={wishlist.clear} leftIcon={<Trash2 className="h-4 w-4" />}>
            {t.common.clearAll}
          </Button>
          <Button size="sm" onClick={moveAll} leftIcon={<ShoppingBag className="h-4 w-4" />}>
            {t.wishlist.moveAll}
          </Button>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
        {isLoading && !data
          ? wishlist.ids.slice(0, 8).map((id) => (
              <li key={id}>
                <ProductCardSkeleton />
              </li>
            ))
          : null}
        <AnimatePresence>
          {products.map((p) => (
            <motion.li key={p.id} layout exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col gap-2">
              <ProductCard product={p} />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Button size="sm" variant="secondary" onClick={() => moveToCart(p)} disabled={p.stock <= 0}>
                  {p.stock <= 0 ? t.product.outOfStock : t.wishlist.moveToCart}
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    wishlist.remove(p.id);
                    toast.info(t.toast.removedFromWishlist, { description: p.name, action: { label: 'Undo', onClick: () => wishlist.add(p.id) } });
                  }}
                  aria-label={t.common.remove + ': ' + p.name}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}

export function WishlistPage() {
  const { t } = useI18n();
  useSeo({ title: t.wishlist.title, noindex: true });
  return (
    <>
      <PageHeader title={t.wishlist.title}>
        <Breadcrumb items={[{ label: t.wishlist.title }]} />
      </PageHeader>
      <div className="container-page py-8 pb-16">
        <WishlistContent />
      </div>
    </>
  );
}

/** Wishlist inside the account area (same data, account chrome). */
export function AccountWishlistPage() {
  const { t } = useI18n();
  useSeo({ title: t.wishlist.title, noindex: true });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-fg">{t.wishlist.title}</h1>
      <WishlistContent />
    </div>
  );
}

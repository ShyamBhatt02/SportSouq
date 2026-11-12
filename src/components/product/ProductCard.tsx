import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { SafeImage } from '@/components/ui/SafeImage';
import { Countdown } from '@/components/common/Countdown';
import { useCartActions, defaultVariant } from '@/hooks/useCartActions';
import { useUI } from '@/context/UIContext';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/utils/cn';
import { ProductBadge, ProductPrice, ProductRating, productBadges } from './ProductMeta';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  showCountdown?: boolean;
  className?: string;
}

export const ProductCard = memo(function ProductCard({ product, priority, showCountdown, className }: ProductCardProps) {
  const { t } = useI18n();
  const { addToCart, toggleWishlist, isWishlisted } = useCartActions();
  const { openQuickView } = useUI();
  const [justAdded, setJustAdded] = useState(false);
  const wished = isWishlisted(product.id);
  const soldOut = product.stock <= 0;
  const needsChoice = product.variantAxes.length > 0;
  const href = '/product/' + product.slug;

  const onAdd = () => {
    // Products with size/colour options open Quick View so the shopper picks a variant.
    if (needsChoice) {
      openQuickView(product);
      return;
    }
    if (addToCart(product, defaultVariant(product))) {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1600);
    }
  };

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('group relative flex flex-col', className)}
      aria-labelledby={'pc-' + product.id}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-surface-muted">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
          <SafeImage
            src={product.images[0]}
            alt=""
            width={500}
            ratio={1.2}
            widths={[320, 480, 640]}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            priority={priority}
            wrapperClassName="aspect-[5/6]"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {product.images[1] && (
            <SafeImage
              src={product.images[1]}
              alt=""
              width={500}
              ratio={1.2}
              widths={[320, 480, 640]}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
              wrapperClassName="absolute! inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-coarse:hidden"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute start-3 top-3 flex flex-col items-start gap-1.5">
          {productBadges(product).map((b) => (
            <ProductBadge key={b} kind={b} discount={b === 'sale' ? product.discountPercentage : undefined} />
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleWishlist(product)}
          aria-pressed={wished}
          aria-label={(wished ? t.product.removeFromWishlist : t.product.addToWishlist) + ': ' + product.name}
          className="absolute end-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-soft backdrop-blur transition hover:bg-white dark:bg-ink-900/80 dark:text-white"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={wished ? 'on' : 'off'} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: [1.3, 1], opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.25 }}>
              <Heart className={cn('h-4.5 w-4.5', wished && 'fill-brand-600 text-brand-600')} />
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {showCountdown && product.dealEndsAt && (
          <div className="pointer-events-none absolute bottom-3 start-3">
            <Countdown endsAt={product.dealEndsAt} variant="pill" />
          </div>
        )}

        {/* Desktop hover actions */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-2 gap-2 opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
          <button
            type="button"
            onClick={() => openQuickView(product)}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/95 text-xs font-bold text-ink-950 shadow-soft backdrop-blur transition hover:bg-white"
            aria-label={t.product.quickView + ': ' + product.name}
          >
            <Eye className="h-4 w-4" aria-hidden="true" /> {t.product.quickView}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-3">
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-fg-subtle">{product.brand}</p>
        <h3 id={'pc-' + product.id} className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-fg">
          <Link to={href} className="after:absolute after:inset-0 after:z-0 hover:text-brand-600 focus:outline-none dark:hover:text-brand-400">
            {product.name}
          </Link>
        </h3>
        <ProductRating rating={product.rating} count={product.reviewCount} size="xs" />
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <ProductPrice price={product.price} originalPrice={product.originalPrice} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            disabled={soldOut}
            className={cn(
              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              justAdded ? 'bg-success-600 text-white' : 'bg-ink-950 text-white hover:bg-brand-600 dark:bg-white dark:text-ink-950 dark:hover:bg-brand-500 dark:hover:text-white',
            )}
            aria-label={(soldOut ? t.product.outOfStock : t.product.addToCart) + ': ' + product.name}
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span key="ok" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                  <Check className="h-4.5 w-4.5" strokeWidth={3} />
                </motion.span>
              ) : (
                <motion.span key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <ShoppingBag className="h-4.5 w-4.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});

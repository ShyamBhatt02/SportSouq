import { Star } from 'lucide-react';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n/I18nProvider';
import { formatPrice, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

/* ---------------- ProductPrice ---------------- */

export function ProductPrice({ price, originalPrice, size = 'md', className, showSave }: { price: number; originalPrice?: number; size?: 'sm' | 'md' | 'lg'; className?: string; showSave?: boolean }) {
  const { t } = useI18n();
  const discounted = originalPrice !== undefined && originalPrice > price;
  const pct = discounted ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-display font-extrabold tabular-nums', discounted ? 'text-brand-600 dark:text-brand-400' : 'text-fg', size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-base' : 'text-sm')}>
        <span className="sr-only">{discounted ? 'Sale price ' : 'Price '}</span>
        {formatPrice(price)}
      </span>
      {discounted && (
        <>
          <span className={cn('text-fg-subtle line-through tabular-nums', size === 'lg' ? 'text-lg' : 'text-xs')}>
            <span className="sr-only">Original price </span>
            {formatPrice(originalPrice)}
          </span>
          {size !== 'sm' && <span className={cn('font-bold text-success-600', size === 'lg' ? 'text-sm' : 'text-xs')}>-{pct}%</span>}
          {showSave && <Badge tone="success">{t.product.save(formatPrice(originalPrice - price))}</Badge>}
        </>
      )}
    </div>
  );
}

/* ---------------- ProductRating ---------------- */

export function Stars({ value, size = 'sm', className }: { value: number; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  const px = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }[size];
  return (
    <span className={cn('relative inline-flex', className)} aria-hidden="true">
      <span className="flex gap-0.5 text-ink-200 dark:text-ink-700">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={cn(px, 'fill-current')} strokeWidth={0} />
        ))}
      </span>
      <span className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400" style={{ width: (Math.max(0, Math.min(5, value)) / 5) * 100 + '%' }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={cn(px, 'shrink-0 fill-current')} strokeWidth={0} />
        ))}
      </span>
    </span>
  );
}

export function ProductRating({ rating, count, size = 'sm', className, showValue = true }: { rating: number; count?: number; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string; showValue?: boolean }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Stars value={rating} size={size} />
      <span className="sr-only">Rated {rating.toFixed(1)} out of 5{count !== undefined ? ' from ' + count + ' reviews' : ''}</span>
      {showValue && (
        <span className={cn('font-semibold text-fg', size === 'lg' ? 'text-base' : 'text-xs')} aria-hidden="true">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={cn('text-fg-subtle', size === 'lg' ? 'text-sm' : 'text-xs')} aria-hidden="true">
          ({formatNumber(count)})
        </span>
      )}
    </div>
  );
}

/* ---------------- ProductBadge ---------------- */

export type ProductBadgeKind = 'new' | 'sale' | 'bestseller' | 'limited' | 'soldout';

export function productBadges(p: Product): ProductBadgeKind[] {
  const list: ProductBadgeKind[] = [];
  if (p.stock <= 0) return ['soldout'];
  if (p.discountPercentage > 0) list.push('sale');
  if (p.newArrival) list.push('new');
  if (p.bestseller) list.push('bestseller');
  if (p.stock <= p.lowStockThreshold) list.push('limited');
  return list.slice(0, 2);
}

export function ProductBadge({ kind, discount }: { kind: ProductBadgeKind; discount?: number }) {
  const { t } = useI18n();
  switch (kind) {
    case 'sale':
      return <Badge tone="brand">{discount ? '-' + discount + '%' : t.product.badgeSale}</Badge>;
    case 'new':
      return <Badge tone="volt">{t.product.badgeNew}</Badge>;
    case 'bestseller':
      return <Badge tone="dark">{t.product.badgeBestSeller}</Badge>;
    case 'limited':
      return <Badge tone="warning">{t.product.badgeLimited}</Badge>;
    case 'soldout':
      return <Badge tone="neutral">{t.product.badgeSoldOut}</Badge>;
  }
}

/* ---------------- Stock status ---------------- */

export function StockStatus({ stock, threshold, className }: { stock: number; threshold: number; className?: string }) {
  const { t } = useI18n();
  const tone = stock <= 0 ? 'text-danger-600' : stock <= threshold ? 'text-warning-600 dark:text-warning-500' : 'text-success-600';
  const dot = stock <= 0 ? 'bg-danger-500' : stock <= threshold ? 'bg-warning-500' : 'bg-success-500';
  return (
    <p className={cn('flex items-center gap-2 text-sm font-semibold', tone, className)}>
      <span className="relative flex h-2 w-2">
        {stock > 0 && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', dot)} />}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', dot)} />
      </span>
      {stock <= 0 ? t.product.outOfStock : stock <= threshold ? t.product.lowStock(stock) : t.product.inStock}
    </p>
  );
}

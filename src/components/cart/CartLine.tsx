import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Trash2 } from 'lucide-react';
import type { CartItem } from '@/types';
import { SafeImage } from '@/components/ui/SafeImage';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useI18n } from '@/i18n/I18nProvider';
import { MAX_QTY_PER_LINE } from '@/config/site';
import { formatPrice, titleCase } from '@/utils/format';
import { cn } from '@/utils/cn';

export function variantLabel(attrs: CartItem['attributes']): string {
  return [attrs.color, attrs.size && 'Size ' + attrs.size, attrs.gender && titleCase(attrs.gender), attrs.config].filter(Boolean).join(' · ');
}

interface CartLineProps {
  item: CartItem;
  onQuantity?: (qty: number) => void;
  onRemove?: () => void;
  onSaveForLater?: () => void;
  onMoveToCart?: () => void;
  compact?: boolean;
  onNavigate?: () => void;
}

export function CartLine({ item, onQuantity, onRemove, onSaveForLater, onMoveToCart, compact, onNavigate }: CartLineProps) {
  const { t } = useI18n();
  const variant = variantLabel(item.attributes);
  const href = '/product/' + item.slug;
  const lineTotal = item.price * item.quantity;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      className={cn('flex gap-3 sm:gap-4', compact ? 'py-4' : 'py-5')}
    >
      <Link to={href} onClick={onNavigate} className="shrink-0" tabIndex={-1} aria-hidden="true">
        <SafeImage src={item.image} alt="" width={200} ratio={1.15} wrapperClassName={cn('rounded-2xl', compact ? 'h-24 w-20' : 'h-32 w-28 sm:h-36 sm:w-32')} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-fg-subtle">{item.brand}</p>
            <Link to={href} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold text-fg hover:text-brand-600">
              {item.name}
            </Link>
            {variant && <p className="mt-0.5 text-xs text-fg-muted">{variant}</p>}
            {!compact && <p className="mt-0.5 text-[11px] text-fg-subtle">SKU {item.sku}</p>}
          </div>
          <div className="shrink-0 text-end">
            <p className="text-sm font-bold tabular-nums text-fg">{formatPrice(lineTotal)}</p>
            {item.quantity > 1 && <p className="text-[11px] text-fg-subtle">{formatPrice(item.price)} each</p>}
            {item.originalPrice > item.price && <p className="text-[11px] text-fg-subtle line-through">{formatPrice(item.originalPrice * item.quantity)}</p>}
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          {onQuantity ? (
            <div className="flex items-center gap-2">
              <QuantityStepper size="sm" value={item.quantity} max={Math.min(item.maxStock, MAX_QTY_PER_LINE)} onChange={onQuantity} label={'Quantity for ' + item.name} />
              {item.quantity >= item.maxStock && <span className="text-[11px] font-medium text-warning-600">{t.cart.maxStock(item.maxStock)}</span>}
            </div>
          ) : (
            <span className="text-xs text-fg-muted">Qty {item.quantity}</span>
          )}
          <div className="flex items-center gap-1">
            {onSaveForLater && (
              <button type="button" onClick={onSaveForLater} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-fg-muted transition hover:bg-surface-muted hover:text-fg" aria-label={t.cart.saveForLater + ': ' + item.name}>
                <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{t.cart.saveForLater}</span>
              </button>
            )}
            {onMoveToCart && (
              <button type="button" onClick={onMoveToCart} className="rounded-lg px-2 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10">
                {t.cart.moveToCart}
              </button>
            )}
            {onRemove && (
              <button type="button" onClick={onRemove} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-fg-muted transition hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10" aria-label={t.cart.remove + ': ' + item.name}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{t.cart.remove}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

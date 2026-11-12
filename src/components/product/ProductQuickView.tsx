import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { Modal } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useUI } from '@/context/UIContext';
import { useCartActions } from '@/hooks/useCartActions';
import { useI18n } from '@/i18n/I18nProvider';
import { MAX_QTY_PER_LINE } from '@/config/site';
import { cn } from '@/utils/cn';
import { ProductGallery } from './ProductGallery';
import { ProductPrice, ProductRating, StockStatus } from './ProductMeta';
import { VariantSelector, useVariantSelection } from './VariantSelector';

export function ProductQuickView() {
  const { quickView: product, closeQuickView } = useUI();
  const { t } = useI18n();
  const { addToCart, toggleWishlist, isWishlisted } = useCartActions();
  const { selection, variant, preview, select, isAvailable, missing } = useVariantSelection(product ?? undefined);
  const [qty, setQty] = useState(1);
  const [showError, setShowError] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>();
  if (product?.id !== lastId) {
    setLastId(product?.id);
    setQty(1);
    setShowError(false);
  }

  if (!product) return <Modal open={false} onClose={closeQuickView}>{null}</Modal>;

  const stock = variant?.stock ?? product.stock;
  const onAdd = () => {
    if (missing.length || !variant) {
      setShowError(true);
      return;
    }
    if (addToCart(product, variant, qty)) closeQuickView();
  };
  const wished = isWishlisted(product.id);

  return (
    <Modal open={!!product} onClose={closeQuickView} size="xl" hideTitle title={product.name}>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <ProductGallery images={product.images} name={product.name} activeImage={preview?.image} />
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{product.brand}</p>
            <h2 className="mt-1 text-xl font-extrabold leading-tight text-fg sm:text-2xl">{product.name}</h2>
            <ProductRating rating={product.rating} count={product.reviewCount} className="mt-2" />
          </div>
          <ProductPrice price={preview?.price ?? product.price} originalPrice={preview?.originalPrice ?? product.originalPrice} size="lg" />
          <p className="text-sm leading-relaxed text-fg-muted">{product.shortDescription}</p>
          <StockStatus stock={stock} threshold={product.lowStockThreshold} />
          {product.variantAxes.length > 0 && (
            <VariantSelector product={product} selection={selection} onSelect={select} isAvailable={isAvailable} showError={showError} compact />
          )}
          {variant && <p className="text-xs text-fg-subtle">{t.product.sku}: {variant.sku}</p>}
          <div className="mt-1 flex items-center gap-3">
            <QuantityStepper value={qty} max={Math.max(1, Math.min(stock, MAX_QTY_PER_LINE))} onChange={setQty} />
            <Button className="flex-1" size="md" onClick={onAdd} disabled={product.stock <= 0 || (variant && variant.stock <= 0)}>
              {product.stock <= 0 ? t.product.outOfStock : t.product.addToCart}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleWishlist(product)}
              aria-pressed={wished}
              aria-label={wished ? t.product.removeFromWishlist : t.product.addToWishlist}
            >
              <Heart className={cn('h-5 w-5', wished && 'fill-brand-600 text-brand-600')} />
            </Button>
          </div>
          <Link to={'/product/' + product.slug} onClick={closeQuickView} className="group mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-fg hover:text-brand-600">
            {t.product.viewDetails}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}

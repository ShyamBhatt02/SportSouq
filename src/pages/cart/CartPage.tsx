import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useCartActions } from '@/hooks/useCartActions';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { formatPrice } from '@/utils/format';
import { PageHeader } from '@/components/common/Section';
import { Breadcrumb } from '@/components/ui/Navigation';
import { ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, InlineAlert } from '@/components/ui/States';
import { DeliveryPerks, FreeDeliveryProgress } from '@/components/common/DeliveryPerks';
import { PaymentBadges } from '@/components/common/BrandIcons';
import { CartLine } from '@/components/cart/CartLine';
import { CouponForm, SummaryRows } from '@/components/cart/OrderSummary';
import { ProductRecommendations } from '@/components/product/ProductRecommendations';

export function CartPage() {
  const { t } = useI18n();
  const cart = useCart();
  const toast = useToast();
  const { removeFromCart } = useCartActions();
  const [confirmClear, setConfirmClear] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  useSeo({ title: t.cart.title, noindex: true });

  // Re-validate prices & stock whenever the bag page opens.
  const { reconcile } = cart;
  useEffect(() => {
    reconcile()
      .then(setNotices)
      .catch(() => undefined);
  }, [reconcile]);

  const savings = cart.items.reduce((s, i) => s + Math.max(0, i.originalPrice - i.price) * i.quantity, 0) + cart.totals.discount;

  return (
    <>
      <PageHeader title={t.cart.title} description={cart.count ? t.common.items(cart.count) : undefined}>
        <Breadcrumb items={[{ label: t.cart.title }]} />
      </PageHeader>
      <div className="container-page py-8 pb-16">
        {notices.length > 0 && (
          <InlineAlert tone="warning" className="mb-6">
            <p className="font-semibold">{t.cart.stockChanged}</p>
            <ul className="mt-1 list-disc ps-4">
              {notices.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </InlineAlert>
        )}

        {cart.items.length === 0 ? (
          <EmptyState icon={ShoppingBag} title={t.cart.empty} description={t.cart.emptyHint} action={<><ButtonLink to="/shop">{t.common.shopNow}</ButtonLink><ButtonLink to="/deals" variant="outline">{t.nav.deals}</ButtonLink></>} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <FreeDeliveryProgress subtotal={cart.subtotal} />
              <div className="mt-2 flex items-center justify-between border-b border-line py-3">
                <h2 className="text-sm font-bold text-fg">{t.common.items(cart.count)}</h2>
                <button type="button" onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-danger-600">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t.cart.clear}
                </button>
              </div>
              <ul className="divide-y divide-line">
                <AnimatePresence initial={false}>
                  {cart.items.map((item) => (
                    <CartLine
                      key={item.key}
                      item={item}
                      onQuantity={(q) => cart.setQuantity(item.key, q)}
                      onRemove={() => removeFromCart(item.key)}
                      onSaveForLater={() => {
                        cart.saveForLater(item.key);
                        toast.info(t.toast.savedForLater, { description: item.name });
                      }}
                    />
                  ))}
                </AnimatePresence>
              </ul>

              {cart.saved.length > 0 && (
                <section className="mt-10" aria-labelledby="saved-heading">
                  <h2 id="saved-heading" className="border-b border-line pb-3 text-lg font-bold text-fg">
                    {t.cart.savedForLater} ({cart.saved.length})
                  </h2>
                  <ul className="divide-y divide-line">
                    <AnimatePresence initial={false}>
                      {cart.saved.map((item) => (
                        <CartLine
                          key={item.key}
                          item={item}
                          onMoveToCart={() => {
                            cart.moveToCart(item.key);
                            toast.success(t.toast.movedToCart, { description: item.name });
                          }}
                          onRemove={() => cart.removeSaved(item.key)}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              )}
            </div>

            <aside className="lg:col-span-4" aria-label={t.cart.orderSummary}>
              <div className="space-y-5 rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6 lg:sticky lg:top-28">
                <h2 className="text-lg font-bold text-fg">{t.cart.orderSummary}</h2>
                <CouponForm />
                <SummaryRows totals={cart.totals} couponCode={cart.coupon?.status === 'valid' ? cart.couponCode : null} deliveryLabel={<span>{t.cart.delivery} <span className="text-xs text-fg-subtle">(standard)</span></span>} />
                {savings > 0 && <p className="rounded-xl bg-success-50 px-3 py-2 text-center text-xs font-bold text-success-600 dark:bg-success-600/10">{t.cart.youSave(formatPrice(savings))}</p>}
                <ButtonLink to="/checkout" size="lg" fullWidth leftIcon={<Lock className="h-4 w-4" />} rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}>
                  {t.cart.secureCheckout}
                </ButtonLink>
                <ButtonLink to="/shop" variant="ghost" fullWidth>
                  {t.cart.continueShopping}
                </ButtonLink>
                <PaymentBadges className="justify-center" />
                <DeliveryPerks perks={['sameDay', 'cod', 'returns']} layout="list" className="border-t border-line pt-4" />
              </div>
            </aside>
          </div>
        )}

        <ProductRecommendations kind={cart.items.length ? 'recommended' : 'best-sellers'} />
      </div>

      <ConfirmDialog
        open={confirmClear}
        title={t.cart.clear}
        message={t.cart.clearConfirm}
        confirmLabel={t.cart.clear}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          cart.clear();
          setConfirmClear(false);
          toast.info(t.toast.cartCleared);
        }}
      />
    </>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { CheckoutProvider, useCheckout } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { orderService } from '@/services/orderService';
import { getErrorMessage } from '@/services/api/client';
import { Logo } from '@/components/common/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { SafeImage } from '@/components/ui/SafeImage';
import { CouponForm, SummaryRows } from '@/components/cart/OrderSummary';
import { AddressStep, CheckoutStepper, ContactStep, DeliveryStep, PaymentStep, ReviewStep } from '@/components/checkout/CheckoutSteps';
import { variantLabel } from '@/components/cart/CartLine';
import { PaymentBadges } from '@/components/common/BrandIcons';
import { formatPrice } from '@/utils/format';

function CheckoutSummary() {
  const { t } = useI18n();
  const cart = useCart();
  const checkout = useCheckout();
  return (
    <aside aria-label={t.cart.orderSummary} className="h-fit rounded-3xl border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-6">
      <h2 className="text-lg font-bold text-fg">{t.cart.orderSummary}</h2>
      <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pe-1">
        {cart.items.map((i) => (
          <li key={i.key} className="flex items-center gap-3">
            <span className="relative shrink-0">
              <SafeImage src={i.image} alt="" width={120} ratio={1} wrapperClassName="h-14 w-14 rounded-xl" />
              <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-950 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-ink-950">{i.quantity}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-fg">{i.name}</span>
              <span className="block truncate text-xs text-fg-muted">{variantLabel(i.attributes)}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="my-5 border-t border-line pt-5">
        <CouponForm />
      </div>
      <SummaryRows
        totals={checkout.totals}
        couponCode={cart.coupon?.status === 'valid' ? cart.couponCode : null}
        deliveryLabel={checkout.selectedQuote ? checkout.selectedQuote.method.name : t.cart.delivery + ' (est.)'}
      />
      <p className="mt-4 flex items-center gap-2 text-xs text-fg-subtle">
        <ShieldCheck className="h-4 w-4 text-success-600" aria-hidden="true" /> 256-bit SSL · {t.checkout.secureNote}
      </p>
      <PaymentBadges className="mt-4" />
    </aside>
  );
}

function CheckoutFlow() {
  const { t } = useI18n();
  const cart = useCart();
  const checkout = useCheckout();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const place = async () => {
    if (!checkout.customer || !checkout.address || !checkout.deliveryMethod || !checkout.paymentMethod) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await orderService.create({
        customer: checkout.customer,
        items: cart.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        address: checkout.address,
        deliveryMethod: checkout.deliveryMethod,
        payment: {
          method: checkout.paymentMethod,
          label: checkout.paymentMethod,
          cardBrand: checkout.card?.brand,
          cardLast4: checkout.card?.last4,
        },
        couponCode: cart.coupon?.status === 'valid' ? cart.couponCode ?? undefined : undefined,
        saveAddress: checkout.saveAddress && !checkout.addressId,
      });
      // Order succeeded: clear sensitive/transient state before navigating.
      cart.clear();
      checkout.reset();
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success(t.toast.orderPlaced, { description: order.number });
      navigate('/order-confirmation?id=' + encodeURIComponent(order.id) + '&email=' + encodeURIComponent(order.customer.email), { replace: true });
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(t.checkout.failed, { description: message });
      void cart.reconcile();
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.items.length) {
    return (
      <div className="container-page">
        <EmptyState icon={ShoppingBag} title={t.cart.empty} description={t.checkout.emptyCart} action={<ButtonLink to="/shop">{t.common.shopNow}</ButtonLink>} />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="mb-6">
          <CheckoutStepper />
        </div>
        <AnimatePresence mode="wait">
          <div key={checkout.step}>
            {checkout.step === 'contact' && <ContactStep />}
            {checkout.step === 'address' && <AddressStep />}
            {checkout.step === 'delivery' && <DeliveryStep />}
            {checkout.step === 'payment' && <PaymentStep />}
            {checkout.step === 'review' && <ReviewStep onPlace={place} placing={placing} error={error} />}
          </div>
        </AnimatePresence>
      </div>
      <div className="lg:col-span-5 xl:col-span-4">
        <CheckoutSummary />
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { t } = useI18n();
  useSeo({ title: t.checkout.title, noindex: true });
  return (
    <CheckoutProvider>
      <div className="border-b border-line bg-surface-muted/60">
        <div className="container-page flex items-center justify-between py-4">
          <h1 className="flex items-center gap-2 text-lg font-extrabold text-fg">
            <Lock className="h-4.5 w-4.5 text-success-600" aria-hidden="true" /> {t.cart.secureCheckout}
          </h1>
          <div className="hidden sm:block">
            <Logo compact animate={false} />
          </div>
        </div>
      </div>
      <CheckoutFlow />
    </CheckoutProvider>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, FileSearch, MapPin, MessageCircle, RotateCcw, Truck, XCircle } from 'lucide-react';
import { useCancelOrder, useOrder } from '@/hooks/queries';
import { useSeo } from '@/hooks/useSeo';
import { useCartActions } from '@/hooks/useCartActions';
import { useToast } from '@/context/ToastContext';
import { useUI } from '@/context/UIContext';
import { useI18n } from '@/i18n/I18nProvider';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api/client';
import { canCancel } from '@/utils/orderStatus';
import { formatDateTime, formatDay, formatPrice } from '@/utils/format';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { SummaryRows } from '@/components/cart/OrderSummary';
import { variantLabel } from '@/components/cart/CartLine';
import { AddressSummary } from '@/components/account/AddressForm';
import { OrderStatusBadge, OrderTimeline, PaymentStatusBadge } from '@/components/account/OrderComponents';

export function OrderDetailsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const toast = useToast();
  const ui = useUI();
  const { data: order, isLoading, isError } = useOrder(id);
  const cancel = useCancelOrder();
  const { addToCart } = useCartActions();
  const [confirm, setConfirm] = useState(false);
  const [reordering, setReordering] = useState(false);
  useSeo({ title: order ? 'Order ' + order.number : 'Order details', noindex: true });

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }
  if (isError || !order) {
    return <EmptyState icon={FileSearch} title={t.order.notFound} description={t.order.notFoundHint} action={<ButtonLink to="/account/orders">{t.order.viewOrders}</ButtonLink>} />;
  }

  const est = order.delivery.estimatedFrom === order.delivery.estimatedTo ? formatDay(order.delivery.estimatedTo) : formatDay(order.delivery.estimatedFrom) + ' – ' + formatDay(order.delivery.estimatedTo);
  const pay = order.payment.method === 'card' ? (order.payment.cardBrand ?? 'Card') + ' •••• ' + order.payment.cardLast4 : order.payment.label;

  const reorder = async () => {
    setReordering(true);
    try {
      const products = await productService.getByIds(order.items.map((i) => i.productId));
      let added = 0;
      for (const item of order.items) {
        const p = products.find((x) => x.id === item.productId);
        const v = p?.variants.find((x) => x.id === item.variantId && x.stock > 0) ?? p?.variants.find((x) => x.stock > 0);
        if (p && v && addToCart(p, v, item.quantity, { silent: true })) added++;
      }
      if (added) toast.success(t.toast.addedToCart, { description: t.common.items(added), action: { label: t.cart.viewCart, onClick: ui.openCart } });
      else toast.error('These items are currently out of stock');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t.account.orders}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">Order {order.number}</h1>
          <p className="mt-1 text-sm text-fg-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <section aria-labelledby="track-h" className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 id="track-h" className="text-lg font-bold text-fg">
            {t.order.tracking}
          </h2>
          {order.status !== 'cancelled' && (
            <p className="text-sm text-fg-muted">
              {order.status === 'delivered' ? 'Delivered' : t.order.estimated + ': '}
              {order.status !== 'delivered' && <span className="font-bold text-fg">{est}</span>}
              {order.trackingNumber && <span className="ms-2 font-mono text-xs text-fg-subtle">· {order.trackingNumber}</span>}
            </p>
          )}
        </div>
        <OrderTimeline order={order} />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section aria-labelledby="items-h" className="rounded-3xl border border-line bg-surface p-5 sm:p-6 lg:col-span-3">
          <h2 id="items-h" className="text-lg font-bold text-fg">
            {t.order.items}
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.variantId} className="flex items-center gap-4 py-3">
                <SafeImage src={i.image} alt="" width={140} ratio={1} wrapperClassName="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <Link to={'/product/' + i.slug} className="line-clamp-1 text-sm font-semibold text-fg hover:text-brand-600">
                    {i.name}
                  </Link>
                  <p className="text-xs text-fg-muted">
                    {variantLabel(i.attributes)} {variantLabel(i.attributes) && '·'} {formatPrice(i.price)} × {i.quantity}
                  </p>
                  <p className="text-[11px] text-fg-subtle">SKU {i.sku}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-line pt-4">
            <SummaryRows totals={order.totals} couponCode={order.couponCode} deliveryLabel={order.delivery.name} />
          </div>
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section aria-labelledby="addr-h" className="rounded-3xl border border-line bg-surface p-5">
            <h2 id="addr-h" className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {t.order.address}
            </h2>
            <AddressSummary address={order.address} />
          </section>
          <section aria-labelledby="del-h" className="rounded-3xl border border-line bg-surface p-5">
            <h2 id="del-h" className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">
              <Truck className="h-4 w-4" aria-hidden="true" /> Delivery
            </h2>
            <p className="text-sm font-semibold text-fg">{order.delivery.name}</p>
            <p className="text-sm text-fg-muted">Estimated {est}</p>
          </section>
          <section aria-labelledby="pay-h" className="rounded-3xl border border-line bg-surface p-5">
            <h2 id="pay-h" className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">
              <CreditCard className="h-4 w-4" aria-hidden="true" /> {t.order.payment}
            </h2>
            <p className="text-sm font-semibold text-fg">{pay}</p>
            {order.payment.transactionId && <p className="font-mono text-xs text-fg-subtle">Ref {order.payment.transactionId}</p>}
          </section>
          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={reorder} loading={reordering} leftIcon={<RotateCcw className="h-4 w-4" />}>
              {t.order.reorder}
            </Button>
            {canCancel(order) && (
              <Button variant="outline" className="text-danger-600 hover:border-danger-600" onClick={() => setConfirm(true)} leftIcon={<XCircle className="h-4 w-4" />}>
                {t.order.cancel}
              </Button>
            )}
            <ButtonLink to={'/contact?order=' + order.number} variant="ghost" leftIcon={<MessageCircle className="h-4 w-4" />}>
              {t.order.help}
            </ButtonLink>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title={t.order.cancel}
        message={t.order.cancelConfirm}
        confirmLabel={t.order.cancel}
        cancelLabel="Keep order"
        loading={cancel.isPending}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          try {
            await cancel.mutateAsync(order.id);
            toast.info(t.order.cancelled, { description: order.number });
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setConfirm(false);
          }
        }}
      />
    </div>
  );
}

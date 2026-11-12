import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, CreditCard, FileSearch, MapPin, Package, Printer } from 'lucide-react';
import { useOrder } from '@/hooks/queries';
import { useAuth } from '@/context/AuthContext';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { formatDate, formatDateTime, formatDay } from '@/utils/format';
import { ButtonLink, Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { SummaryRows } from '@/components/cart/OrderSummary';
import { variantLabel } from '@/components/cart/CartLine';
import { AddressSummary } from '@/components/account/AddressForm';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/account/OrderComponents';
import { ProductRecommendations } from '@/components/product/ProductRecommendations';
import { formatPrice } from '@/utils/format';

export function OrderConfirmationPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const id = params.get('id') ?? undefined;
  const email = params.get('email') ?? undefined;
  const { data: order, isLoading, isError } = useOrder(id, email);
  useSeo({ title: t.order.confirmed, noindex: true });

  if (isLoading) {
    return (
      <div className="container-page max-w-4xl py-12" aria-busy="true">
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-8 w-72" />
        <Skeleton className="mt-10 h-64 rounded-3xl" />
      </div>
    );
  }
  if (isError || !order) {
    return (
      <div className="container-page">
        <EmptyState icon={FileSearch} title={t.order.notFound} description={t.order.notFoundHint} action={<ButtonLink to={user ? '/account/orders' : '/'}>{user ? t.order.viewOrders : t.common.home}</ButtonLink>} />
      </div>
    );
  }

  const est = order.delivery.estimatedFrom === order.delivery.estimatedTo ? formatDay(order.delivery.estimatedTo) : formatDay(order.delivery.estimatedFrom) + ' – ' + formatDay(order.delivery.estimatedTo);
  const pay = order.payment.method === 'card' ? (order.payment.cardBrand ?? 'Card') + ' •••• ' + order.payment.cardLast4 : order.payment.label;

  return (
    <div className="container-page max-w-5xl py-10 sm:py-14">
      <div className="text-center">
        <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 15 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-600 text-white shadow-[0_12px_40px_-8px_rgb(22_163_74/0.6)]">
          <CheckCircle2 className="h-11 w-11" aria-hidden="true" />
        </motion.span>
        <h1 className="mt-6 font-display text-3xl font-black text-fg sm:text-4xl">{t.order.confirmed}</h1>
        <p className="mt-2 text-fg-muted">{t.order.thanks(order.customer.firstName)}</p>
        <p className="mt-1 text-sm text-fg-subtle">{t.order.emailSent(order.customer.email)}</p>
      </div>

      <div className="mt-10 grid gap-3 rounded-3xl bg-ink-950 p-5 text-white sm:grid-cols-4 sm:p-6">
        {[
          { icon: Package, label: t.order.number, value: order.number },
          { icon: CalendarClock, label: t.order.date, value: formatDate(order.createdAt) },
          { icon: CalendarClock, label: t.order.estimated, value: est },
          { icon: CreditCard, label: t.order.total, value: formatPrice(order.totals.total, { decimals: true }) },
        ].map((x) => (
          <div key={x.label}>
            <p className="flex items-center gap-1.5 text-xs text-ink-400">
              <x.icon className="h-3.5 w-3.5" aria-hidden="true" /> {x.label}
            </p>
            <p className="mt-1 font-display text-lg font-extrabold">{x.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6 lg:col-span-3" aria-labelledby="items-h">
          <div className="flex items-center justify-between">
            <h2 id="items-h" className="text-lg font-bold text-fg">
              {t.order.items}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.variantId} className="flex items-center gap-4 py-3">
                <SafeImage src={i.image} alt="" width={140} ratio={1} wrapperClassName="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <Link to={'/product/' + i.slug} className="line-clamp-1 text-sm font-semibold text-fg hover:text-brand-600">
                    {i.name}
                  </Link>
                  <p className="text-xs text-fg-muted">
                    {variantLabel(i.attributes)} {variantLabel(i.attributes) && '·'} Qty {i.quantity}
                  </p>
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
          <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="addr-h">
            <h2 id="addr-h" className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-fg-subtle">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {t.order.address}
            </h2>
            <AddressSummary address={order.address} />
            <p className="mt-3 text-xs text-fg-subtle">
              {order.delivery.name} · ordered {formatDateTime(order.createdAt)}
            </p>
          </section>
          <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="pay-h">
            <h2 id="pay-h" className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-fg-subtle">
              <CreditCard className="h-4 w-4" aria-hidden="true" /> {t.order.payment}
            </h2>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{pay}</p>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            {order.payment.transactionId && <p className="mt-1 font-mono text-xs text-fg-subtle">Ref {order.payment.transactionId}</p>}
          </section>
          <div className="flex flex-col gap-3">
            {user ? (
              <ButtonLink to={'/account/orders/' + order.id} size="lg">
                {t.order.trackOrder}
              </ButtonLink>
            ) : (
              <ButtonLink to="/register" size="lg">
                Create an account to track orders
              </ButtonLink>
            )}
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink to="/shop" variant="outline">
                {t.cart.continueShopping}
              </ButtonLink>
              <Button variant="outline" onClick={() => window.print()} leftIcon={<Printer className="h-4 w-4" />}>
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ProductRecommendations kind="recommended" />
    </div>
  );
}

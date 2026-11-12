import { Link } from 'react-router-dom';
import { ArrowRight, BellOff, Heart, MapPin, Package, Truck, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAddresses, useOrders } from '@/hooks/queries';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { formatDate, formatPrice } from '@/utils/format';
import { ORDER_STATUS_NOTE } from '@/utils/orderStatus';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { OrderStatusBadge } from '@/components/account/OrderComponents';
import { ProductRecommendations } from '@/components/product/ProductRecommendations';

export function AccountDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const wishlist = useWishlist();
  const orders = useOrders();
  const addresses = useAddresses();
  useSeo({ title: t.account.dashboard, noindex: true });

  const list = orders.data ?? [];
  const active = list.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const spent = list.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0);
  const stats = [
    { label: t.account.totalOrders, value: String(list.length), icon: Package, to: '/account/orders' },
    { label: t.account.activeOrders, value: String(active.length), icon: Truck, to: '/account/orders' },
    { label: t.account.totalSpent, value: formatPrice(spent), icon: Wallet, to: '/account/orders' },
    { label: t.account.savedItems, value: String(wishlist.count), icon: Heart, to: '/account/wishlist' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-fg sm:text-3xl">{t.account.hello(user?.firstName ?? '')} 👋</h1>
        <p className="mt-1 text-sm text-fg-muted">Here’s what’s happening with your orders and account.</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-busy={orders.isLoading}>
        {stats.map((s) => (
          <li key={s.label}>
            <Link to={s.to} className="flex h-full flex-col gap-3 rounded-3xl border border-line bg-surface p-4 transition hover:border-fg sm:p-5">
              <s.icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
              {orders.isLoading ? <Skeleton className="h-7 w-16" /> : <p className="font-display text-2xl font-extrabold text-fg">{s.value}</p>}
              <p className="text-xs font-medium text-fg-muted">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      {active.length > 0 && (
        <section aria-labelledby="active-h" className="rounded-3xl bg-ink-950 p-5 text-white sm:p-6">
          <h2 id="active-h" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-volt-400">
            <Truck className="h-4 w-4" aria-hidden="true" /> On its way
          </h2>
          <ul className="mt-4 space-y-3">
            {active.slice(0, 2).map((o) => (
              <li key={o.id}>
                <Link to={'/account/orders/' + o.id} className="flex items-center gap-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 transition hover:bg-white/10">
                  <SafeImage src={o.items[0].image} alt="" width={120} ratio={1} wrapperClassName="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{o.number}</p>
                    <p className="truncate text-xs text-ink-300">{ORDER_STATUS_NOTE[o.status]}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="recent-h" className="rounded-3xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="recent-h" className="text-base font-bold text-fg">
            {t.account.recentOrders}
          </h2>
          <Link to="/account/orders" className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:underline">
            {t.common.viewAll} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        {orders.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={Package} title={t.order.noOrders} description={t.order.noOrdersHint} compact action={<ButtonLink to="/shop">{t.common.shopNow}</ButtonLink>} />
        ) : (
          <ul className="divide-y divide-line">
            {list.slice(0, 4).map((o) => (
              <li key={o.id}>
                <Link to={'/account/orders/' + o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface-muted">
                  <div>
                    <p className="text-sm font-bold text-fg">{o.number}</p>
                    <p className="text-xs text-fg-subtle">
                      {formatDate(o.createdAt)} · {t.common.items(o.items.reduce((s, i) => s + i.quantity, 0))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm font-bold tabular-nums text-fg">{formatPrice(o.totals.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="addr-h" className="rounded-3xl border border-line bg-surface p-5">
          <h2 id="addr-h" className="flex items-center gap-2 text-base font-bold text-fg">
            <MapPin className="h-4.5 w-4.5 text-brand-600" aria-hidden="true" /> {t.account.addresses}
          </h2>
          {addresses.isLoading ? (
            <Skeleton className="mt-3 h-16 rounded-xl" />
          ) : (
            <p className="mt-2 text-sm text-fg-muted">
              {addresses.data?.length ? addresses.data.length + ' saved · default: ' + (addresses.data.find((a) => a.isDefault)?.area ?? addresses.data[0].area) : t.account.noAddressesHint}
            </p>
          )}
          <Link to="/account/addresses" className="mt-3 inline-block text-sm font-bold text-brand-600 hover:underline">
            Manage addresses
          </Link>
        </section>
        <section aria-labelledby="notif-h" className="rounded-3xl border border-line bg-surface p-5">
          <h2 id="notif-h" className="text-base font-bold text-fg">
            {t.account.notificationsTitle}
          </h2>
          <EmptyState icon={BellOff} title={t.account.noNotifications} description={t.account.noNotificationsHint} compact className="py-6" />
        </section>
      </div>

      <ProductRecommendations kind="recommended" />
    </div>
  );
}

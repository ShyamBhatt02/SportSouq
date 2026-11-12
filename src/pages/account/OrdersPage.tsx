import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import type { Order } from '@/types';
import { useOrders } from '@/hooks/queries';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { formatDate, formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/account/OrderComponents';

type Filter = 'all' | 'active' | 'delivered' | 'cancelled';

const FILTERS: { key: Filter; label: string; test: (o: Order) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'active', label: 'In progress', test: (o) => !['delivered', 'cancelled'].includes(o.status) },
  { key: 'delivered', label: 'Delivered', test: (o) => o.status === 'delivered' },
  { key: 'cancelled', label: 'Cancelled', test: (o) => o.status === 'cancelled' },
];

export function OrdersPage() {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useOrders();
  const [filter, setFilter] = useState<Filter>('all');
  useSeo({ title: t.account.orders, noindex: true });
  const list = (data ?? []).filter(FILTERS.find((f) => f.key === filter)!.test);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-fg">{t.account.orders}</h1>
      <div role="tablist" aria-label="Filter orders" className="scrollbar-none mt-5 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const count = (data ?? []).filter(f.test).length;
          return (
            <button key={f.key} role="tab" type="button" aria-selected={filter === f.key} onClick={() => setFilter(f.key)} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition', filter === f.key ? 'border-fg bg-fg text-canvas' : 'border-line-strong text-fg hover:border-fg')}>
              {f.label} {data && <span className="ms-1 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading orders">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <EmptyState icon={Package} title={t.order.noOrders} description={t.order.noOrdersHint} action={<ButtonLink to="/shop">{t.common.shopNow}</ButtonLink>} />
        ) : (
          <ul className="space-y-4">
            {list.map((o) => {
              const qty = o.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <li key={o.id}>
                  <Link to={'/account/orders/' + o.id} className="group block rounded-3xl border border-line bg-surface p-4 transition hover:border-fg hover:shadow-soft sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-fg-subtle">{t.order.number}</p>
                        <p className="font-bold text-fg">{o.number}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PaymentStatusBadge status={o.paymentStatus} />
                        <OrderStatusBadge status={o.status} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex -space-x-3 rtl:space-x-reverse">
                        {o.items.slice(0, 3).map((i) => (
                          <SafeImage key={i.variantId} src={i.image} alt="" width={120} ratio={1} wrapperClassName="h-14 w-14 rounded-xl ring-2 ring-surface" />
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-fg">{o.items.map((i) => i.name).join(', ')}</p>
                        <p className="text-xs text-fg-subtle">
                          {formatDate(o.createdAt)} · {t.common.items(qty)} · {o.delivery.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold tabular-nums text-fg">{formatPrice(o.totals.total)}</span>
                        <ChevronRight className="h-5 w-5 text-fg-subtle transition group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

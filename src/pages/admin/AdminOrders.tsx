import { useEffect, useState } from 'react';
import { Eye, PackageSearch, Search } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { useAdminMutation, useAdminOrders } from '@/hooks/adminQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { orderService } from '@/services/orderService';
import { getErrorMessage } from '@/services/api/client';
import { ORDER_FLOW, ORDER_STATUS_LABEL } from '@/utils/orderStatus';
import { formatDate, formatDateTime, formatPrice } from '@/utils/format';
import { AdminPageHeader, DataTable, FilterTabs } from '@/components/admin/AdminUI';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Overlay';
import { Pagination } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/States';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { OrderStatusBadge, OrderTimeline, PaymentStatusBadge } from '@/components/account/OrderComponents';
import { AddressSummary } from '@/components/account/AddressForm';
import { SummaryRows } from '@/components/cart/OrderSummary';
import { variantLabel } from '@/components/cart/CartLine';

const STATUSES: OrderStatus[] = [...ORDER_FLOW, 'cancelled'];

function StatusSelect({ order }: { order: Order }) {
  const toast = useToast();
  const update = useAdminMutation((s: OrderStatus) => orderService.updateStatus(order.id, s));
  const locked = order.status === 'cancelled' || order.status === 'delivered';
  return (
    <select
      aria-label={'Update status for ' + order.number}
      value={order.status}
      disabled={locked || update.isPending}
      onChange={(e) =>
        update.mutate(e.target.value as OrderStatus, {
          onSuccess: (o) => toast.success('Order ' + o.number + ' → ' + ORDER_STATUS_LABEL[o.status]),
          onError: (err) => toast.error(getErrorMessage(err)),
        })
      }
      className="h-8 rounded-lg border border-line-strong bg-surface px-2 text-xs font-semibold text-fg disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} disabled={ORDER_FLOW.indexOf(s as (typeof ORDER_FLOW)[number]) < ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]) && s !== 'cancelled'}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export function AdminOrders() {
  const { t } = useI18n();
  useSeo({ title: 'Orders', noindex: true });
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Order | null>(null);
  const { data, isLoading, isFetching } = useAdminOrders({ status: status === 'all' ? undefined : status, q: q || undefined, page });
  useEffect(() => setPage(1), [status, q]);
  const current = viewing ? data?.items.find((o) => o.id === viewing.id) ?? viewing : null;
  const total = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : undefined;

  return (
    <div>
      <AdminPageHeader title={t.admin.orders} description="Update fulfilment status — customers see changes instantly in their order tracking." />
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs value={status} onChange={setStatus} options={[{ key: 'all', label: 'All', count: total }, ...STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABEL[s], count: data?.counts[s] }))]} />
        <Input placeholder="Order #, customer or email…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="xl:w-80" aria-label="Search orders" />
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          loading={isFetching}
          head={<tr><th>Order ID</th><th>Customer</th><th>Products</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th /></tr>}
          empty={!data?.items.length ? <EmptyState icon={PackageSearch} title="No orders found" compact /> : undefined}
        >
          {data?.items.map((o) => (
            <tr key={o.id} className="hover:bg-surface-muted/50">
              <td className="font-semibold text-fg">{o.number}</td>
              <td>
                <p className="font-medium text-fg">{o.customer.firstName} {o.customer.lastName}</p>
                <p className="text-xs text-fg-subtle">{o.address.city}</p>
              </td>
              <td className="max-w-56"><p className="line-clamp-1 text-fg-muted">{o.items.map((i) => i.name).join(', ')}</p><p className="text-xs text-fg-subtle">{o.items.reduce((s, i) => s + i.quantity, 0)} units</p></td>
              <td className="font-bold tabular-nums">{formatPrice(o.totals.total)}</td>
              <td><PaymentStatusBadge status={o.paymentStatus} /><p className="mt-1 text-[11px] text-fg-subtle">{o.payment.label}</p></td>
              <td><StatusSelect order={o} /></td>
              <td className="whitespace-nowrap text-fg-subtle">{formatDate(o.createdAt)}</td>
              <td><Button size="icon-sm" variant="ghost" onClick={() => setViewing(o)} aria-label={'View ' + o.number}><Eye className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </DataTable>
      )}
      {data && <Pagination className="mt-6" page={data.page} totalPages={data.totalPages} onChange={setPage} />}

      <Modal open={!!current} onClose={() => setViewing(null)} title={current ? 'Order ' + current.number : ''} description={current ? formatDateTime(current.createdAt) + ' · ' + current.customer.email : ''} size="xl">
        {current && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <OrderStatusBadge status={current.status} />
              <PaymentStatusBadge status={current.paymentStatus} />
              <span className="ms-auto"><StatusSelect order={current} /></span>
            </div>
            <OrderTimeline order={current} />
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">Items</h3>
                <ul className="divide-y divide-line text-sm">
                  {current.items.map((i) => (
                    <li key={i.variantId} className="flex justify-between gap-3 py-2">
                      <span><span className="font-medium text-fg">{i.name}</span><br /><span className="text-xs text-fg-subtle">{variantLabel(i.attributes)} × {i.quantity}</span></span>
                      <span className="font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-line pt-3"><SummaryRows totals={current.totals} couponCode={current.couponCode} deliveryLabel={current.delivery.name} /></div>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-fg-subtle">Ship to</h3>
                <AddressSummary address={current.address} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

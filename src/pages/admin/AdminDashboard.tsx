import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes, DollarSign, Package, ShoppingCart, Users, Wallet } from 'lucide-react';
import { useAnalytics, useAdminOrders, useAdminProducts } from '@/hooks/adminQueries';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { formatDate, formatNumber, formatPrice } from '@/utils/format';
import { AdminPageHeader, ChartCard, Panel, StatCard, percentDelta } from '@/components/admin/AdminUI';
import { RankedBars, TrendArea, TrendBars, TrendLine } from '@/components/admin/Charts';
import { OrderStatusBadge } from '@/components/account/OrderComponents';
import { SafeImage } from '@/components/ui/SafeImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { ButtonLink } from '@/components/ui/Button';

export function AdminDashboard() {
  const { t } = useI18n();
  useSeo({ title: 'Admin dashboard', noindex: true });
  const { data, isLoading } = useAnalytics('30d');
  const orders = useAdminOrders({ page: 1 });
  const lowStock = useAdminProducts({ availability: 'low-stock', sort: 'best-selling', pageSize: 6 });
  const k = data?.kpis;
  const p = data?.previous;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t.admin.dashboard} description="Last 30 days compared with the previous 30 days." actions={<ButtonLink to="/admin/analytics" variant="outline" size="sm">Full analytics</ButtonLink>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard label={t.admin.totalRevenue} value={k ? formatPrice(k.revenue) : '—'} delta={k && p ? percentDelta(k.revenue, p.revenue) : null} icon={DollarSign} loading={isLoading} />
        <StatCard label={t.admin.totalOrders} value={k ? formatNumber(k.orders) : '—'} delta={k && p ? percentDelta(k.orders, p.orders) : null} icon={ShoppingCart} loading={isLoading} />
        <StatCard label={t.admin.totalCustomers} value={k ? formatNumber(k.customers) : '—'} delta={k && p ? percentDelta(k.customers, p.customers) : null} icon={Users} loading={isLoading} />
        <StatCard label={t.admin.totalProducts} value={k ? formatNumber(k.products) : '—'} icon={Package} loading={isLoading} hint="Published in catalogue" />
        <StatCard label={t.admin.productsSold} value={k ? formatNumber(k.productsSold) : '—'} delta={k && p ? percentDelta(k.productsSold, p.productsSold) : null} icon={Boxes} loading={isLoading} />
        <StatCard label={t.admin.aov} value={k ? formatPrice(k.averageOrderValue) : '—'} delta={k && p ? percentDelta(k.averageOrderValue, p.averageOrderValue) : null} icon={Wallet} loading={isLoading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard className="xl:col-span-2" title={t.admin.revenue} subtitle="Daily revenue incl. VAT (AED)" loading={isLoading} rows={data?.series} columns={[{ key: 'label', label: 'Day' }, { key: 'revenue', label: 'Revenue', format: (v) => formatPrice(Number(v)) }]}>
          {data && <TrendArea data={data.series} x="label" y="revenue" name="Revenue" />}
        </ChartCard>
        <ChartCard title={t.admin.ordersChart} subtitle="Orders per day" loading={isLoading} rows={data?.series} columns={[{ key: 'label', label: 'Day' }, { key: 'orders', label: 'Orders' }]}>
          {data && <TrendBars data={data.series} x="label" y="orders" name="Orders" />}
        </ChartCard>
        <ChartCard title={t.admin.customersChart} subtitle="New registrations per day" loading={isLoading} rows={data?.series} columns={[{ key: 'label', label: 'Day' }, { key: 'customers', label: 'New customers' }]}>
          {data && <TrendLine data={data.series} x="label" y="customers" name="New customers" />}
        </ChartCard>
        <ChartCard title={t.admin.salesBySport} subtitle="Net item revenue (AED)" loading={isLoading} rows={data?.bySport} columns={[{ key: 'name', label: 'Sport' }, { key: 'revenue', label: 'Revenue', format: (v) => formatPrice(Number(v)) }, { key: 'units', label: 'Units' }]}>
          {data && <RankedBars data={data.bySport} x="name" y="revenue" name="Revenue" />}
        </ChartCard>
        <ChartCard title={t.admin.salesByCategory} subtitle="Top categories by revenue" loading={isLoading} rows={data?.byCategory} columns={[{ key: 'name', label: 'Category' }, { key: 'revenue', label: 'Revenue', format: (v) => formatPrice(Number(v)) }, { key: 'units', label: 'Units' }]}>
          {data && <RankedBars data={data.byCategory} x="name" y="revenue" name="Revenue" color="orders" />}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title={t.admin.recentOrders} action={<Link to="/admin/orders" className="text-xs font-bold text-brand-600 hover:underline">{t.common.viewAll}</Link>} bodyClassName="p-0">
          {orders.isLoading ? (
            <div className="space-y-2 p-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <tbody className="divide-y divide-line">
                  {orders.data?.items.slice(0, 7).map((o) => (
                    <tr key={o.id}>
                      <td className="px-5 py-3 font-semibold text-fg">{o.number}</td>
                      <td className="px-3 py-3 text-fg-muted">{o.customer.firstName} {o.customer.lastName}</td>
                      <td className="px-3 py-3 text-fg-subtle">{formatDate(o.createdAt)}</td>
                      <td className="px-3 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-5 py-3 text-end font-bold tabular-nums">{formatPrice(o.totals.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning-600" aria-hidden="true" /> {t.admin.lowStock}</span>} action={<Link to="/admin/inventory" className="text-xs font-bold text-brand-600 hover:underline">{t.admin.inventory}</Link>}>
          {lowStock.isLoading ? (
            <Skeleton className="h-40" />
          ) : lowStock.data?.items.length ? (
            <ul className="space-y-3">
              {lowStock.data.items.map((pr) => (
                <li key={pr.id} className="flex items-center gap-3">
                  <SafeImage src={pr.thumbnail} alt="" width={96} ratio={1} wrapperClassName="h-10 w-10 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{pr.name}</span>
                  <span className="shrink-0 rounded-full bg-warning-50 px-2 py-0.5 text-xs font-bold text-warning-600 dark:bg-warning-500/10">{pr.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">All products are well stocked.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

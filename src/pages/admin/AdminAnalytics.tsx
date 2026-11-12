import { useState } from 'react';
import { Boxes, DollarSign, ShoppingCart, Users, Wallet } from 'lucide-react';
import type { AnalyticsRange } from '@/types';
import { useAnalytics } from '@/hooks/adminQueries';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { formatNumber, formatPrice } from '@/utils/format';
import { ORDER_STATUS_LABEL } from '@/utils/orderStatus';
import { AdminPageHeader, ChartCard, FilterTabs, Panel, StatCard, percentDelta } from '@/components/admin/AdminUI';
import { RankedBars, TrendArea, TrendBars, TrendLine } from '@/components/admin/Charts';
import { SafeImage } from '@/components/ui/SafeImage';
import { Skeleton } from '@/components/ui/Skeleton';

export function AdminAnalytics() {
  const { t } = useI18n();
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const { data, isLoading, isFetching } = useAnalytics(range);
  useSeo({ title: 'Analytics', noindex: true });
  const k = data?.kpis;
  const p = data?.previous;
  const ranges = (Object.keys(t.admin.ranges) as AnalyticsRange[]).map((r) => ({ key: r, label: t.admin.ranges[r] }));
  const bucket = range === 'today' ? 'Hour' : range === '3m' ? 'Week' : range === '12m' ? 'Month' : 'Day';

  return (
    <div className="space-y-6" aria-busy={isFetching}>
      <AdminPageHeader title={t.admin.analytics} description="Store performance across all channels. Cancelled orders are excluded." actions={<FilterTabs value={range} onChange={setRange} options={ranges} />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
        <StatCard label={t.admin.revenue} value={k ? formatPrice(k.revenue) : '—'} delta={k && p ? percentDelta(k.revenue, p.revenue) : null} icon={DollarSign} loading={isLoading} />
        <StatCard label={t.admin.orders} value={k ? formatNumber(k.orders) : '—'} delta={k && p ? percentDelta(k.orders, p.orders) : null} icon={ShoppingCart} loading={isLoading} />
        <StatCard label={t.admin.customers} value={k ? formatNumber(k.customers) : '—'} delta={k && p ? percentDelta(k.customers, p.customers) : null} icon={Users} loading={isLoading} />
        <StatCard label={t.admin.productsSold} value={k ? formatNumber(k.productsSold) : '—'} delta={k && p ? percentDelta(k.productsSold, p.productsSold) : null} icon={Boxes} loading={isLoading} />
        <StatCard label={t.admin.aov} value={k ? formatPrice(k.averageOrderValue) : '—'} delta={k && p ? percentDelta(k.averageOrderValue, p.averageOrderValue) : null} icon={Wallet} loading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard className="lg:col-span-2" title="Revenue trend" subtitle={'Revenue per ' + bucket.toLowerCase() + ' (AED, incl. VAT)'} loading={isLoading} height={320} rows={data?.series} columns={[{ key: 'label', label: bucket }, { key: 'revenue', label: 'Revenue', format: (v) => formatPrice(Number(v)) }]}>
          {data && <TrendArea data={data.series} x="label" y="revenue" name="Revenue" />}
        </ChartCard>
        <ChartCard title="Orders trend" subtitle={'Orders per ' + bucket.toLowerCase()} loading={isLoading} rows={data?.series} columns={[{ key: 'label', label: bucket }, { key: 'orders', label: 'Orders' }]}>
          {data && <TrendBars data={data.series} x="label" y="orders" name="Orders" />}
        </ChartCard>
        <ChartCard title={t.admin.customerGrowth} subtitle="Total registered customers" loading={isLoading} rows={data?.customerGrowth} columns={[{ key: 'label', label: bucket }, { key: 'total', label: 'Total' }, { key: 'new', label: 'New' }]}>
          {data && <TrendLine data={data.customerGrowth} x="label" y="total" name="Customers" />}
        </ChartCard>
        <ChartCard title={t.admin.salesBySport} subtitle="Item revenue (AED)" loading={isLoading} height={320} rows={data?.bySport} columns={[{ key: 'name', label: 'Sport' }, { key: 'revenue', label: 'Revenue', format: (v) => formatPrice(Number(v)) }, { key: 'units', label: 'Units' }]}>
          {data && <RankedBars data={data.bySport} x="name" y="revenue" name="Revenue" />}
        </ChartCard>
        <ChartCard title={t.admin.salesByCategory} subtitle="Item revenue (AED)" loading={isLoading} height={320} rows={data?.byCategory} columns={[{ key: 'name', label: 'Category' }, { key: 'revenue', label: 'Revenue', format: (v) => formatPrice(Number(v)) }, { key: 'units', label: 'Units' }]}>
          {data && <RankedBars data={data.byCategory} x="name" y="revenue" name="Revenue" color="orders" />}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title={t.admin.topProducts} bodyClassName="p-0">
          {isLoading ? (
            <Skeleton className="m-5 h-48" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-fg-subtle">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">Product</th>
                  <th className="px-3 py-3 text-end font-semibold">Units</th>
                  <th className="px-5 py-3 text-end font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.topProducts.map((tp) => (
                  <tr key={tp.id}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <SafeImage src={tp.image} alt="" width={96} ratio={1} wrapperClassName="h-9 w-9 shrink-0 rounded-lg" />
                        <span className="line-clamp-1 font-medium text-fg">{tp.name}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-end tabular-nums">{tp.units}</td>
                    <td className="px-5 py-3 text-end font-semibold tabular-nums">{formatPrice(tp.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        <Panel title="Orders by status">
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <ul className="space-y-3">
              {data?.statusBreakdown.map((s) => {
                const total = data.statusBreakdown.reduce((a, b) => a + b.count, 0) || 1;
                return (
                  <li key={s.status}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-fg">{ORDER_STATUS_LABEL[s.status]}</span>
                      <span className="tabular-nums text-fg-muted">{s.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-sunken">
                      <div className="h-full rounded-full bg-ink-700 dark:bg-ink-300" style={{ width: (s.count / total) * 100 + '%' }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

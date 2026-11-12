import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useAdminCustomers } from '@/hooks/adminQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { getEmirate } from '@/config/site';
import { formatDate, formatPrice, initials } from '@/utils/format';
import { AdminPageHeader, DataTable, FilterTabs } from '@/components/admin/AdminUI';
import { Input } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/States';
import { TableSkeleton } from '@/components/ui/Skeleton';

export function AdminCustomers() {
  const { t } = useI18n();
  useSeo({ title: 'Customers', noindex: true });
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 300);
  const [sort, setSort] = useState<'recent' | 'spent' | 'orders'>('recent');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useAdminCustomers({ q: q || undefined, sort, page });
  useEffect(() => setPage(1), [q, sort]);

  return (
    <div>
      <AdminPageHeader title={t.admin.customers} description={data ? data.total + ' registered customers' : undefined} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input placeholder="Name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="lg:w-80" aria-label="Search customers" />
        <FilterTabs value={sort} onChange={setSort} options={[{ key: 'recent', label: 'Newest' }, { key: 'spent', label: 'Top spenders' }, { key: 'orders', label: 'Most orders' }]} />
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          loading={isFetching}
          head={<tr><th>Customer</th><th>Email</th><th>Phone</th><th>Emirate</th><th>Orders</th><th>Total spent</th><th>Registered</th></tr>}
          empty={!data?.items.length ? <EmptyState icon={Users} title="No customers found" compact /> : undefined}
        >
          {data?.items.map((c) => (
            <tr key={c.id} className="hover:bg-surface-muted/50">
              <td>
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-bold text-fg-muted">{initials(c.name)}</span>
                  <span className="font-semibold text-fg">{c.name}</span>
                </span>
              </td>
              <td className="text-fg-muted">{c.email}</td>
              <td className="whitespace-nowrap text-fg-muted">{c.phone}</td>
              <td className="text-fg-muted">{getEmirate(c.emirate).name}</td>
              <td className="tabular-nums">{c.ordersCount}</td>
              <td className="font-semibold tabular-nums">{formatPrice(c.totalSpent)}</td>
              <td className="whitespace-nowrap text-fg-subtle">{formatDate(c.registeredAt)}</td>
            </tr>
          ))}
        </DataTable>
      )}
      {data && <Pagination className="mt-6" page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
}

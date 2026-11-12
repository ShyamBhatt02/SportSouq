import { useEffect, useState } from 'react';
import { Boxes, PackageSearch, Search } from 'lucide-react';
import type { Product, ProductQuery } from '@/types';
import { useAdminMutation, useAdminProducts } from '@/hooks/adminQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api/client';
import { titleCase } from '@/utils/format';
import { AdminPageHeader, DataTable, FilterTabs } from '@/components/admin/AdminUI';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Overlay';
import { Pagination } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/States';
import { SafeImage } from '@/components/ui/SafeImage';
import { TableSkeleton } from '@/components/ui/Skeleton';

type StockFilter = 'all' | 'in' | 'low' | 'out';

function StockBadge({ p }: { p: Product }) {
  const { t } = useI18n();
  if (p.stock <= 0) return <Badge tone="danger" dot>{t.admin.outOfStock}</Badge>;
  if (p.stock <= p.lowStockThreshold) return <Badge tone="warning" dot>{t.admin.lowStockStatus}</Badge>;
  return <Badge tone="success" dot>{t.admin.inStock}</Badge>;
}

function StockEditor({ product, onDone }: { product: Product; onDone: () => void }) {
  const toast = useToast();
  const { t } = useI18n();
  const [threshold, setThreshold] = useState(String(product.lowStockThreshold));
  const [stock, setStock] = useState<Record<string, string>>(() => Object.fromEntries(product.variants.map((v) => [v.id, String(v.stock)])));
  const save = useAdminMutation(() =>
    productService.updateInventory(product.id, {
      lowStockThreshold: Number(threshold),
      variantStock: Object.fromEntries(Object.entries(stock).map(([k, v]) => [k, Math.max(0, Math.floor(Number(v) || 0))])),
    }),
  );
  const label = (attrs: Product['variants'][number]['attributes']) =>
    [attrs.color, attrs.size, attrs.gender && titleCase(attrs.gender), attrs.config].filter(Boolean).join(' · ') || 'Default';
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(undefined, { onSuccess: () => { toast.success('Inventory updated', { description: product.name }); onDone(); }, onError: (err) => toast.error(getErrorMessage(err)) });
      }}
      className="space-y-4"
    >
      <Input label={t.admin.threshold} type="number" min={0} max={1000} value={threshold} onChange={(e) => setThreshold(e.target.value)} wrapperClassName="max-w-48" />
      <div className="max-h-[50vh] overflow-y-auto rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-muted text-xs text-fg-subtle">
            <tr><th className="px-4 py-2 text-start">Variant</th><th className="px-4 py-2 text-start">SKU</th><th className="px-4 py-2 text-end">Stock</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {product.variants.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2 font-medium text-fg">{label(v.attributes)}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-fg-subtle">{v.sku}</td>
                <td className="px-4 py-2 text-end">
                  <label className="sr-only" htmlFor={'stock-' + v.id}>Stock for {label(v.attributes)}</label>
                  <input id={'stock-' + v.id} type="number" min={0} value={stock[v.id]} onChange={(e) => setStock((s) => ({ ...s, [v.id]: e.target.value }))} className="h-9 w-24 rounded-lg border border-line-strong bg-surface px-2 text-end tabular-nums" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onDone}>{t.common.cancel}</Button>
        <Button type="submit" loading={save.isPending}>{t.common.saveChanges}</Button>
      </div>
    </form>
  );
}

export function AdminInventory() {
  const { t } = useI18n();
  useSeo({ title: 'Inventory', noindex: true });
  const [filter, setFilter] = useState<StockFilter>('all');
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  useEffect(() => setPage(1), [filter, q]);
  // "out" and "in" are derived client-side over the full list; "low" uses the API filter.
  const query: ProductQuery = { q: q || undefined, sort: 'best-selling', pageSize: filter === 'all' || filter === 'low' ? 15 : 100, page: filter === 'all' || filter === 'low' ? page : 1, availability: filter === 'low' ? 'low-stock' : undefined };
  const { data, isLoading, isFetching } = useAdminProducts(query);
  const all = useAdminProducts({ pageSize: 100 });
  const counts = {
    all: all.data?.total,
    in: all.data?.items.filter((p) => p.stock > p.lowStockThreshold).length,
    low: all.data?.items.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
    out: all.data?.items.filter((p) => p.stock <= 0).length,
  };
  const items = (data?.items ?? []).filter((p) => (filter === 'out' ? p.stock <= 0 : filter === 'in' ? p.stock > p.lowStockThreshold : true));
  const units = all.data?.items.reduce((s, p) => s + p.stock, 0);

  return (
    <div>
      <AdminPageHeader title={t.admin.inventory} description={units !== undefined ? units.toLocaleString('en-AE') + ' units on hand across ' + (all.data?.total ?? 0) + ' products' : undefined} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs value={filter} onChange={setFilter} options={[{ key: 'all', label: 'All', count: counts.all }, { key: 'in', label: t.admin.inStock, count: counts.in }, { key: 'low', label: t.admin.lowStockStatus, count: counts.low }, { key: 'out', label: t.admin.outOfStock, count: counts.out }]} />
        <Input placeholder="Search product or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="lg:w-80" aria-label="Search inventory" />
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          loading={isFetching}
          head={<tr><th>Product</th><th>SKU</th><th>Variants</th><th>Current stock</th><th>Low stock threshold</th><th>Status</th><th /></tr>}
          empty={!items.length ? <EmptyState icon={PackageSearch} title="Nothing here" description="No products match this stock status." compact /> : undefined}
        >
          {items.map((p) => (
            <tr key={p.id} className="hover:bg-surface-muted/50">
              <td>
                <span className="flex items-center gap-3">
                  <SafeImage src={p.thumbnail} alt="" width={96} ratio={1} wrapperClassName="h-10 w-10 shrink-0 rounded-lg" />
                  <span className="line-clamp-1 max-w-60 font-semibold text-fg">{p.name}</span>
                </span>
              </td>
              <td className="font-mono text-xs text-fg-muted">{p.sku}</td>
              <td className="tabular-nums text-fg-muted">{p.variants.length}</td>
              <td className="font-bold tabular-nums">{p.stock}</td>
              <td className="tabular-nums text-fg-muted">{p.lowStockThreshold}</td>
              <td><StockBadge p={p} /></td>
              <td><Button size="sm" variant="outline" onClick={() => setEditing(p)} leftIcon={<Boxes className="h-3.5 w-3.5" />}>{t.admin.restock}</Button></td>
            </tr>
          ))}
        </DataTable>
      )}
      {data && (filter === 'all' || filter === 'low') && <Pagination className="mt-6" page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={t.admin.restock} description={editing?.name} size="lg">
        {editing && <StockEditor product={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

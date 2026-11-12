import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, PackageSearch, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Product, ProductQuery } from '@/types';
import { productFormSchema, type ProductFormValues } from '@/schemas';
import { useAdminMutation, useAdminProducts } from '@/hooks/adminQueries';
import { useCategories } from '@/hooks/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api/client';
import { BRAND_NAMES } from '@/data/brands';
import { SPORTS } from '@/data/sports';
import { PHOTOS } from '@/data/images';
import { formatPrice } from '@/utils/format';
import { AdminPageHeader, DataTable, FilterTabs } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Checkbox } from '@/components/ui/Choice';
import { Modal } from '@/components/ui/Overlay';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Navigation';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { SafeImage } from '@/components/ui/SafeImage';
import { TableSkeleton } from '@/components/ui/Skeleton';

const IMAGE_OPTIONS = Object.keys(PHOTOS).filter((k) => !k.startsWith('person'));

function ProductForm({ product, onDone }: { product: Product | null; onDone: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const categories = useCategories();
  const save = useAdminMutation((v: ProductFormValues) => (product ? productService.update(product.id, v) : productService.create(v)));
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name, brand: product.brand, sport: product.sport, category: product.category, subcategory: product.subcategory,
          price: product.price, originalPrice: product.originalPrice, stock: product.stock, shortDescription: product.shortDescription,
          description: product.description, image: product.images[0], gender: product.gender, status: product.status,
          featured: product.featured, bestseller: product.bestseller, newArrival: product.newArrival, deal: product.deal,
        }
      : {
          name: '', brand: 'Nike', sport: 'football', category: 'football', subcategory: 'football-boots', price: 199, originalPrice: 199, stock: 20,
          shortDescription: '', description: '', image: 'footballBootStep', gender: 'unisex', status: 'draft', featured: false, bestseller: false, newArrival: true, deal: false,
        },
  });
  const category = useWatch({ control, name: 'category' });
  const image = useWatch({ control, name: 'image' });
  const subs = categories.data?.find((c) => c.slug === category)?.subcategories ?? [];
  useEffect(() => {
    if (subs.length && !subs.some((s) => s.slug === control._formValues.subcategory)) setValue('subcategory', subs[0].slug);
  }, [category, subs, setValue, control]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await save.mutateAsync(v);
      toast.success(product ? 'Product updated' : 'Product created', { description: v.name });
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });
  const num = { setValueAs: (v: string) => (v === '' ? undefined : Number(v)) };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Input label="Product name" required wrapperClassName="sm:col-span-2" error={errors.name?.message} {...register('name')} />
      <Select label="Brand" required options={BRAND_NAMES.map((b) => ({ value: b, label: b }))} error={errors.brand?.message} {...register('brand')} />
      <Select label="Sport" required options={SPORTS.map((s) => ({ value: s.slug, label: s.name }))} error={errors.sport?.message} {...register('sport')} />
      <Select label="Category" required options={(categories.data ?? []).map((c) => ({ value: c.slug, label: c.name }))} error={errors.category?.message} {...register('category')} />
      <Select label="Subcategory" required options={subs.map((s) => ({ value: s.slug, label: s.name }))} error={errors.subcategory?.message} {...register('subcategory')} />
      <Input label="Price (AED)" type="number" required min={1} error={errors.price?.message} {...register('price', num)} />
      <Input label="Original price (AED)" type="number" required min={1} hint="Higher than price = on sale" error={errors.originalPrice?.message} {...register('originalPrice', num)} />
      <Input label="Total stock" type="number" required min={0} error={errors.stock?.message} {...register('stock', num)} />
      <Select label="Gender" options={['men', 'women', 'unisex', 'kids'].map((g) => ({ value: g, label: g[0].toUpperCase() + g.slice(1) }))} {...register('gender')} />
      <div className="sm:col-span-2 grid grid-cols-[1fr_auto] items-end gap-3">
        <Select label="Image" required options={IMAGE_OPTIONS.map((k) => ({ value: k, label: k.replace(/([A-Z])/g, ' $1').toLowerCase() }))} error={errors.image?.message} {...register('image')} />
        <SafeImage src={image} alt="Selected product image" width={120} ratio={1} wrapperClassName="h-11 w-11 rounded-xl" />
      </div>
      <Textarea label="Short description" required rows={2} wrapperClassName="sm:col-span-2" error={errors.shortDescription?.message} {...register('shortDescription')} />
      <Textarea label="Full description" required rows={5} wrapperClassName="sm:col-span-2" error={errors.description?.message} {...register('description')} />
      <Select label="Status" options={[{ value: 'published', label: t.admin.published }, { value: 'draft', label: t.admin.draft }]} {...register('status')} />
      <fieldset className="grid grid-cols-2 gap-2 self-end">
        <legend className="mb-1 text-sm font-semibold text-fg">Merchandising</legend>
        <Checkbox label="Featured" {...register('featured')} />
        <Checkbox label="Best seller" {...register('bestseller')} />
        <Checkbox label="New arrival" {...register('newArrival')} />
        <Checkbox label="Deal" {...register('deal')} />
      </fieldset>
      <div className="flex justify-end gap-3 border-t border-line pt-4 sm:col-span-2">
        <Button variant="ghost" onClick={onDone}>{t.common.cancel}</Button>
        <Button type="submit" loading={save.isPending}>{product ? t.common.saveChanges : t.admin.addProduct}</Button>
      </div>
    </form>
  );
}

export function AdminProducts() {
  const { t } = useI18n();
  const toast = useToast();
  useSeo({ title: 'Products', noindex: true });
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 300);
  const [sport, setSport] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const query: ProductQuery = { q: q || undefined, sport: sport === 'all' ? undefined : [sport as Product['sport']], page, pageSize: 12, sort: 'newest' };
  const { data, isLoading, isFetching } = useAdminProducts(query);
  const toggle = useAdminMutation((p: Product) => productService.setStatus(p.id, p.status === 'published' ? 'draft' : 'published'));
  const remove = useAdminMutation((id: string) => productService.remove(id));

  useEffect(() => setPage(1), [q, sport]);

  return (
    <div>
      <AdminPageHeader title={t.admin.products} description={data ? data.total + ' products (including drafts)' : undefined} actions={<Button onClick={() => setEditing('new')} leftIcon={<Plus className="h-4 w-4" />}>{t.admin.addProduct}</Button>} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input placeholder="Search name, brand or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} wrapperClassName="lg:w-80" aria-label="Search products" />
        <FilterTabs value={sport} onChange={setSport} options={[{ key: 'all', label: 'All sports' }, ...SPORTS.map((s) => ({ key: s.slug, label: s.slug === 'boxing' ? 'Boxing' : s.name }))]} />
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          loading={isFetching}
          head={<tr><th>Image</th><th>Product</th><th>Brand</th><th>Sport</th><th>Price</th><th>Stock</th><th>Status</th><th className="text-end!">Actions</th></tr>}
          empty={!data?.items.length ? <EmptyState icon={PackageSearch} title="No products found" description="Try a different search or sport." compact /> : undefined}
        >
          {data?.items.map((p) => (
            <tr key={p.id} className="hover:bg-surface-muted/50">
              <td><SafeImage src={p.thumbnail} alt="" width={96} ratio={1} wrapperClassName="h-11 w-11 rounded-lg" /></td>
              <td className="max-w-64">
                <Link to={'/product/' + p.slug} target="_blank" className="line-clamp-1 font-semibold text-fg hover:text-brand-600">{p.name}</Link>
                <p className="font-mono text-[11px] text-fg-subtle">{p.sku}</p>
              </td>
              <td className="text-fg-muted">{p.brand}</td>
              <td className="capitalize text-fg-muted">{p.sport}</td>
              <td className="tabular-nums">
                <span className="font-semibold">{formatPrice(p.price)}</span>
                {p.discountPercentage > 0 && <span className="ms-1 text-xs text-success-600">-{p.discountPercentage}%</span>}
              </td>
              <td className={p.stock === 0 ? 'font-bold text-danger-600' : p.stock <= p.lowStockThreshold ? 'font-bold text-warning-600' : 'tabular-nums'}>{p.stock}</td>
              <td><Badge tone={p.status === 'published' ? 'success' : 'neutral'} dot>{p.status === 'published' ? t.admin.published : t.admin.draft}</Badge></td>
              <td>
                <div className="flex justify-end gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => setEditing(p)} aria-label={t.common.edit + ' ' + p.name}><Pencil className="h-4 w-4" /></Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => toggle.mutate(p, { onSuccess: () => toast.success(p.status === 'published' ? 'Unpublished' : 'Published', { description: p.name }), onError: (e) => toast.error(getErrorMessage(e)) })}
                    aria-label={(p.status === 'published' ? t.admin.unpublish : t.admin.publish) + ' ' + p.name}
                    title={p.status === 'published' ? t.admin.unpublish : t.admin.publish}
                  >
                    {p.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon-sm" variant="ghost" className="text-danger-600" onClick={() => setDeleting(p)} aria-label={t.common.delete + ' ' + p.name}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
      {data && <Pagination className="mt-6" page={data.page} totalPages={data.totalPages} onChange={setPage} />}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? t.admin.addProduct : t.admin.editProduct} size="lg">
        {editing && <ProductForm product={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        title={t.common.delete}
        message={deleting ? t.admin.deleteProductConfirm(deleting.name) : ''}
        confirmLabel={t.common.delete}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.info('Product deleted', { description: deleting.name }); setDeleting(null); }, onError: (e) => toast.error(getErrorMessage(e)) })}
      />
    </div>
  );
}

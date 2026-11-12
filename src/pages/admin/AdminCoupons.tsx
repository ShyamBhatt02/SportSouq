import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, TicketPercent, Trash2 } from 'lucide-react';
import type { Coupon } from '@/types';
import { couponFormSchema, type CouponFormValues } from '@/schemas';
import { useAdminCoupons, useAdminMutation } from '@/hooks/adminQueries';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { couponService } from '@/services/couponService';
import { getErrorMessage } from '@/services/api/client';
import { formatDate, formatPrice } from '@/utils/format';
import { AdminPageHeader, DataTable } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Checkbox, Switch } from '@/components/ui/Choice';
import { Modal } from '@/components/ui/Overlay';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { TableSkeleton } from '@/components/ui/Skeleton';

function CouponForm({ coupon, onDone }: { coupon: Coupon | null; onDone: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const save = useAdminMutation((v: CouponFormValues) => (coupon ? couponService.update(coupon.code, v) : couponService.create(v)));
  const { register, handleSubmit, control, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: coupon
      ? { ...coupon, expiresAt: coupon.expiresAt.slice(0, 10), firstOrderOnly: !!coupon.firstOrderOnly }
      : { code: '', description: '', type: 'percentage', value: 10, minOrder: 0, expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10), active: true, firstOrderOnly: false },
  });
  const type = useWatch({ control, name: 'type' });
  const num = { setValueAs: (v: string) => (v === '' ? undefined : Number(v)) };
  const onSubmit = handleSubmit(async (v) => {
    try {
      await save.mutateAsync(v);
      toast.success(coupon ? 'Coupon updated' : 'Coupon created', { description: v.code });
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Input label="Code" required className="uppercase" error={errors.code?.message} {...register('code')} />
      <Select label="Type" options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount (AED)' }, { value: 'free-delivery', label: 'Free delivery' }]} {...register('type')} />
      <Input label="Description" required wrapperClassName="sm:col-span-2" error={errors.description?.message} {...register('description')} />
      {type !== 'free-delivery' && <Input label={type === 'percentage' ? 'Discount (%)' : 'Discount (AED)'} type="number" required error={errors.value?.message} {...register('value', num)} />}
      <Input label="Minimum order (AED)" type="number" required error={errors.minOrder?.message} {...register('minOrder', num)} />
      {type === 'percentage' && <Input label="Max discount (AED)" type="number" hint="Optional cap" error={errors.maxDiscount?.message} {...register('maxDiscount', num)} />}
      <Input label="Expires on" type="date" required error={errors.expiresAt?.message} {...register('expiresAt')} />
      <Input label="Usage limit" type="number" hint="Optional total redemptions" error={errors.usageLimit?.message} {...register('usageLimit', num)} />
      <div className="flex flex-col gap-3 sm:col-span-2">
        <Checkbox label="Active" {...register('active')} />
        <Checkbox label="First order only" {...register('firstOrderOnly')} />
      </div>
      <div className="flex justify-end gap-3 border-t border-line pt-4 sm:col-span-2">
        <Button variant="ghost" onClick={onDone}>{t.common.cancel}</Button>
        <Button type="submit" loading={save.isPending}>{coupon ? t.common.saveChanges : t.admin.addCoupon}</Button>
      </div>
    </form>
  );
}

export function AdminCoupons() {
  const { t } = useI18n();
  const toast = useToast();
  useSeo({ title: 'Coupons', noindex: true });
  const { data, isLoading, isFetching } = useAdminCoupons();
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const toggle = useAdminMutation((code: string) => couponService.toggle(code));
  const remove = useAdminMutation((code: string) => couponService.remove(code));
  const now = Date.now();

  const valueLabel = (c: Coupon) => (c.type === 'percentage' ? c.value + '%' + (c.maxDiscount ? ' (max ' + formatPrice(c.maxDiscount) + ')' : '') : c.type === 'fixed' ? formatPrice(c.value) : 'Free delivery');

  return (
    <div>
      <AdminPageHeader title={t.admin.coupons} description="Create and manage promotional codes." actions={<Button onClick={() => setEditing('new')} leftIcon={<Plus className="h-4 w-4" />}>{t.admin.addCoupon}</Button>} />
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          loading={isFetching}
          head={<tr><th>Code</th><th>Discount</th><th>Min. order</th><th>Usage</th><th>Expires</th><th>Status</th><th>Active</th><th /></tr>}
          empty={!data?.length ? <EmptyState icon={TicketPercent} title="No coupons yet" compact /> : undefined}
        >
          {data?.map((c) => {
            const expired = new Date(c.expiresAt).getTime() < now;
            return (
              <tr key={c.code} className="hover:bg-surface-muted/50">
                <td><p className="font-mono font-bold text-fg">{c.code}</p><p className="max-w-60 truncate text-xs text-fg-subtle">{c.description}</p></td>
                <td className="whitespace-nowrap">{valueLabel(c)}</td>
                <td className="tabular-nums">{c.minOrder ? formatPrice(c.minOrder) : '—'}</td>
                <td className="tabular-nums text-fg-muted">{c.usedCount.toLocaleString('en-AE')}{c.usageLimit ? ' / ' + c.usageLimit : ''}</td>
                <td className="whitespace-nowrap text-fg-muted">{formatDate(c.expiresAt)}</td>
                <td>{expired ? <Badge tone="neutral">Expired</Badge> : c.active ? <Badge tone="success" dot>Live</Badge> : <Badge tone="warning">Paused</Badge>}</td>
                <td>
                  <Switch label={(c.active ? t.admin.deactivate : t.admin.activate) + ' ' + c.code} checked={c.active} onChange={() => toggle.mutate(c.code, { onSuccess: (x) => toast.success(x.code + (x.active ? ' activated' : ' deactivated')), onError: (e) => toast.error(getErrorMessage(e)) })} />
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => setEditing(c)} aria-label={t.common.edit + ' ' + c.code}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon-sm" variant="ghost" className="text-danger-600" onClick={() => setDeleting(c)} aria-label={t.common.delete + ' ' + c.code}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? t.admin.addCoupon : t.admin.editCoupon} size="lg">
        {editing && <CouponForm coupon={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        title={'Delete ' + (deleting?.code ?? '')}
        message="Customers will no longer be able to use this code."
        confirmLabel={t.common.delete}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.code, { onSuccess: () => { toast.info('Coupon deleted'); setDeleting(null); }, onError: (e) => toast.error(getErrorMessage(e)) })}
      />
    </div>
  );
}

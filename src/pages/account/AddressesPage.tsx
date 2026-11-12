import { useState } from 'react';
import { Building2, Home, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { Address } from '@/types';
import { useAddresses, useAddressMutations } from '@/hooks/queries';
import { useToast } from '@/context/ToastContext';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { getErrorMessage } from '@/services/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Overlay';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddressForm, AddressSummary } from '@/components/account/AddressForm';

export function AddressesPage() {
  const { t } = useI18n();
  const toast = useToast();
  const { data, isLoading } = useAddresses();
  const m = useAddressMutations();
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);
  useSeo({ title: t.account.addresses, noindex: true });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-fg">{t.account.addresses}</h1>
        {!!data?.length && (
          <Button onClick={() => setEditing('new')} leftIcon={<Plus className="h-4 w-4" />}>
            {t.account.addAddress}
          </Button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-52 rounded-3xl" />
            <Skeleton className="h-52 rounded-3xl" />
          </div>
        ) : !data?.length ? (
          <EmptyState icon={MapPin} title={t.account.noAddresses} description={t.account.noAddressesHint} action={<Button onClick={() => setEditing('new')} leftIcon={<Plus className="h-4 w-4" />}>{t.account.addAddress}</Button>} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {data.map((a) => (
              <li key={a.id} className="flex flex-col rounded-3xl border border-line bg-surface p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-bold text-fg">
                    {a.label === 'home' ? <Home className="h-4.5 w-4.5 text-brand-600" aria-hidden="true" /> : <Building2 className="h-4.5 w-4.5 text-brand-600" aria-hidden="true" />}
                    {a.label === 'home' ? 'Home' : 'Office'}
                  </p>
                  {a.isDefault && <Badge tone="dark">{t.account.defaultAddress}</Badge>}
                </div>
                <div className="mt-3 flex-1">
                  <AddressSummary address={a} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button size="sm" variant="outline" onClick={() => setEditing(a)} leftIcon={<Pencil className="h-3.5 w-3.5" />}>
                    {t.common.edit}
                  </Button>
                  {!a.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={m.setDefault.isPending && m.setDefault.variables === a.id}
                      onClick={() =>
                        m.setDefault.mutate(a.id, {
                          onSuccess: () => toast.success(t.toast.addressSaved, { description: 'Default address updated' }),
                          onError: (e) => toast.error(getErrorMessage(e)),
                        })
                      }
                      leftIcon={<Star className="h-3.5 w-3.5" />}
                    >
                      {t.account.makeDefault}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="ms-auto text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10" onClick={() => setDeleting(a)} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
                    {t.common.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? t.account.addAddress : t.account.editAddress} size="lg">
        {editing && (
          <AddressForm
            initial={editing === 'new' ? { isDefault: !data?.length } : editing}
            onSubmit={async (input) => {
              try {
                if (editing === 'new') await m.create.mutateAsync(input);
                else await m.update.mutateAsync({ id: editing.id, input });
                toast.success(t.toast.addressSaved);
                setEditing(null);
              } catch (err) {
                toast.error(getErrorMessage(err));
              }
            }}
            footer={({ submitting }) => (
              <div className="flex justify-end gap-3 border-t border-line pt-4">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" loading={submitting}>
                  {t.common.save}
                </Button>
              </div>
            )}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={t.account.deleteAddressConfirm}
        message={deleting ? deleting.building + ', ' + deleting.area : ''}
        confirmLabel={t.common.delete}
        loading={m.remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          m.remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.info(t.toast.addressDeleted);
              setDeleting(null);
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </div>
  );
}

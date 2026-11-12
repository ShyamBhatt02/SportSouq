import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Check, MessageSquareText, Trash2, X } from 'lucide-react';
import type { ReviewStatus } from '@/types';
import { useAdminMutation, useAdminReviews } from '@/hooks/adminQueries';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { reviewService } from '@/services/reviewService';
import { getErrorMessage } from '@/services/api/client';
import { formatDate } from '@/utils/format';
import { AdminPageHeader, FilterTabs } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Stars } from '@/components/product/ProductMeta';

type Filter = 'all' | ReviewStatus;

export function AdminReviews() {
  const { t } = useI18n();
  const toast = useToast();
  useSeo({ title: 'Reviews', noindex: true });
  const [filter, setFilter] = useState<Filter>('pending');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { data, isLoading, isFetching } = useAdminReviews({ status: filter, page });
  useEffect(() => setPage(1), [filter]);
  const moderate = useAdminMutation(({ id, status }: { id: string; status: ReviewStatus }) => reviewService.moderate(id, status));
  const remove = useAdminMutation((id: string) => reviewService.remove(id));
  const tone = { approved: 'success', pending: 'warning', rejected: 'danger' } as const;

  return (
    <div>
      <AdminPageHeader title={t.admin.reviews} description="New customer reviews are held for moderation before they go live." />
      <div className="mb-4">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'pending', label: t.admin.pending, count: data?.counts.pending },
            { key: 'approved', label: t.admin.approved, count: data?.counts.approved },
            { key: 'rejected', label: t.admin.rejected, count: data?.counts.rejected },
            { key: 'all', label: 'All', count: data?.counts.all },
          ]}
        />
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
      ) : !data?.items.length ? (
        <EmptyState icon={MessageSquareText} title={filter === 'pending' ? 'Moderation queue is clear' : 'No reviews'} description={filter === 'pending' ? 'New reviews from customers will appear here.' : undefined} />
      ) : (
        <ul className={'space-y-3 ' + (isFetching ? 'opacity-70' : '')}>
          {data.items.map((r) => (
            <li key={r.id} className="rounded-3xl border border-line bg-surface p-5">
              <div className="flex flex-col gap-4 md:flex-row">
                <Link to={'/product/' + r.productSlug} target="_blank" className="flex shrink-0 items-center gap-3 md:w-56">
                  <SafeImage src={r.productImage} alt="" width={96} ratio={1} wrapperClassName="h-12 w-12 rounded-xl" />
                  <span className="line-clamp-2 text-xs font-semibold text-fg hover:text-brand-600">{r.productName}</span>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} size="xs" />
                    <span className="sr-only">{r.rating} stars</span>
                    <Badge tone={tone[r.status]}>{r.status}</Badge>
                    {r.verified && <span className="flex items-center gap-1 text-[11px] font-semibold text-success-600"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified</span>}
                    <span className="text-xs text-fg-subtle">{r.author} · {r.location} · {formatDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-fg">{r.title}</p>
                  <p className="mt-1 break-words text-sm text-fg-muted">{r.comment}</p>
                </div>
                <div className="flex shrink-0 gap-2 md:flex-col">
                  {r.status !== 'approved' && (
                    <Button size="sm" variant="secondary" onClick={() => moderate.mutate({ id: r.id, status: 'approved' }, { onSuccess: () => toast.success('Review approved'), onError: (e) => toast.error(getErrorMessage(e)) })} leftIcon={<Check className="h-3.5 w-3.5" />}>{t.admin.approve}</Button>
                  )}
                  {r.status !== 'rejected' && (
                    <Button size="sm" variant="outline" onClick={() => moderate.mutate({ id: r.id, status: 'rejected' }, { onSuccess: () => toast.info('Review rejected'), onError: (e) => toast.error(getErrorMessage(e)) })} leftIcon={<X className="h-3.5 w-3.5" />}>{t.admin.reject}</Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => setDeleting(r.id)} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>{t.common.delete}</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination className="mt-6" page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      <ConfirmDialog
        open={!!deleting}
        title="Delete review?"
        message="This permanently removes the review."
        confirmLabel={t.common.delete}
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting, { onSuccess: () => { toast.info('Review deleted'); setDeleting(null); }, onError: (e) => toast.error(getErrorMessage(e)) })}
      />
    </div>
  );
}

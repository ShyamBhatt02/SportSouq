import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, MessageSquareText, Star, ThumbsUp } from 'lucide-react';
import type { Product } from '@/types';
import { reviewSchema, type ReviewValues } from '@/schemas';
import { useProductReviews, useSubmitReview } from '@/hooks/queries';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { getErrorMessage } from '@/services/api/client';
import type { ReviewSort } from '@/services/reviewService';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Overlay';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, initials } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Stars } from './ProductMeta';

function StarInput({ value, onChange, error }: { value: number; onChange: (v: number) => void; error?: string }) {
  const [hover, setHover] = useState(0);
  const labels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-fg">Your rating *</legend>
      <div className="flex items-center gap-1" role="radiogroup" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
            <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" aria-label={n + ' star' + (n > 1 ? 's' : '') + ' — ' + labels[n - 1]} />
            <Star className={cn('h-8 w-8 rounded transition peer-focus-visible:outline-2 peer-focus-visible:outline-brand-500', (hover || value) >= n ? 'fill-amber-400 text-amber-400' : 'text-ink-300 dark:text-ink-600')} strokeWidth={1.5} />
          </label>
        ))}
        <span className="ms-2 text-sm font-medium text-fg-muted">{labels[(hover || value) - 1] ?? ''}</span>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-danger-600" role="alert">{error}</p>}
    </fieldset>
  );
}

function ReviewForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const submit = useSubmitReview(product.id);
  const { register, handleSubmit, control, formState: { errors } } = useForm<ReviewValues>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, title: '', comment: '' } });
  const onSubmit = handleSubmit(async (v) => {
    try {
      await submit.mutateAsync({ productId: product.id, ...v });
      toast.success(t.toast.reviewSubmitted);
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  });
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Controller control={control} name="rating" render={({ field }) => <StarInput value={field.value} onChange={field.onChange} error={errors.rating?.message} />} />
      <Input label={t.reviews.titleLabel} required maxLength={80} placeholder="Sum it up in a few words" error={errors.title?.message} {...register('title')} />
      <Textarea label={t.reviews.commentLabel} required rows={5} maxLength={1000} placeholder="How did it perform? How was the fit and quality?" error={errors.comment?.message} {...register('comment')} />
      <p className="text-xs text-fg-subtle">Reviews are moderated and usually published within 24 hours.</p>
      <Button type="submit" loading={submit.isPending}>
        {t.reviews.submit}
      </Button>
    </form>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const [sort, setSort] = useState<ReviewSort>('recent');
  const [writing, setWriting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [voted, setVoted] = useState<string[]>([]);
  const { data, isLoading } = useProductReviews(product.id, sort);

  if (isLoading || !data) {
    return (
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]" aria-busy="true">
        <Skeleton className="h-56 rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { summary, reviews, canReview } = data;
  const visible = showAll ? reviews : reviews.slice(0, 4);

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
      <div className="h-fit rounded-3xl bg-surface-muted p-6 lg:sticky lg:top-28">
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-black text-fg">{summary.average.toFixed(1)}</span>
          <div className="pb-1.5">
            <Stars value={summary.average} size="md" />
            <p className="mt-1 text-xs text-fg-muted">{t.reviews.basedOn(summary.count)}</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2" aria-label="Rating breakdown">
          {([5, 4, 3, 2, 1] as const).map((n) => {
            const pct = summary.count ? (summary.breakdown[n] / summary.count) * 100 : 0;
            return (
              <li key={n} className="flex items-center gap-3 text-xs">
                <span className="w-10 shrink-0 font-semibold text-fg">{n} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <span className="block h-full rounded-full bg-amber-400" style={{ width: pct + '%' }} />
                </span>
                <span className="w-10 shrink-0 text-end tabular-nums text-fg-subtle">{Math.round(pct)}%</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6">
          {!user ? (
            <ButtonLink to={'/login?redirect=' + encodeURIComponent(location.pathname + '#reviews')} variant="secondary" fullWidth>
              {t.reviews.signInToReview}
            </ButtonLink>
          ) : canReview ? (
            <Button variant="secondary" fullWidth onClick={() => setWriting(true)}>
              {t.reviews.write}
            </Button>
          ) : (
            <p className="flex items-center justify-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm font-medium text-fg-muted">
              <BadgeCheck className="h-4 w-4 text-success-600" aria-hidden="true" /> {t.reviews.alreadyReviewed}
            </p>
          )}
        </div>
      </div>

      <div>
        {reviews.length === 0 ? (
          <EmptyState icon={MessageSquareText} title={t.reviews.noReviews} description={t.reviews.noReviewsHint} compact />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{reviews.length} written reviews</p>
              <label className="sr-only" htmlFor="review-sort">Sort reviews</label>
              <select id="review-sort" value={sort} onChange={(e) => setSort(e.target.value as ReviewSort)} className="h-9 rounded-xl border border-line-strong bg-surface px-3 text-sm font-medium text-fg">
                {(Object.keys(t.reviews.sort) as ReviewSort[]).map((k) => (
                  <option key={k} value={k}>
                    {t.reviews.sort[k]}
                  </option>
                ))}
              </select>
            </div>
            <ul className="divide-y divide-line">
              {visible.map((r) => (
                <li key={r.id} className="py-5 first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-100 text-sm font-bold text-ink-700 dark:bg-ink-800 dark:text-ink-200" aria-hidden="true">
                      {initials(r.author)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-bold text-fg">{r.author}</p>
                        <span className="text-xs text-fg-subtle">· {r.location} · {formatDate(r.createdAt)}</span>
                        {r.status === 'pending' && <Badge tone="warning">{t.reviews.pending}</Badge>}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Stars value={r.rating} size="xs" />
                        <span className="sr-only">{r.rating} out of 5 stars</span>
                        {r.verified && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-success-600">
                            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t.reviews.verified}
                          </span>
                        )}
                      </div>
                      {/* User-generated text is rendered as plain text (React escapes it) — never as HTML. */}
                      <p className="mt-2 text-sm font-semibold text-fg">{r.title}</p>
                      <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-fg-muted">{r.comment}</p>
                      <button
                        type="button"
                        disabled={voted.includes(r.id)}
                        onClick={() => setVoted((v) => [...v, r.id])}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-fg-muted transition hover:border-fg hover:text-fg disabled:border-success-500/40 disabled:text-success-600"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" /> {t.reviews.helpful(r.helpful + (voted.includes(r.id) ? 1 : 0))}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {reviews.length > 4 && (
              <Button variant="outline" className="mt-4" onClick={() => setShowAll((v) => !v)}>
                {showAll ? t.common.showLess : t.reviews.showAll(reviews.length)}
              </Button>
            )}
          </>
        )}
      </div>

      <Modal open={writing} onClose={() => setWriting(false)} title={t.reviews.write} description={product.name}>
        <ReviewForm product={product} onDone={() => setWriting(false)} />
      </Modal>
    </div>
  );
}


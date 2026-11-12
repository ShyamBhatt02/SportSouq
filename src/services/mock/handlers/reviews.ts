import type { Review, ReviewSummary } from '@/types';
import { reviewSchema } from '@/schemas';
import { sanitizeSingleLine, sanitizeText } from '@/utils/sanitize';
import { uid } from '@/utils/random';
import { getEmirate } from '@/config/site';
import { db } from '../db';
import { ApiError, currentUser, requireUser, route } from '../router';

/**
 * Derive a realistic star distribution whose mean matches the catalogue rating:
 * p(k) ∝ e^(αk); α found by bisection.
 */
export function syntheticBreakdown(rating: number, count: number): ReviewSummary['breakdown'] {
  const mean = (a: number) => {
    const w = [1, 2, 3, 4, 5].map((k) => Math.exp(a * k));
    const sum = w.reduce((s, x) => s + x, 0);
    return w.reduce((s, x, i) => s + x * (i + 1), 0) / sum;
  };
  let lo = -5;
  let hi = 5;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (mean(mid) < rating) lo = mid;
    else hi = mid;
  }
  const w = [1, 2, 3, 4, 5].map((k) => Math.exp(lo * k));
  const sum = w.reduce((s, x) => s + x, 0);
  const counts = w.map((x) => Math.round((x / sum) * count));
  return { 1: counts[0], 2: counts[1], 3: counts[2], 4: counts[3], 5: counts[4] };
}

route('GET', '/products/:id/reviews', (ctx) => {
  const user = currentUser(ctx);
  const product = db.products().find((p) => p.id === ctx.params.id);
  if (!product) throw new ApiError(404, 'Product not found.', 'not_found');
  const all = db.reviews().filter((r) => r.productId === product.id);
  const visible = all.filter((r) => r.status === 'approved' || (user && r.userId === user.id && r.status !== 'rejected'));
  const submittedApproved = all.filter((r) => r.userId && r.status === 'approved');

  const breakdown = syntheticBreakdown(product.rating, product.reviewCount);
  for (const r of submittedApproved) breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
  const count = Object.values(breakdown).reduce((s, n) => s + n, 0);
  const average = count ? Object.entries(breakdown).reduce((s, [k, n]) => s + Number(k) * n, 0) / count : 0;

  const sort = ctx.query.get('sort') ?? 'recent';
  const sorted = [...visible].sort((a, b) => {
    if (user && a.userId === user.id) return -1;
    if (user && b.userId === user.id) return 1;
    if (sort === 'helpful') return b.helpful - a.helpful;
    if (sort === 'highest') return b.rating - a.rating || b.createdAt.localeCompare(a.createdAt);
    if (sort === 'lowest') return a.rating - b.rating || b.createdAt.localeCompare(a.createdAt);
    return b.createdAt.localeCompare(a.createdAt);
  });
  const summary: ReviewSummary = { average: Math.round(average * 10) / 10, count, breakdown };
  return {
    summary,
    reviews: sorted,
    canReview: !!user && !all.some((r) => r.userId === user.id),
  };
});

route('POST', '/products/:id/reviews', (ctx) => {
  const user = requireUser(ctx);
  const product = db.products().find((p) => p.id === ctx.params.id);
  if (!product) throw new ApiError(404, 'Product not found.', 'not_found');
  if (db.reviews().some((r) => r.productId === product.id && r.userId === user.id)) {
    throw new ApiError(409, 'You’ve already reviewed this product.', 'duplicate');
  }
  const parsed = reviewSchema.safeParse(ctx.body);
  if (!parsed.success) throw new ApiError(422, parsed.error.issues[0]?.message ?? 'Please check your review.', 'validation');
  const purchased = db.orders().some((o) => o.userId === user.id && o.status !== 'cancelled' && o.items.some((i) => i.productId === product.id));
  const defaultAddress = db.addresses(user.id).find((a) => a.isDefault);
  const review: Review = {
    id: uid('r-'),
    productId: product.id,
    userId: user.id,
    author: user.firstName + ' ' + (user.lastName[0] ?? '') + '.',
    location: defaultAddress ? getEmirate(defaultAddress.emirate).name : 'UAE',
    rating: parsed.data.rating,
    title: sanitizeSingleLine(parsed.data.title, 80),
    comment: sanitizeText(parsed.data.comment, 1000),
    createdAt: new Date().toISOString(),
    verified: purchased,
    helpful: 0,
    status: 'pending',
  };
  db.addReview(review);
  return review;
});

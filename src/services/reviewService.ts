import type { Paginated, Review, ReviewInput, ReviewStatus, ReviewSummary } from '@/types';
import { api } from './api/client';

export interface ProductReviewsResponse {
  summary: ReviewSummary;
  reviews: Review[];
  canReview: boolean;
}

export interface AdminReview extends Review {
  productName: string;
  productImage: string;
  productSlug: string;
}

export interface AdminReviewsResponse extends Paginated<AdminReview> {
  counts: Record<'all' | ReviewStatus, number>;
}

export type ReviewSort = 'recent' | 'helpful' | 'highest' | 'lowest';

export const reviewService = {
  async forProduct(productId: string, sort: ReviewSort = 'recent'): Promise<ProductReviewsResponse> {
    const { data } = await api.get<ProductReviewsResponse>('/products/' + productId + '/reviews', { params: { sort } });
    return data;
  },
  async submit(input: ReviewInput): Promise<Review> {
    const { data } = await api.post<Review>('/products/' + input.productId + '/reviews', input);
    return data;
  },
  async adminList(params: { status?: string; page?: number }): Promise<AdminReviewsResponse> {
    const { data } = await api.get<AdminReviewsResponse>('/admin/reviews', { params });
    return data;
  },
  async moderate(id: string, status: ReviewStatus): Promise<void> {
    await api.patch('/admin/reviews/' + id, { status });
  },
  async remove(id: string): Promise<void> {
    await api.delete('/admin/reviews/' + id);
  },
};

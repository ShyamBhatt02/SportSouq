import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AnalyticsRange, ProductQuery } from '@/types';
import { analyticsService } from '@/services/analyticsService';
import { orderService } from '@/services/orderService';
import { customerService } from '@/services/customerService';
import { couponService } from '@/services/couponService';
import { reviewService } from '@/services/reviewService';
import { productService } from '@/services/productService';

/** Admin data hooks. Every admin query key starts with 'admin' so logout can purge them. */
export function useAnalytics(range: AnalyticsRange) {
  return useQuery({ queryKey: ['admin', 'analytics', range], queryFn: () => analyticsService.get(range), placeholderData: keepPreviousData });
}

export function useAdminProducts(q: ProductQuery) {
  return useQuery({ queryKey: ['admin', 'products', q], queryFn: () => productService.list({ ...q, includeDrafts: true }), placeholderData: keepPreviousData });
}

export function useAdminOrders(params: { status?: string; q?: string; page?: number }) {
  return useQuery({ queryKey: ['admin', 'orders', params], queryFn: () => orderService.adminList({ ...params, pageSize: 12 }), placeholderData: keepPreviousData });
}

export function useAdminCustomers(params: { q?: string; page?: number; sort?: 'recent' | 'spent' | 'orders' }) {
  return useQuery({ queryKey: ['admin', 'customers', params], queryFn: () => customerService.list({ ...params, pageSize: 15 }), placeholderData: keepPreviousData });
}

export function useAdminCoupons() {
  return useQuery({ queryKey: ['admin', 'coupons'], queryFn: () => couponService.adminList() });
}

export function useAdminReviews(params: { status?: string; page?: number }) {
  return useQuery({ queryKey: ['admin', 'reviews', params], queryFn: () => reviewService.adminList(params), placeholderData: keepPreviousData });
}

/** Mutations invalidate both admin and storefront caches so changes show everywhere. */
export function useAdminMutation<TVars, TResult>(fn: (v: TVars) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['admin'] });
      void client.invalidateQueries({ queryKey: ['products'] });
      void client.invalidateQueries({ queryKey: ['product'] });
      void client.invalidateQueries({ queryKey: ['categories'] });
      void client.invalidateQueries({ queryKey: ['coupons'] });
      void client.invalidateQueries({ queryKey: ['reviews'] });
      void client.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

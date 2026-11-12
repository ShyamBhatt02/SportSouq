import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddressInput, ProductQuery } from '@/types';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { orderService } from '@/services/orderService';
import { addressService } from '@/services/authService';
import { reviewService, type ReviewSort } from '@/services/reviewService';
import { couponService } from '@/services/couponService';
import { useAuth } from '@/context/AuthContext';

/** Centralised query keys keep cache invalidation predictable. */
export const qk = {
  products: (q: ProductQuery) => ['products', q] as const,
  product: (slug: string) => ['product', slug] as const,
  productsByIds: (ids: string[]) => ['products', 'ids', ids] as const,
  related: (id: string) => ['product', id, 'related'] as const,
  together: (id: string) => ['product', id, 'together'] as const,
  recommendations: (ids: string[]) => ['recommendations', ids] as const,
  suggest: (q: string) => ['suggest', q] as const,
  categories: ['categories'] as const,
  reviews: (id: string, sort: ReviewSort) => ['reviews', id, sort] as const,
  myOrders: (userId: string) => ['me', userId, 'orders'] as const,
  order: (id: string) => ['order', id] as const,
  addresses: (userId: string) => ['me', userId, 'addresses'] as const,
  coupons: ['coupons', 'available'] as const,
};

/* ---------------- Catalogue ---------------- */

export function useProducts(query: ProductQuery, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.products(query),
    queryFn: () => productService.list(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled: opts.enabled ?? true,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: qk.product(slug ?? ''),
    queryFn: () => productService.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 60_000,
    retry: (count, err) => count < 1 && (err as { response?: { status?: number } }).response?.status !== 404,
  });
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: qk.productsByIds(ids),
    queryFn: () => productService.getByIds(ids),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useRelatedProducts(id: string | undefined) {
  return useQuery({ queryKey: qk.related(id ?? ''), queryFn: () => productService.related(id!), enabled: !!id, staleTime: 5 * 60_000 });
}

export function useBoughtTogether(id: string | undefined) {
  return useQuery({ queryKey: qk.together(id ?? ''), queryFn: () => productService.boughtTogether(id!), enabled: !!id, staleTime: 5 * 60_000 });
}

export function useRecommendations(seedIds: string[]) {
  return useQuery({ queryKey: qk.recommendations(seedIds.slice(0, 12)), queryFn: () => productService.recommendations(seedIds.slice(0, 12)), staleTime: 5 * 60_000 });
}

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: () => categoryService.list(), staleTime: 10 * 60_000 });
}

/* ---------------- Reviews ---------------- */

export function useProductReviews(productId: string | undefined, sort: ReviewSort) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...qk.reviews(productId ?? '', sort), user?.id ?? 'guest'],
    queryFn: () => reviewService.forProduct(productId!, sort),
    enabled: !!productId,
    placeholderData: keepPreviousData,
  });
}

export function useSubmitReview(productId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: reviewService.submit,
    onSuccess: () => client.invalidateQueries({ queryKey: ['reviews', productId] }),
  });
}

/* ---------------- Orders ---------------- */

export function useOrders() {
  const { user } = useAuth();
  return useQuery({ queryKey: qk.myOrders(user?.id ?? ''), queryFn: () => orderService.mine(), enabled: !!user, staleTime: 30_000 });
}

export function useOrder(id: string | undefined, email?: string) {
  return useQuery({
    queryKey: [...qk.order(id ?? ''), email ?? ''],
    queryFn: () => orderService.get(id!, email),
    enabled: !!id,
    retry: false,
  });
}

export function useCancelOrder() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.cancel(id),
    onSuccess: (order) => {
      client.invalidateQueries({ queryKey: ['me'] });
      client.invalidateQueries({ queryKey: ['order', order.id] });
      client.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/* ---------------- Addresses ---------------- */

export function useAddresses() {
  const { user } = useAuth();
  return useQuery({ queryKey: qk.addresses(user?.id ?? ''), queryFn: () => addressService.list(), enabled: !!user });
}

export function useAddressMutations() {
  const client = useQueryClient();
  const { user } = useAuth();
  const invalidate = () => client.invalidateQueries({ queryKey: qk.addresses(user?.id ?? '') });
  return {
    create: useMutation({ mutationFn: (input: AddressInput) => addressService.create(input), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: AddressInput }) => addressService.update(id, input), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => addressService.remove(id), onSuccess: invalidate }),
    setDefault: useMutation({ mutationFn: (id: string) => addressService.setDefault(id), onSuccess: invalidate }),
  };
}

/* ---------------- Coupons ---------------- */

export function useCoupons() {
  return useQuery({ queryKey: qk.coupons, queryFn: () => couponService.available(), staleTime: 5 * 60_000 });
}

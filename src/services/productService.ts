import type { Product, ProductListResponse, ProductQuery } from '@/types';
import type { ProductFormValues } from '@/schemas';
import { apiParamsFromQuery } from '@/utils/productQuery';
import { api } from './api/client';

export interface SearchSuggestion {
  type: 'sport' | 'brand' | 'category';
  label: string;
  value: string;
  parent?: string;
}

export interface SuggestResponse {
  products: Product[];
  suggestions: SearchSuggestion[];
  total: number;
}

export const productService = {
  async list(query: ProductQuery): Promise<ProductListResponse> {
    const { data } = await api.get<ProductListResponse>('/products', { params: apiParamsFromQuery(query) });
    return data;
  },
  async getBySlug(slug: string): Promise<Product> {
    const { data } = await api.get<Product>('/products/' + encodeURIComponent(slug));
    return data;
  },
  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];
    const { data } = await api.get<ProductListResponse>('/products', { params: apiParamsFromQuery({ ids, pageSize: 100 }) });
    const order = new Map(ids.map((id, i) => [id, i]));
    return data.items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  },
  async suggest(q: string): Promise<SuggestResponse> {
    const { data } = await api.get<SuggestResponse>('/products/suggest', { params: { q } });
    return data;
  },
  async related(id: string): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products/' + id + '/related');
    return data;
  },
  async boughtTogether(id: string): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products/' + id + '/bought-together');
    return data;
  },
  async recommendations(seedIds: string[]): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/recommendations', { params: { ids: seedIds.join(',') } });
    return data;
  },

  /* ---- Admin ---- */
  async create(values: ProductFormValues): Promise<Product> {
    const { data } = await api.post<Product>('/admin/products', values);
    return data;
  },
  async update(id: string, values: ProductFormValues): Promise<Product> {
    const { data } = await api.put<Product>('/admin/products/' + id, values);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete('/admin/products/' + id);
  },
  async setStatus(id: string, status: Product['status']): Promise<Product> {
    const { data } = await api.patch<Product>('/admin/products/' + id + '/status', { status });
    return data;
  },
  async updateInventory(id: string, patch: { lowStockThreshold?: number; variantStock?: Record<string, number> }): Promise<Product> {
    const { data } = await api.patch<Product>('/admin/inventory/' + id, patch);
    return data;
  },
};

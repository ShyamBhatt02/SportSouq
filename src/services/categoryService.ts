import type { Category } from '@/types';
import { api } from './api/client';

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/catalog/categories');
    return data;
  },
  async saveAll(categories: Category[]): Promise<Category[]> {
    const { data } = await api.put<Category[]>('/admin/categories', { categories });
    return data;
  },
};

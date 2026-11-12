import type { Customer, Paginated } from '@/types';
import { api } from './api/client';

export const customerService = {
  async list(params: { q?: string; page?: number; sort?: 'recent' | 'spent' | 'orders'; pageSize?: number }): Promise<Paginated<Customer>> {
    const { data } = await api.get<Paginated<Customer>>('/admin/customers', { params });
    return data;
  },
};

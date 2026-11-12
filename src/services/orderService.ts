import type { CreateOrderInput, Order, OrderStatus, Paginated } from '@/types';
import type { ContactValues } from '@/schemas';
import { api } from './api/client';

export interface AdminOrdersResponse extends Paginated<Order> {
  counts: Record<OrderStatus, number>;
}

export type CreateOrderPayload = Omit<CreateOrderInput, 'items'> & {
  items: { productId: string; variantId: string; quantity: number }[];
};

export const orderService = {
  async create(input: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<Order>('/orders', input);
    return data;
  },
  async mine(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },
  async get(id: string, email?: string): Promise<Order> {
    const { data } = await api.get<Order>('/orders/' + encodeURIComponent(id), { params: email ? { email } : undefined });
    return data;
  },
  async cancel(id: string): Promise<Order> {
    const { data } = await api.post<Order>('/orders/' + id + '/cancel');
    return data;
  },

  /* ---- Admin ---- */
  async adminList(params: { status?: string; q?: string; page?: number; pageSize?: number }): Promise<AdminOrdersResponse> {
    const { data } = await api.get<AdminOrdersResponse>('/admin/orders', { params });
    return data;
  },
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await api.patch<Order>('/admin/orders/' + id + '/status', { status });
    return data;
  },
};

export const miscService = {
  async subscribe(email: string): Promise<{ ok: boolean; alreadySubscribed: boolean; code: string }> {
    const { data } = await api.post<{ ok: boolean; alreadySubscribed: boolean; code: string }>('/newsletter', { email });
    return data;
  },
  async contact(values: ContactValues): Promise<{ ok: boolean; ticket: string }> {
    const { data } = await api.post<{ ok: boolean; ticket: string }>('/contact', values);
    return data;
  },
  async resetDemo(): Promise<void> {
    await api.post('/admin/reset');
  },
};

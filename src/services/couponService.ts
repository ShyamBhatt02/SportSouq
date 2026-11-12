import type { CartItem, Coupon, CouponValidation } from '@/types';
import type { CouponFormValues } from '@/schemas';
import { api } from './api/client';

export type PublicCoupon = Pick<Coupon, 'code' | 'description' | 'minOrder' | 'type' | 'value' | 'firstOrderOnly' | 'sports' | 'expiresAt'>;

export const couponService = {
  async validate(code: string, items: CartItem[], email?: string): Promise<CouponValidation> {
    const { data } = await api.post<CouponValidation>('/coupons/validate', {
      code,
      email,
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    });
    return data;
  },
  async available(): Promise<PublicCoupon[]> {
    const { data } = await api.get<PublicCoupon[]>('/coupons/available');
    return data;
  },
  /* ---- Admin ---- */
  async adminList(): Promise<Coupon[]> {
    const { data } = await api.get<Coupon[]>('/admin/coupons');
    return data;
  },
  async create(values: CouponFormValues): Promise<Coupon> {
    const { data } = await api.post<Coupon>('/admin/coupons', values);
    return data;
  },
  async update(code: string, values: CouponFormValues): Promise<Coupon> {
    const { data } = await api.put<Coupon>('/admin/coupons/' + encodeURIComponent(code), values);
    return data;
  },
  async toggle(code: string): Promise<Coupon> {
    const { data } = await api.patch<Coupon>('/admin/coupons/' + encodeURIComponent(code) + '/toggle');
    return data;
  },
  async remove(code: string): Promise<void> {
    await api.delete('/admin/coupons/' + encodeURIComponent(code));
  },
};

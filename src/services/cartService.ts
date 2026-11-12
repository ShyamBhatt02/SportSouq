import type { CartItem, Product, ProductVariant } from '@/types';
import { STORAGE_KEYS } from '@/config/site';
import { readStorage, writeStorage, isArray } from '@/utils/storage';
import { productService } from './productService';

const isCartItem = (v: unknown): v is CartItem => {
  const o = v as CartItem;
  return !!o && typeof o.key === 'string' && typeof o.productId === 'string' && typeof o.variantId === 'string' && Number.isFinite(o.quantity) && Number.isFinite(o.price);
};

function guardCart(v: unknown): v is CartItem[] {
  return isArray(v) && v.every(isCartItem);
}

export function cartKey(productId: string, variantId: string): string {
  return productId + '::' + variantId;
}

export function toCartItem(product: Product, variant: ProductVariant, quantity: number): CartItem {
  return {
    key: cartKey(product.id, variant.id),
    productId: product.id,
    variantId: variant.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: variant.image,
    sku: variant.sku,
    sport: product.sport,
    category: product.category,
    attributes: variant.attributes,
    price: variant.price,
    originalPrice: variant.originalPrice,
    quantity,
    maxStock: variant.stock,
  };
}

/**
 * Cart persistence + server reconciliation. The cart lives client-side
 * (localStorage) like most guest carts; `refresh` re-syncs price and stock
 * with the catalogue so stale prices can never reach checkout.
 */
export const cartService = {
  load(): CartItem[] {
    return readStorage(STORAGE_KEYS.cart, [], guardCart);
  },
  save(items: CartItem[]): void {
    writeStorage(STORAGE_KEYS.cart, items);
  },
  loadSaved(): CartItem[] {
    return readStorage(STORAGE_KEYS.savedForLater, [], guardCart);
  },
  saveSaved(items: CartItem[]): void {
    writeStorage(STORAGE_KEYS.savedForLater, items);
  },
  async refresh(items: CartItem[]): Promise<{ items: CartItem[]; changed: string[] }> {
    if (!items.length) return { items, changed: [] };
    const products = await productService.getByIds(Array.from(new Set(items.map((i) => i.productId))));
    const changed: string[] = [];
    const next: CartItem[] = [];
    for (const item of items) {
      const p = products.find((x) => x.id === item.productId);
      const v = p?.variants.find((x) => x.id === item.variantId);
      if (!p || !v || v.stock <= 0) {
        changed.push(item.name + ' is no longer available and was removed.');
        continue;
      }
      const quantity = Math.min(item.quantity, v.stock);
      if (quantity !== item.quantity) changed.push('Only ' + v.stock + ' left of ' + item.name + ' — quantity updated.');
      if (v.price !== item.price) changed.push('The price of ' + item.name + ' has changed.');
      next.push({ ...toCartItem(p, v, quantity) });
    }
    return { items: next, changed };
  },
};

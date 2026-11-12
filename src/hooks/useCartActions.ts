import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { useUI } from '@/context/UIContext';
import { useI18n } from '@/i18n/I18nProvider';
import { imageUrl } from '@/data/images';

/** Picks the default purchasable variant (first in stock). */
export function defaultVariant(product: Product): ProductVariant | undefined {
  return product.variants.find((v) => v.stock > 0) ?? product.variants[0];
}

/** Cart/wishlist actions with consistent toast feedback across the app. */
export function useCartActions() {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const ui = useUI();
  const navigate = useNavigate();
  const { t } = useI18n();

  const addToCart = useCallback(
    (product: Product, variant: ProductVariant | undefined = defaultVariant(product), quantity = 1, opts: { silent?: boolean } = {}) => {
      if (!variant) return false;
      const result = cart.add(product, variant, quantity);
      if (!result.ok) {
        toast.error(result.reason === 'out-of-stock' ? t.product.outOfStock : t.toast.stockLimit(result.max), { description: product.name });
        return false;
      }
      if (!opts.silent) {
        toast.success(t.toast.addedToCart, {
          description: product.name + (result.capped ? ' · ' + t.toast.stockLimit(result.quantity) : ''),
          image: imageUrl(variant.image, 96, 96),
          action: { label: t.cart.viewCart, onClick: ui.openCart },
        });
      }
      return true;
    },
    [cart, toast, t, ui.openCart],
  );

  const buyNow = useCallback(
    (product: Product, variant: ProductVariant | undefined, quantity = 1) => {
      if (addToCart(product, variant, quantity, { silent: true })) navigate('/checkout');
    },
    [addToCart, navigate],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const added = wishlist.toggle(product.id);
      if (added) toast.success(t.toast.addedToWishlist, { description: product.name, image: imageUrl(product.thumbnail, 96, 96) });
      else toast.info(t.toast.removedFromWishlist, { description: product.name, action: { label: 'Undo', onClick: () => wishlist.add(product.id) } });
      return added;
    },
    [wishlist, toast, t],
  );

  const removeFromCart = useCallback(
    (key: string) => {
      const item = cart.remove(key);
      if (item) toast.info(t.toast.removedFromCart, { description: item.name, action: { label: 'Undo', onClick: () => cart.restore(item) } });
    },
    [cart, toast, t],
  );

  return { addToCart, buyNow, toggleWishlist, removeFromCart, isWishlisted: wishlist.has };
}

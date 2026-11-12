/* Public hook surface (names match the project spec). */
export { useAuth } from '@/context/AuthContext';
export { useCart } from '@/context/CartContext';
export { useWishlist } from '@/context/WishlistContext';
export { useCheckout } from '@/context/CheckoutContext';
export { useProducts, useProduct, useOrders, useCoupons, useOrder, useAddresses, useCategories } from './queries';
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useRecentlyViewed, useRecentSearches } from './useRecentlyViewed';
export { useCountdown } from './useCountdown';
export { useSeo } from './useSeo';
export { useCartActions } from './useCartActions';

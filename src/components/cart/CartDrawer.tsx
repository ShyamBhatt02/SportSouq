import { AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useCartActions } from '@/hooks/useCartActions';
import { useI18n } from '@/i18n/I18nProvider';
import { Drawer } from '@/components/ui/Overlay';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { FreeDeliveryProgress } from '@/components/common/DeliveryPerks';
import { formatPrice } from '@/utils/format';
import { CartLine } from './CartLine';

/** Mini-cart drawer (Framer Motion slide-in). */
export function CartDrawer() {
  const { t } = useI18n();
  const { cartOpen, closeCart } = useUI();
  const cart = useCart();
  const { removeFromCart } = useCartActions();

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      title={
        <>
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {t.cart.title}
          <span className="text-sm font-medium text-fg-subtle">({t.common.items(cart.count)})</span>
        </>
      }
      footer={
        cart.items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg-muted">{t.cart.subtotal}</span>
              <span className="font-display text-lg font-extrabold text-fg">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="text-xs text-fg-subtle">VAT and delivery calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2.5">
              <ButtonLink to="/cart" variant="outline" onClick={closeCart}>
                {t.cart.viewCart}
              </ButtonLink>
              <ButtonLink to="/checkout" onClick={closeCart} rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}>
                {t.cart.checkout}
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      {cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t.cart.empty}
          description={t.cart.emptyHint}
          compact
          action={
            <ButtonLink to="/shop" onClick={closeCart}>
              {t.common.shopNow}
            </ButtonLink>
          }
        />
      ) : (
        <div className="px-5 pt-4">
          <FreeDeliveryProgress subtotal={cart.subtotal} />
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <CartLine key={item.key} item={item} compact onNavigate={closeCart} onQuantity={(q) => cart.setQuantity(item.key, q)} onRemove={() => removeFromCart(item.key)} />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </Drawer>
  );
}

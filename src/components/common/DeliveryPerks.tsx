import { Banknote, BadgeCheck, RotateCcw, ShieldCheck, Truck, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format';
import { FREE_DELIVERY_THRESHOLD } from '@/config/site';

export type PerkKey = 'free' | 'sameDay' | 'cod' | 'returns' | 'secure' | 'authentic';

const ICONS: Record<PerkKey, LucideIcon> = { free: Truck, sameDay: Zap, cod: Banknote, returns: RotateCcw, secure: ShieldCheck, authentic: BadgeCheck };

/** Reusable UAE delivery/trust messaging used in header, PDP, cart and footer. */
export function DeliveryPerks({
  perks = ['free', 'sameDay', 'cod', 'returns'],
  layout = 'grid',
  className,
  tone = 'default',
}: {
  perks?: PerkKey[];
  layout?: 'grid' | 'list' | 'row';
  className?: string;
  tone?: 'default' | 'inverted';
}) {
  const { t } = useI18n();
  const labels: Record<PerkKey, string> = {
    free: t.delivery.freeOver,
    sameDay: t.delivery.sameDayDubai,
    cod: t.delivery.cod,
    returns: t.delivery.returns,
    secure: t.delivery.secure,
    authentic: t.delivery.authentic,
  };
  return (
    <ul
      className={cn(
        layout === 'grid' && 'grid grid-cols-1 gap-3 sm:grid-cols-2',
        layout === 'list' && 'flex flex-col gap-2.5',
        layout === 'row' && 'flex flex-wrap items-center gap-x-6 gap-y-2',
        className,
      )}
    >
      {perks.map((key) => {
        const Icon = ICONS[key];
        return (
          <li key={key} className={cn('flex items-center gap-2.5 text-sm', tone === 'inverted' ? 'text-ink-200' : 'text-fg-muted')}>
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tone === 'inverted' ? 'bg-white/10 text-volt-400' : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400')}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-medium">{labels[key]}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Progress bar toward the free-delivery threshold. */
export function FreeDeliveryProgress({ subtotal, className }: { subtotal: number; className?: string }) {
  const { t } = useI18n();
  const left = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  return (
    <div className={cn('rounded-2xl bg-surface-muted p-3.5', className)}>
      <p className="flex items-center gap-2 text-sm font-medium text-fg">
        <Truck className={cn('h-4 w-4', left === 0 ? 'text-success-600' : 'text-brand-600')} aria-hidden="true" />
        {left === 0 ? t.delivery.freeDeliveryUnlocked : t.delivery.freeDeliveryProgress(formatPrice(left))}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
        <div className={cn('h-full rounded-full transition-[width] duration-500', left === 0 ? 'bg-success-500' : 'bg-brand-500')} style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}

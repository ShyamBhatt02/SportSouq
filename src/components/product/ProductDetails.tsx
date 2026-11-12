import { CalendarClock, MapPin, PackageCheck, RotateCcw, Truck, Zap } from 'lucide-react';
import type { Product, ProductSpec } from '@/types';
import { EMIRATES, getEmirate } from '@/config/site';
import { usePreferences } from '@/context/PreferencesContext';
import { useI18n } from '@/i18n/I18nProvider';
import { getDeliveryQuotes, getProductDeliveryMessage, isBulky } from '@/utils/delivery';
import { formatPrice } from '@/utils/format';
import { SPORT_MAP } from '@/data/sports';
import { cn } from '@/utils/cn';
import type { EmirateCode } from '@/types';

/* ---------------- ProductSpecifications ---------------- */

/** Sport-aware spec table: highlights the attributes that matter for the sport first. */
const PRIORITY: Record<string, string[]> = {
  football: ['Surface', 'Boot type', 'Upper material'],
  cricket: ['Bat material', 'Bat size', 'Weight'],
  tennis: ['Head size', 'Weight', 'Balance'],
  running: ['Cushioning', 'Running type', 'Drop'],
  cycling: ['Frame type', 'Wheel size'],
  fitness: ['Material', 'Weight', 'Resistance level'],
};

export function ProductSpecifications({ product, extra = [] }: { product: Product; extra?: ProductSpec[] }) {
  const priority = PRIORITY[product.sport] ?? [];
  const specs = [...product.specs].sort((a, b) => {
    const ia = priority.indexOf(a.label);
    const ib = priority.indexOf(b.label);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const rows = [...specs, { label: 'Sport', value: SPORT_MAP[product.sport].name }, { label: 'Brand', value: product.brand }, ...extra];
  return (
    <dl className="overflow-hidden rounded-2xl border border-line">
      {rows.map((s, i) => (
        <div key={s.label + i} className={cn('grid grid-cols-[40%_1fr] gap-4 px-4 py-3 text-sm sm:grid-cols-[35%_1fr]', i % 2 === 0 ? 'bg-surface-muted/70' : 'bg-surface')}>
          <dt className="flex items-center gap-2 font-medium text-fg-muted">
            {s.label}
            {priority.includes(s.label) && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-label="Key spec" />}
          </dt>
          <dd className="font-semibold text-fg">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- ProductDeliveryInfo ---------------- */

export function EmirateSelect({ value, onChange, id = 'emirate-select', className }: { value: EmirateCode; onChange: (e: EmirateCode) => void; id?: string; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {t.delivery.selectEmirate}
      </label>
      <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600" aria-hidden="true" />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as EmirateCode)}
        className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-line-strong bg-surface ps-9 pe-8 text-sm font-semibold text-fg focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
      >
        {EMIRATES.map((e) => (
          <option key={e.code} value={e.code}>
            {e.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-fg-subtle" aria-hidden="true">
        ▾
      </span>
    </div>
  );
}

export function ProductDeliveryInfo({ product, price }: { product: Product; price: number }) {
  const { t } = useI18n();
  const { preferences, setEmirate } = usePreferences();
  const emirate = preferences.emirate;
  const msg = getProductDeliveryMessage(product, emirate);
  const quotes = getDeliveryQuotes({ emirate, subtotal: price, hasBulky: isBulky(product) });

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-fg">{t.delivery.deliverTo}</p>
        <EmirateSelect value={emirate} onChange={setEmirate} className="sm:w-56" />
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3" aria-live="polite">
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', msg.available ? 'bg-success-50 text-success-600 dark:bg-success-600/15' : 'bg-danger-50 text-danger-600 dark:bg-danger-500/15')}>
            {msg.headline.startsWith('Get it today') ? <Zap className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-bold text-fg">{msg.headline}</p>
            <p className="text-sm text-fg-muted">{msg.detail}</p>
          </div>
        </div>
        {msg.available && (
          <ul className="mt-4 space-y-2 text-sm">
            {quotes.map((q) => (
              <li key={q.method.id} className={cn('flex items-center justify-between gap-3', !q.available && 'text-fg-subtle')}>
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="font-medium text-fg">{q.method.name}</span>
                    <span className="block text-xs text-fg-subtle">{q.available ? q.label : q.reason}</span>
                  </span>
                </span>
                <span className="shrink-0 font-semibold">{!q.available ? '—' : q.fee === 0 ? <span className="text-success-600">Free</span> : formatPrice(q.fee)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-b-2xl border-t border-line bg-line sm:grid-cols-2">
        <p className="flex items-center gap-2 bg-surface px-4 py-3 text-xs font-medium text-fg-muted">
          <PackageCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> {t.delivery.cod}
        </p>
        <p className="flex items-center gap-2 bg-surface px-4 py-3 text-xs font-medium text-fg-muted">
          <RotateCcw className="h-4 w-4 text-brand-600" aria-hidden="true" /> {t.delivery.returns}
        </p>
      </div>
      <p className="sr-only">Delivery estimates shown for {getEmirate(emirate).name}.</p>
    </div>
  );
}

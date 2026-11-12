import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { Product, ProductVariant, VariantAxis } from '@/types';
import { useI18n } from '@/i18n/I18nProvider';
import { titleCase } from '@/utils/format';
import { cn } from '@/utils/cn';

export type Selection = Partial<Record<VariantAxis, string>>;

export function axisOptions(product: Product, axis: VariantAxis): string[] {
  switch (axis) {
    case 'color':
      return product.colors.map((c) => c.name);
    case 'size':
      return product.sizes;
    case 'gender':
      return product.genders;
    case 'config':
      return product.configurations;
  }
}

export function matchesSelection(v: ProductVariant, sel: Selection, skip?: VariantAxis) {
  return (Object.keys(sel) as VariantAxis[]).every((axis) => axis === skip || !sel[axis] || v.attributes[axis] === sel[axis]);
}

/**
 * Variant state machine: preselects in-stock colour/fit/option but leaves size
 * for the shopper (like real stores), and resolves the exact variant once
 * every axis is chosen — updating price, stock, SKU and image.
 */
export function useVariantSelection(product: Product | undefined) {
  const initial = useMemo<Selection>(() => {
    if (!product) return {};
    const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    const sel: Selection = {};
    for (const axis of product.variantAxes) if (axis !== 'size') sel[axis] = firstInStock?.attributes[axis];
    return sel;
  }, [product]);

  const [state, setState] = useState<{ productId?: string; selection: Selection }>({ productId: product?.id, selection: initial });
  // Reset when the product changes (render-phase sync instead of an effect).
  if (product?.id !== state.productId) setState({ productId: product?.id, selection: initial });
  const selection = product?.id === state.productId ? state.selection : initial;

  const variant = useMemo(() => {
    if (!product) return undefined;
    if (!product.variantAxes.length) return product.variants[0];
    if (!product.variantAxes.every((a) => selection[a])) return undefined;
    return product.variants.find((v) => matchesSelection(v, selection));
  }, [product, selection]);

  /** Best-guess variant for display (image/price) before the selection is complete. */
  const preview = useMemo(() => {
    if (!product) return undefined;
    return variant ?? product.variants.find((v) => matchesSelection(v, selection) && v.stock > 0) ?? product.variants.find((v) => matchesSelection(v, selection)) ?? product.variants[0];
  }, [product, variant, selection]);

  const isAvailable = (axis: VariantAxis, value: string) =>
    !!product?.variants.some((v) => v.attributes[axis] === value && matchesSelection(v, selection, axis) && v.stock > 0);

  const select = (axis: VariantAxis, value: string) => setState((s) => ({ productId: s.productId, selection: { ...s.selection, [axis]: value } }));
  const missing = product?.variantAxes.filter((a) => !selection[a]) ?? [];

  return { selection, variant, preview, select, isAvailable, missing };
}

interface VariantSelectorProps {
  product: Product;
  selection: Selection;
  onSelect: (axis: VariantAxis, value: string) => void;
  isAvailable: (axis: VariantAxis, value: string) => boolean;
  showError?: boolean;
  compact?: boolean;
}

export function VariantSelector({ product, selection, onSelect, isAvailable, showError, compact }: VariantSelectorProps) {
  const { t } = useI18n();
  const axisLabel: Record<VariantAxis, string> = { color: t.product.color, size: t.product.size, gender: t.product.gender, config: t.product.config };

  return (
    <div className={cn('flex flex-col', compact ? 'gap-4' : 'gap-5')}>
      {product.variantAxes.map((axis) => {
        const options = axisOptions(product, axis);
        const value = selection[axis];
        const err = showError && !value;
        return (
          <fieldset key={axis} aria-invalid={err || undefined}>
            <legend className="mb-2.5 flex w-full items-center justify-between text-sm">
              <span className="font-semibold text-fg">
                {axisLabel[axis]}
                {value && <span className="ms-1.5 font-normal text-fg-muted">— {axis === 'gender' ? titleCase(value) : value}</span>}
              </span>
              {err && (
                <span role="alert" className="text-xs font-semibold text-danger-600">
                  {t.product.selectOption(axisLabel[axis].toLowerCase())}
                </span>
              )}
            </legend>
            {axis === 'color' ? (
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const available = isAvailable('color', c.name);
                  const selected = value === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => onSelect('color', c.name)}
                      aria-pressed={selected}
                      aria-label={c.name + (available ? '' : ' (sold out)')}
                      title={c.name}
                      className={cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition',
                        selected ? 'ring-2 ring-fg' : 'ring-1 ring-line-strong hover:ring-ink-400',
                        !available && 'opacity-40',
                      )}
                    >
                      <span className="h-8 w-8 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      {selected && <Check className="absolute h-4 w-4 text-white mix-blend-difference" strokeWidth={3} aria-hidden="true" />}
                      {!available && <span className="absolute h-px w-9 rotate-45 bg-fg" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={cn('flex flex-wrap gap-2', err && 'rounded-xl ring-2 ring-danger-500/40 ring-offset-4 ring-offset-surface')}>
                {options.map((opt) => {
                  const available = isAvailable(axis, opt);
                  const selected = value === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onSelect(axis, opt)}
                      disabled={!available && !selected}
                      aria-pressed={selected}
                      aria-label={opt + (available ? '' : ' (sold out)')}
                      className={cn(
                        'relative h-10 min-w-12 rounded-xl border px-3.5 text-sm font-semibold transition',
                        selected ? 'border-fg bg-fg text-canvas' : 'border-line-strong bg-surface text-fg hover:border-fg',
                        !available && 'cursor-not-allowed border-dashed text-fg-subtle line-through decoration-1 hover:border-line-strong',
                      )}
                    >
                      {axis === 'gender' ? titleCase(opt) : opt}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

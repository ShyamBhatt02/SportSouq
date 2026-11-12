import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}

export function QuantityStepper({ value, min = 1, max, onChange, size = 'md', label = 'Quantity', className }: QuantityStepperProps) {
  const h = size === 'sm' ? 'h-9' : 'h-11';
  const w = size === 'sm' ? 'w-8' : 'w-10';
  return (
    <div role="group" aria-label={label} className={cn('inline-flex items-center rounded-xl border border-line-strong bg-surface', h, className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn('flex h-full items-center justify-center rounded-s-xl text-fg-muted transition hover:bg-surface-muted hover:text-fg disabled:opacity-35', w)}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <output aria-live="polite" className={cn('min-w-8 text-center text-sm font-bold tabular-nums text-fg', size === 'md' && 'min-w-10')}>
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn('flex h-full items-center justify-center rounded-e-xl text-fg-muted transition hover:bg-surface-muted hover:text-fg disabled:opacity-35', w)}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

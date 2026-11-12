import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}

/** Accessible checkbox built on a native input (keyboard + screen-reader friendly). */
export const Checkbox = forwardRef<HTMLInputElement, ChoiceProps>(function Checkbox({ label, description, trailing, className, id, disabled, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn('group flex cursor-pointer items-start gap-3 text-sm', disabled && 'cursor-not-allowed opacity-50', className)}>
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input ref={ref} id={inputId} type="checkbox" disabled={disabled} className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-line-strong bg-surface transition-colors checked:border-brand-600 checked:bg-brand-600 group-hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed" {...rest} />
        <Check className="pointer-events-none relative h-3.5 w-3.5 scale-50 text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-fg">{label}</span>
        {description && <span className="text-xs text-fg-subtle">{description}</span>}
      </span>
      {trailing && <span className="shrink-0 text-xs text-fg-subtle">{trailing}</span>}
    </label>
  );
});

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>(function Radio({ label, description, trailing, className, id, disabled, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn('group flex cursor-pointer items-start gap-3 text-sm', disabled && 'cursor-not-allowed opacity-50', className)}>
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input ref={ref} id={inputId} type="radio" disabled={disabled} className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full border border-line-strong bg-surface transition-colors checked:border-brand-600 group-hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed" {...rest} />
        <span className="pointer-events-none relative h-2.5 w-2.5 scale-0 rounded-full bg-brand-600 transition-transform peer-checked:scale-100" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-fg">{label}</span>
        {description && <span className="text-xs text-fg-subtle">{description}</span>}
      </span>
      {trailing && <span className="shrink-0 text-xs text-fg-subtle">{trailing}</span>}
    </label>
  );
});

/** Large selectable card (delivery/payment methods). Wraps a native radio. */
export const RadioCard = forwardRef<HTMLInputElement, ChoiceProps & { icon?: ReactNode }>(function RadioCard(
  { label, description, trailing, icon, className, id, disabled, children, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  // Only the header row is the <label>, so nested content (e.g. card fields)
  // never becomes part of the radio's accessible name.
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-2xl border border-line-strong bg-surface p-4 transition-all hover:border-ink-400 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/60 has-[:checked]:shadow-[0_0_0_1px_var(--color-brand-600)] has-[input[type=radio]:focus-visible]:outline-2 has-[input[type=radio]:focus-visible]:outline-offset-2 has-[input[type=radio]:focus-visible]:outline-brand-500 dark:has-[:checked]:bg-brand-950/30',
        disabled && 'opacity-55 hover:border-line-strong',
        className,
      )}
    >
      <label htmlFor={inputId} className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed')}>
        <input ref={ref} id={inputId} type="radio" disabled={disabled} className="peer sr-only" {...rest} />
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line-strong peer-checked:border-brand-600 peer-checked:[&>span]:scale-100">
          <span className="h-2.5 w-2.5 scale-0 rounded-full bg-brand-600 transition-transform" />
        </span>
        {icon && <span className="shrink-0 text-fg-muted">{icon}</span>}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-fg">{label}</span>
          {description && <span className="text-xs text-fg-subtle">{description}</span>}
        </span>
        {trailing && <span className="shrink-0 text-sm font-semibold text-fg">{trailing}</span>}
      </label>
      {children}
    </div>
  );
});

export function Switch({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {description && <p className="text-xs text-fg-subtle">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50', checked ? 'bg-brand-600' : 'bg-ink-300 dark:bg-ink-700')}
      >
        <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

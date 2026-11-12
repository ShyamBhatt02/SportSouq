import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

const control =
  'w-full rounded-[var(--radius-field)] border bg-surface text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-subtle';
const ok = 'border-line-strong hover:border-ink-400 focus:border-brand-500 focus:ring-brand-500/15';
const bad = 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15';

interface FieldShellProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, hint, error, required, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
          {required && (
            <span className="ms-0.5 text-brand-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={id + '-error'} role="alert" className="text-xs font-medium text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={id + '-hint'} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  wrapperClassName?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

const inputSizes = { sm: 'h-9 text-sm px-3', md: 'h-11 text-sm px-3.5', lg: 'h-12 text-base px-4' };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, wrapperClassName, className, id, required, inputSize = 'md', type, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        {leftIcon && <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-fg-subtle">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && reveal ? 'text' : type}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? inputId + '-error' : hint ? inputId + '-hint' : undefined}
          className={cn(control, inputSizes[inputSize], error ? bad : ok, leftIcon && 'ps-10', (rightSlot || isPassword) && 'pe-11', className)}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-[var(--radius-field)] text-fg-subtle hover:text-fg"
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
          >
            {reveal ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        ) : (
          rightSlot && <span className="absolute inset-y-0 end-0 flex items-center pe-2">{rightSlot}</span>
        )}
      </div>
    </FieldShell>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, wrapperClassName, className, id, required, rows = 4, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? inputId + '-error' : hint ? inputId + '-hint' : undefined}
        className={cn(control, 'px-3.5 py-3 text-sm leading-relaxed', error ? bad : ok, className)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
  selectSize?: 'sm' | 'md';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, wrapperClassName, className, id, required, selectSize = 'md', ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? inputId + '-error' : hint ? inputId + '-hint' : undefined}
          className={cn(control, 'appearance-none pe-10 ps-3.5', selectSize === 'sm' ? 'h-9 text-sm' : 'h-11 text-sm', error ? bad : ok, className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
      </div>
    </FieldShell>
  );
});

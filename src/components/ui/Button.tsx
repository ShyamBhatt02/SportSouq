import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle' | 'link';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none transition-[background-color,color,border-color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_6px_16px_-6px_rgb(212_59_12/0.55)]',
  secondary: 'bg-ink-950 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100',
  outline: 'border border-line-strong bg-surface text-fg hover:border-fg hover:bg-surface-muted',
  ghost: 'text-fg hover:bg-surface-muted',
  subtle: 'bg-surface-muted text-fg hover:bg-surface-sunken',
  danger: 'bg-danger-600 text-white hover:bg-danger-500',
  link: 'text-brand-600 underline-offset-4 hover:underline dark:text-brand-400 px-0 h-auto',
};

const sizes: Record<Size, string> = {
  xs: 'h-8 rounded-lg px-3 text-xs',
  sm: 'h-9 rounded-xl px-3.5 text-sm',
  md: 'h-11 rounded-xl px-5 text-sm',
  lg: 'h-13 rounded-2xl px-7 text-base',
  icon: 'h-11 w-11 rounded-xl',
  'icon-sm': 'h-9 w-9 rounded-lg',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function buttonClasses({ variant = 'primary', size = 'md', fullWidth }: Pick<CommonProps, 'variant' | 'size' | 'fullWidth'> = {}) {
  return cn(base, variants[variant], variant !== 'link' && sizes[size], fullWidth && 'w-full');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export type ButtonLinkProps = CommonProps & LinkProps;

export function ButtonLink({ variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}

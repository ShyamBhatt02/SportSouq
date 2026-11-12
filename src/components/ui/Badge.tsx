import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'volt';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-fg-muted',
  brand: 'bg-brand-600 text-white',
  success: 'bg-success-50 text-success-600 dark:bg-success-600/15 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/15 dark:text-danger-500',
  info: 'bg-info-50 text-info-600 dark:bg-info-600/15 dark:text-sky-400',
  dark: 'bg-ink-950 text-white dark:bg-white dark:text-ink-950',
  volt: 'bg-volt-400 text-ink-950',
};

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: BadgeTone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

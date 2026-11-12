import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-3 px-4 py-10' : 'gap-4 px-6 py-16 sm:py-24', className)}
    >
      <span className={cn('relative flex items-center justify-center rounded-full bg-surface-muted text-fg-subtle', compact ? 'h-14 w-14' : 'h-20 w-20')}>
        <span className="absolute inset-0 rounded-full ring-8 ring-surface-muted/50" aria-hidden="true" />
        <Icon className={compact ? 'h-6 w-6' : 'h-9 w-9'} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="max-w-md">
        <h2 className={cn('font-bold text-fg', compact ? 'text-base' : 'text-xl')}>{title}</h2>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </motion.div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({ title = 'Something went wrong', description = 'Please try again in a moment.', onRetry, action, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center gap-4 px-6 py-16 text-center', className)}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-600 dark:bg-danger-500/15">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </span>
      <div className="max-w-md">
        <h2 className="text-lg font-bold text-fg">{title}</h2>
        <p className="mt-1.5 text-sm text-fg-muted">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try again
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}

export function InlineAlert({ tone = 'info', children, className, icon }: { tone?: 'info' | 'success' | 'warning' | 'danger'; children: ReactNode; className?: string; icon?: ReactNode }) {
  const tones = {
    info: 'border-info-600/20 bg-info-50 text-info-600 dark:bg-info-600/10 dark:text-sky-300',
    success: 'border-success-600/20 bg-success-50 text-success-600 dark:bg-success-600/10 dark:text-success-500',
    warning: 'border-warning-500/30 bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
    danger: 'border-danger-500/25 bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
  };
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm', tones[tone], className)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

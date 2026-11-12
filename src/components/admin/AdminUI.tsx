import { useState, type ReactNode } from 'react';
import { BarChart3, Table2, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className, bodyClassName }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn('rounded-3xl border border-line bg-surface', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title && <h2 className="text-sm font-bold text-fg">{title}</h2>}
          {action}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

/** KPI tile: hero number + delta vs the previous period (icon + sign, never color alone). */
export function StatCard({ label, value, delta, icon: Icon, loading, hint }: { label: string; value: string; delta?: number | null; icon: LucideIcon; loading?: boolean; hint?: string }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-fg-muted">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-fg-muted">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>
      {loading ? <Skeleton className="h-8 w-28" /> : <p className="font-display text-2xl font-extrabold tabular-nums text-fg sm:text-[1.7rem]">{value}</p>}
      {delta !== undefined && delta !== null && !loading ? (
        <p className={cn('flex flex-wrap items-center gap-x-1 text-xs font-semibold', up ? 'text-success-600' : 'text-danger-600')}>
          {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
          {up ? '+' : ''}
          {delta.toFixed(1)}%<span className="whitespace-nowrap font-normal text-fg-subtle">vs prev. period</span>
        </p>
      ) : (
        hint && <p className="text-xs text-fg-subtle">{hint}</p>
      )}
    </div>
  );
}

export function percentDelta(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

/** Chart container with an accessible table view toggle. */
export function ChartCard<T extends object>({
  title,
  subtitle,
  loading,
  children,
  rows,
  columns,
  className,
  height = 280,
}: {
  title: string;
  subtitle?: string;
  loading?: boolean;
  children: ReactNode;
  rows?: T[];
  columns?: { key: keyof T; label: string; format?: (v: T[keyof T]) => string }[];
  className?: string;
  height?: number;
}) {
  const [table, setTable] = useState(false);
  return (
    <section className={cn('flex flex-col rounded-3xl border border-line bg-surface', className)} aria-label={title}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="text-sm font-bold text-fg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-fg-subtle">{subtitle}</p>}
        </div>
        {rows && columns && (
          <button
            type="button"
            onClick={() => setTable((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-fg-muted transition hover:border-fg hover:text-fg"
            aria-pressed={table}
            aria-label={table ? 'Show chart' : 'Show data table'}
          >
            {table ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
            {table ? 'Chart' : 'Table'}
          </button>
        )}
      </div>
      <div className="flex-1 px-3 pb-4 pt-3 sm:px-4">
        {loading ? null : table && rows && columns ? (
          <div className="max-h-[320px] overflow-auto px-2">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface text-xs text-fg-subtle">
                <tr>
                  {columns.map((c) => (
                    <th key={String(c.key)} className="py-2 text-start font-semibold">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={String(c.key)} className="py-2 tabular-nums text-fg">
                        {c.format ? c.format(r[c.key]) : String(r[c.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
        {loading && <div style={{ height }} className="skeleton mx-2 rounded-2xl" aria-hidden="true" />}
      </div>
    </section>
  );
}

/** Responsive data table shell (horizontal scroll on small screens). */
export function DataTable({ head, children, loading, empty }: { head: ReactNode; children: ReactNode; loading?: boolean; empty?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-line bg-surface-muted/70 text-start text-xs font-semibold uppercase tracking-wide text-fg-subtle [&_th]:px-4 [&_th]:py-3 [&_th]:text-start [&_th]:font-semibold">{head}</thead>
          <tbody className="divide-y divide-line [&_td]:px-4 [&_td]:py-3">{children}</tbody>
        </table>
      </div>
      {loading && <div className="h-1 w-full animate-pulse bg-brand-500/40" aria-hidden="true" />}
      {empty}
    </div>
  );
}

export function FilterTabs<K extends string>({ value, onChange, options }: { value: K; onChange: (k: K) => void; options: { key: K; label: string; count?: number }[] }) {
  return (
    <div role="tablist" className="scrollbar-none flex gap-1.5 overflow-x-auto">
      {options.map((o) => (
        <button key={o.key} type="button" role="tab" aria-selected={value === o.key} onClick={() => onChange(o.key)} className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition', value === o.key ? 'border-fg bg-fg text-canvas' : 'border-line-strong text-fg hover:border-fg')}>
          {o.label}
          {o.count !== undefined && <span className="ms-1.5 opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

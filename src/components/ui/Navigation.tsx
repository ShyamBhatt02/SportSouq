import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

/* ---------------- Breadcrumb (+ JSON-LD friendly data) ---------------- */

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="scrollbar-none flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-fg-subtle">
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-fg" aria-label="Home">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
        {items.map((c, i) => (
          <Fragment key={c.label + i}>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3 rtl:rotate-180" />
            </li>
            <li>
              {c.to && i < items.length - 1 ? (
                <Link to={c.to} className="font-medium hover:text-fg">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-fg">
                  {c.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

/* ---------------- Pagination ---------------- */

function pageList(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page, page - 1, page + 1]);
  const sorted = Array.from(set).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, onChange, className }: { page: number; totalPages: number; onChange: (page: number) => void; className?: string }) {
  if (totalPages <= 1) return null;
  const btn = 'flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40';
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button type="button" className={cn(btn, 'border border-line hover:bg-surface-muted')} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      </button>
      <span className="px-2 text-sm font-medium text-fg-muted sm:hidden">
        {page} / {totalPages}
      </span>
      <ul className="hidden items-center gap-1.5 sm:flex">
        {pageList(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <li key={'gap' + i} className="px-1 text-fg-subtle" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={'Page ' + p}
                className={cn(btn, p === page ? 'bg-ink-950 text-white dark:bg-white dark:text-ink-950' : 'text-fg hover:bg-surface-muted')}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>
      <button type="button" className={cn(btn, 'border border-line hover:bg-surface-muted')} onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}

import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton rounded-lg', className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-[4/5] w-full rounded-[var(--radius-card)]" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          {Array.from({ length: cols - 1 }, (_, c) => (
            <Skeleton key={c} className={cn('h-3.5', c === 0 ? 'w-1/4' : 'w-1/6')} />
          ))}
        </div>
      ))}
    </div>
  );
}

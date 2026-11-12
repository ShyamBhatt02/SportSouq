import { cn } from '@/utils/cn';

const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };

export function Spinner({ size = 'md', className, label = 'Loading' }: { size?: keyof typeof sizes; className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn('inline-block animate-spin rounded-full border-current border-r-transparent text-brand-600', sizes[size], className)} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[] | undefined;
  loading?: boolean;
  skeletonCount?: number;
  columns?: 'default' | 'wide' | 'compact';
  showCountdown?: boolean;
  empty?: ReactNode;
  className?: string;
}

const COLS = {
  default: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
  wide: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5',
  compact: 'grid-cols-2 lg:grid-cols-3',
};

export function ProductGrid({ products, loading, skeletonCount = 8, columns = 'default', showCountdown, empty, className }: ProductGridProps) {
  if (loading && !products?.length) {
    return (
      <div className={cn('grid gap-x-4 gap-y-8 sm:gap-x-5', COLS[columns], className)} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!products?.length) return <>{empty}</>;
  return (
    <ul className={cn('grid gap-x-4 gap-y-8 sm:gap-x-5', COLS[columns], loading && 'opacity-60 transition-opacity', className)}>
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} priority={i < 4} showCountdown={showCountdown} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

/** Horizontal, swipeable product row with desktop arrow controls. */
export function ProductCarousel({ products, loading, showCountdown, label }: { products: Product[] | undefined; loading?: boolean; showCountdown?: boolean; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setEdges({ start: pos < 8, end: pos > max - 8 });
  };

  useEffect(update, [products]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const item = 'w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23.5%] xl:w-[19%]';

  return (
    <div className="group/carousel relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <ul ref={ref} onScroll={update} className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0">
        {loading && !products?.length
          ? Array.from({ length: 5 }, (_, i) => (
              <li key={i} className={item}>
                <ProductCardSkeleton />
              </li>
            ))
          : products?.map((p) => (
              <li key={p.id} className={cn(item, 'flex')}>
                <ProductCard product={p} showCountdown={showCountdown} className="w-full" />
              </li>
            ))}
      </ul>
      {!edges.start && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute -start-4 top-[38%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-lift transition hover:scale-105 lg:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
      )}
      {!edges.end && (
        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute -end-4 top-[38%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-lift transition hover:scale-105 lg:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
}

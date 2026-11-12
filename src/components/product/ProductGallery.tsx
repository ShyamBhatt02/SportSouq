import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn } from 'lucide-react';
import { imageUrl } from '@/data/images';
import { SafeImage } from '@/components/ui/SafeImage';
import { Modal } from '@/components/ui/Overlay';
import { cn } from '@/utils/cn';

interface ProductGalleryProps {
  images: string[];
  name: string;
  /** Image key to jump to when the variant changes. */
  activeImage?: string;
}

/**
 * Main image + thumbnails, hover zoom (desktop), swipe (mobile),
 * keyboard arrows, and a full-screen viewer.
 */
export function ProductGallery({ images, name, activeImage }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const touch = useRef<number | null>(null);
  const count = images.length;

  useEffect(() => {
    if (!activeImage) return;
    const i = images.indexOf(activeImage);
    if (i >= 0) setIndex(i);
  }, [activeImage, images]);

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex((next + count) % count);
  };

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const onTouchStart = (e: TouchEvent) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touch.current = null;
  };

  const current = images[index] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4" role="region" aria-roledescription="image gallery" aria-label={name + ' images'}>
      {count > 1 && (
        <div className="scrollbar-none flex gap-2.5 overflow-x-auto lg:max-h-[600px] lg:w-20 lg:flex-col lg:overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => go(i)}
              aria-label={'View image ' + (i + 1) + ' of ' + count}
              aria-current={i === index}
              className={cn('relative w-18 shrink-0 overflow-hidden rounded-xl transition lg:w-20', i === index ? 'ring-2 ring-fg ring-offset-2 ring-offset-canvas' : 'opacity-70 ring-1 ring-line hover:opacity-100')}
            >
              <SafeImage src={img} alt="" width={160} ratio={1} wrapperClassName="aspect-square" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1">
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-surface-muted sm:aspect-[5/5]"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setFullscreen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(index + 1);
            if (e.key === 'ArrowLeft') go(index - 1);
            if (e.key === 'Enter') setFullscreen(true);
          }}
          tabIndex={0}
          role="button"
          aria-label={'Open full-screen image ' + (index + 1) + ' of ' + count}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current + index}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <SafeImage src={current} alt={name + ' — image ' + (index + 1)} width={900} ratio={1} widths={[600, 900, 1200]} sizes="(min-width: 1024px) 50vw, 100vw" priority={index === 0} wrapperClassName="h-full w-full" />
            </motion.div>
          </AnimatePresence>
          {zoom && (
            <div
              className="pointer-events-none absolute inset-0 hidden bg-no-repeat lg:block"
              style={{ backgroundImage: 'url(' + imageUrl(current, 1600, 1600) + ')', backgroundSize: '220%', backgroundPosition: zoom.x + '% ' + zoom.y + '%' }}
              aria-hidden="true"
            />
          )}
          <span className="pointer-events-none absolute bottom-3 end-3 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-soft lg:flex">
            <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" /> Hover to zoom
          </span>
          <span className="pointer-events-none absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-soft lg:hidden">
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </span>
          {count > 1 && (
            <div className="absolute bottom-4 start-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden" aria-hidden="true">
              {images.map((_, i) => (
                <span key={i} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-ink-950' : 'w-1.5 bg-ink-950/30')} />
              ))}
            </div>
          )}
        </div>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} className="absolute start-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-lift backdrop-blur transition hover:bg-white" aria-label="Previous image">
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button type="button" onClick={() => go(index + 1)} className="absolute end-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-lift backdrop-blur transition hover:bg-white" aria-label="Next image">
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </>
        )}
      </div>

      <Modal open={fullscreen} onClose={() => setFullscreen(false)} size="xl" hideTitle title={name}>
        <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <SafeImage src={current} alt={name + ' — image ' + (index + 1)} width={1400} ratio={1} wrapperClassName="mx-auto aspect-square max-h-[78dvh] rounded-2xl" />
          {count > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button type="button" onClick={() => go(index - 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:bg-surface-muted" aria-label="Previous image">
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <span className="text-sm font-semibold tabular-nums text-fg-muted">
                {index + 1} / {count}
              </span>
              <button type="button" onClick={() => go(index + 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:bg-surface-muted" aria-label="Next image">
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { imageSrcSet, imageUrl } from '@/data/images';
import { cn } from '@/utils/cn';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  /** Base render width used for the default src. */
  width?: number;
  /** Height / width ratio for cropping, e.g. 1.25 for 4:5 portraits. */
  ratio?: number;
  /** Candidate widths for responsive srcset. */
  widths?: number[];
  priority?: boolean;
  wrapperClassName?: string;
}

/**
 * Image with shimmer placeholder, lazy loading, responsive srcset and a styled
 * fallback — so a CDN hiccup never shows a broken-image icon.
 */
export function SafeImage({ src, alt, width = 600, ratio, widths, priority, className, wrapperClassName, sizes, ...rest }: SafeImageProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setState('loading');
  }
  const url = imageUrl(src, width, ratio ? Math.round(width * ratio) : undefined);
  const srcSet = widths ? imageSrcSet(src, widths, ratio) : undefined;

  return (
    <div className={cn('relative overflow-hidden bg-surface-sunken', wrapperClassName)}>
      {state === 'loading' && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      {state === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-ink-100 to-ink-200 text-ink-500 dark:from-ink-800 dark:to-ink-900 dark:text-ink-400">
          <ImageOff className="h-7 w-7" aria-hidden="true" />
          <span className="px-3 text-center text-xs font-medium">{alt}</span>
        </div>
      ) : (
        <img
          src={url}
          srcSet={srcSet}
          sizes={srcSet ? sizes ?? '(min-width: 1024px) 25vw, 50vw' : undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn('h-full w-full object-cover transition-opacity duration-500', state === 'loaded' ? 'opacity-100' : 'opacity-0', className)}
          {...rest}
        />
      )}
    </div>
  );
}

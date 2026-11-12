import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useEscape, useLockBodyScroll } from '@/hooks/useMisc';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Traps Tab focus inside `ref` while active and restores focus on close. */
function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const timer = window.setTimeout(() => {
      const preferred = node?.querySelector<HTMLElement>('[data-autofocus]');
      (preferred ?? node?.querySelector<HTMLElement>(FOCUSABLE) ?? node)?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [active]);
  return ref;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideTitle?: boolean;
  className?: string;
}

const modalSizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' };

export function Modal({ open, onClose, title, description, children, footer, size = 'md', hideTitle, className }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const trapRef = useFocusTrap(open);
  useLockBodyScroll(open);
  useEscape(open, onClose);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-pop outline-none sm:rounded-3xl',
              modalSizes[size],
              className,
            )}
          >
            {(title || !hideTitle) && (
              <div className={cn('flex items-start justify-between gap-4 px-5 pt-5 sm:px-6', hideTitle && 'sr-only')}>
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="text-lg font-bold text-fg">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descId} className="mt-1 text-sm text-fg-muted">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute end-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-fg-muted backdrop-blur transition hover:bg-surface-muted hover:text-fg"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <div className="border-t border-line bg-surface-muted/60 px-5 py-4 sm:px-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left' | 'bottom';
  widthClass?: string;
  headerExtra?: ReactNode;
}

export function Drawer({ open, onClose, title, children, footer, side = 'right', widthClass = 'max-w-md', headerExtra }: DrawerProps) {
  const titleId = useId();
  const trapRef = useFocusTrap(open);
  useLockBodyScroll(open);
  useEscape(open, onClose);

  const motionProps =
    side === 'bottom'
      ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
      : side === 'left'
        ? { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } }
        : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            {...motionProps}
            transition={{ type: 'spring', damping: 34, stiffness: 360 }}
            className={cn(
              'absolute flex flex-col bg-surface shadow-pop outline-none',
              side === 'bottom' ? 'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl' : 'inset-y-0 w-full',
              side === 'right' && 'end-0',
              side === 'left' && 'start-0',
              side !== 'bottom' && widthClass,
            )}
          >
            {side === 'bottom' && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line-strong" aria-hidden="true" />}
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-fg">
                {title}
              </h2>
              <div className="flex items-center gap-1">
                {headerExtra}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition hover:bg-surface-muted hover:text-fg"
                  aria-label="Close panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="border-t border-line bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Click-outside helper for popovers. */
export function useClickOutside(active: boolean, onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const handler = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    },
    [onOutside],
  );
  useEffect(() => {
    if (!active) return;
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [active, handler]);
  return ref;
}

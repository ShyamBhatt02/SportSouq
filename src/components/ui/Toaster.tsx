import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToast, type ToastVariant } from '@/context/ToastContext';
import { cn } from '@/utils/cn';

const icons: Record<ToastVariant, typeof Info> = { success: CheckCircle2, error: AlertCircle, info: Info, warning: TriangleAlert };
const accents: Record<ToastVariant, string> = {
  success: 'text-success-500',
  error: 'text-danger-500',
  info: 'text-sky-400',
  warning: 'text-warning-500',
};

/** Toast viewport — polite live region so screen readers announce updates. */
export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:end-4 sm:bottom-4 sm:items-end sm:p-0"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = icons[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              role={t.variant === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink-950 p-3 pe-2 text-white shadow-pop ring-1 ring-white/10"
            >
              {t.image ? (
                <img src={t.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
              ) : (
                <Icon className={cn('ms-1 h-5 w-5 shrink-0', accents[t.variant])} aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {t.image && <Icon className={cn('h-4 w-4 shrink-0', accents[t.variant])} aria-hidden="true" />}
                  {t.title}
                </p>
                {t.description && <p className="truncate text-xs text-ink-300">{t.description}</p>}
              </div>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-300 transition hover:bg-white/10"
                >
                  {t.action.label}
                </button>
              )}
              <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 rounded-lg p-1.5 text-ink-400 transition hover:bg-white/10 hover:text-white" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

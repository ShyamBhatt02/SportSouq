import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  image?: string;
  action?: ToastAction;
  duration: number;
}

type ToastInput = Partial<Omit<ToastItem, 'id' | 'title'>> & { title: string };

interface ToastValue {
  toasts: ToastItem[];
  toast: (input: ToastInput) => number;
  success: (title: string, extra?: Omit<ToastInput, 'title' | 'variant'>) => number;
  error: (title: string, extra?: Omit<ToastInput, 'title' | 'variant'>) => number;
  info: (title: string, extra?: Omit<ToastInput, 'title' | 'variant'>) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++counter.current;
      const item: ToastItem = { variant: 'info', duration: 3800, ...input, id };
      setToasts((list) => [...list.slice(-3), item]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), item.duration));
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastValue>(
    () => ({
      toasts,
      toast,
      dismiss,
      success: (title, extra) => toast({ ...extra, title, variant: 'success' }),
      error: (title, extra) => toast({ duration: 5500, ...extra, title, variant: 'error' }),
      info: (title, extra) => toast({ ...extra, title, variant: 'info' }),
    }),
    [toasts, toast, dismiss],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

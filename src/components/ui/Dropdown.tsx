import { useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useClickOutside } from './Overlay';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  active?: boolean;
}

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void; id: string; 'aria-expanded': boolean; 'aria-haspopup': 'menu'; 'aria-controls': string }) => ReactNode;
  items: DropdownItem[];
  header?: ReactNode;
  align?: 'start' | 'end';
  width?: string;
}

/** Accessible menu button with arrow-key navigation (WAI-ARIA menu pattern). */
export function Dropdown({ trigger, items, header, align = 'end', width = 'w-56' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const menuId = id + '-menu';
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside(open, close);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = () => {
    setOpen((v) => !v);
    window.setTimeout(() => itemRefs.current[0]?.focus(), 40);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    const idx = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      (ref.current?.querySelector('[aria-haspopup]') as HTMLElement | null)?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      itemRefs.current[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      itemRefs.current[(idx - 1 + items.length) % items.length]?.focus();
    }
  };

  return (
    <div ref={ref} className="relative" onKeyDown={onKeyDown}>
      {trigger({ open, toggle, id, 'aria-expanded': open, 'aria-haspopup': 'menu', 'aria-controls': menuId })}
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-labelledby={id}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn('absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift', align === 'end' ? 'end-0' : 'start-0', width)}
          >
            {header}
            {items.map((item, i) => (
              <button
                key={item.key}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onSelect();
                  close();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors focus:outline-none',
                  item.danger ? 'text-danger-600 hover:bg-danger-50 focus:bg-danger-50 dark:hover:bg-danger-500/10' : 'text-fg hover:bg-surface-muted focus:bg-surface-muted',
                  item.active && 'bg-surface-muted',
                )}
              >
                {item.icon && <span className="text-fg-subtle">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

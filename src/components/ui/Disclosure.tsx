import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

/* ---------------- Tabs (WAI-ARIA tabs pattern) ---------------- */

export interface TabItem {
  key: string;
  label: ReactNode;
  content: ReactNode;
}

export function Tabs({ items, defaultKey, className, listClassName }: { items: TabItem[]; defaultKey?: string; className?: string; listClassName?: string }) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === 'ArrowRight') next = (index + 1) % items.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      setActive(items[next].key);
      refs.current[next]?.focus();
    }
  };

  return (
    <div className={className}>
      <div role="tablist" className={cn('scrollbar-none flex gap-1 overflow-x-auto border-b border-line', listClassName)}>
        {items.map((item, i) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={id + '-tab-' + item.key}
              aria-selected={selected}
              aria-controls={id + '-panel-' + item.key}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors',
                selected ? 'text-fg' : 'text-fg-subtle hover:text-fg',
              )}
            >
              {item.label}
              {selected && <motion.span layoutId={id + '-underline'} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          role="tabpanel"
          id={id + '-panel-' + item.key}
          aria-labelledby={id + '-tab-' + item.key}
          hidden={item.key !== active}
          tabIndex={0}
          className="pt-6 focus:outline-none"
        >
          {item.key === active && item.content}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Accordion ---------------- */

export interface AccordionItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
  badge?: ReactNode;
}

export function Accordion({ items, defaultOpen = [], multiple = true, className }: { items: AccordionItem[]; defaultOpen?: string[]; multiple?: boolean; className?: string }) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const id = useId();
  const toggle = (key: string) =>
    setOpen((list) => (list.includes(key) ? list.filter((k) => k !== key) : multiple ? [...list, key] : [key]));
  return (
    <div className={cn('divide-y divide-line', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.key);
        return (
          <div key={item.key}>
            <h3>
              <button
                type="button"
                id={id + '-h-' + item.key}
                aria-expanded={isOpen}
                aria-controls={id + '-p-' + item.key}
                onClick={() => toggle(item.key)}
                className="flex w-full items-center justify-between gap-3 py-4 text-start text-sm font-semibold text-fg"
              >
                <span className="flex items-center gap-2">
                  {item.title}
                  {item.badge}
                </span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-200', isOpen && 'rotate-180')} aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={id + '-p-' + item.key}
                  role="region"
                  aria-labelledby={id + '-h-' + item.key}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="pb-5">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

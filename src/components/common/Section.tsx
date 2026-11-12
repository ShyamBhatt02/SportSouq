import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; to: string };
  extra?: ReactNode;
  className?: string;
  align?: 'start' | 'center';
  id?: string;
}

export function SectionHeading({ eyebrow, title, description, action, extra, className, align = 'start', id }: SectionHeadingProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between', align === 'center' && 'items-center text-center sm:flex-col sm:items-center', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">{eyebrow}</p>}
        <h2 id={id} className="text-2xl font-extrabold leading-tight text-fg sm:text-3xl lg:text-[2.1rem]">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-fg-muted sm:text-base">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {extra}
        {action && (
          <Link to={action.to} className="group inline-flex items-center gap-1.5 text-sm font-bold text-fg hover:text-brand-600 dark:hover:text-brand-400">
            {action.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

/** Section wrapper with a subtle reveal-on-scroll. */
export function Section({ children, className, labelledBy, muted }: { children: ReactNode; className?: string; labelledBy?: string; muted?: boolean }) {
  return (
    <motion.section
      aria-labelledby={labelledBy}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('py-12 sm:py-16', muted && 'bg-surface-muted', className)}
    >
      <div className="container-page">{children}</div>
    </motion.section>
  );
}

export function PageHeader({ title, description, children, className }: { title: ReactNode; description?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('border-b border-line bg-surface-muted/60', className)}>
      <div className="container-page py-8 sm:py-10">
        {children}
        <h1 className="mt-3 text-3xl font-black tracking-tight text-fg sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-fg-muted sm:text-base">{description}</p>}
      </div>
    </div>
  );
}

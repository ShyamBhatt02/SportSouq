import { Timer } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/utils/cn';

const pad = (n: number) => String(n).padStart(2, '0');

interface CountdownProps {
  endsAt: string | undefined;
  variant?: 'blocks' | 'inline' | 'pill';
  className?: string;
  label?: string;
}

export function Countdown({ endsAt, variant = 'inline', className, label }: CountdownProps) {
  const { t } = useI18n();
  const c = useCountdown(endsAt);
  if (!c) return null;
  if (c.expired) return <span className={cn('text-xs font-semibold text-fg-subtle', className)}>{t.product.dealEnded}</span>;

  const accessible = (c.days ? c.days + ' days ' : '') + c.hours + ' hours ' + c.minutes + ' minutes remaining';

  if (variant === 'blocks') {
    const units = [
      ...(c.days ? [{ v: c.days, l: 'Days' }] : []),
      { v: c.hours, l: 'Hrs' },
      { v: c.minutes, l: 'Min' },
      { v: c.seconds, l: 'Sec' },
    ];
    return (
      <div className={cn('flex items-center gap-1.5', className)} role="timer" aria-label={accessible}>
        {label && <span className="me-1 text-sm font-semibold">{label}</span>}
        {units.map((u, i) => (
          <div key={u.l} className="flex items-center gap-1.5">
            <div className="flex min-w-12 flex-col items-center rounded-xl bg-ink-950 px-2 py-1.5 text-white dark:bg-white/10">
              <span className="font-display text-lg font-bold tabular-nums leading-none">{pad(u.v)}</span>
              <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink-300">{u.l}</span>
            </div>
            {i < units.length - 1 && <span className="font-bold text-fg-subtle" aria-hidden="true">:</span>}
          </div>
        ))}
      </div>
    );
  }

  const text = (c.days ? c.days + 'd ' : '') + pad(c.hours) + ':' + pad(c.minutes) + ':' + pad(c.seconds);
  if (variant === 'pill') {
    return (
      <span role="timer" aria-label={accessible} className={cn('inline-flex items-center gap-1 rounded-full bg-ink-950/85 px-2 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur', className)}>
        <Timer className="h-3 w-3 text-volt-400" aria-hidden="true" />
        {text}
      </span>
    );
  }
  return (
    <span role="timer" aria-label={accessible} className={cn('inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400', className)}>
      <Timer className="h-3.5 w-3.5" aria-hidden="true" />
      {label ?? t.product.endsIn} <span className="tabular-nums">{text}</span>
    </span>
  );
}

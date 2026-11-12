import { SITE } from '@/config/site';

const numberFmt = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
const decimalFmt = new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "AED 1,299" — whole dirhams when the value is an integer, otherwise 2 decimals. */
export function formatPrice(value: number, opts: { decimals?: boolean } = {}): string {
  const rounded = Math.round(value * 100) / 100;
  const useDecimals = opts.decimals ?? !Number.isInteger(rounded);
  return SITE.currency + ' ' + (useDecimals ? decimalFmt.format(rounded) : numberFmt.format(rounded));
}

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-AE', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return value.toFixed(digits) + '%';
}

const dateFmt = new Intl.DateTimeFormat('en-AE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: SITE.timezone });
const dayFmt = new Intl.DateTimeFormat('en-AE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: SITE.timezone });
const dateTimeFmt = new Intl.DateTimeFormat('en-AE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: SITE.timezone,
});

export function formatDate(iso: string | Date): string {
  return dateFmt.format(typeof iso === 'string' ? new Date(iso) : iso);
}

export function formatDay(iso: string | Date): string {
  return dayFmt.format(typeof iso === 'string' ? new Date(iso) : iso);
}

export function formatDateTime(iso: string | Date): string {
  return dateTimeFmt.format(typeof iso === 'string' ? new Date(iso) : iso);
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < 3_600_000) return Math.max(1, Math.round(diff / 60_000)) + ' min ago';
  if (diff < day) return Math.round(diff / 3_600_000) + ' h ago';
  if (diff < day * 30) return Math.round(diff / day) + ' days ago';
  if (diff < day * 365) return Math.round(diff / (day * 30)) + ' months ago';
  return formatDate(iso);
}

/** Formats a UAE number as "+971 50 123 4567". */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('00971')) local = local.slice(5);
  else if (local.startsWith('971')) local = local.slice(3);
  else if (local.startsWith('0')) local = local.slice(1);
  if (local.length === 9 && local.startsWith('5')) return '+971 ' + local.slice(0, 2) + ' ' + local.slice(2, 5) + ' ' + local.slice(5);
  if (local.length === 8) return '+971 ' + local.slice(0, 1) + ' ' + local.slice(1, 4) + ' ' + local.slice(4);
  return raw;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function pluralize(count: number, singular: string, plural = singular + 's'): string {
  return formatNumber(count) + ' ' + (count === 1 ? singular : plural);
}

export function titleCase(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

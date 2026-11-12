import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import { formatCompact, formatNumber, formatPrice } from '@/utils/format';

/*
 * Chart conventions (dataviz method): one series per chart, one y-axis,
 * single hue from the design tokens (theme-aware via CSS vars), thin marks,
 * 4px rounded bar ends, recessive grid, crosshair/hover tooltip on every chart.
 */
const AXIS = { fontSize: 11, fill: 'var(--ss-fg-subtle)' };
const GRID = 'var(--ss-line)';
const SERIES = {
  revenue: 'var(--color-brand-500)',
  orders: '#2a78d6',
  customers: '#1baf7a',
};

type Fmt = 'currency' | 'number';
const fmt = (v: number, f: Fmt) => (f === 'currency' ? formatPrice(v) : formatNumber(v));
const tick = (v: number, f: Fmt) => (f === 'currency' ? 'AED ' + formatCompact(v) : formatCompact(v));

function ChartTooltip({ active, payload, label, format, name }: Partial<TooltipContentProps<number, string>> & { format: Fmt; name: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-fg-muted">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 font-bold text-fg">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }} aria-hidden="true" />
        {name}: {fmt(Number(payload[0].value), format)}
      </p>
    </div>
  );
}

interface SeriesProps {
  data: object[];
  x: string;
  y: string;
  name: string;
  format?: Fmt;
  color?: keyof typeof SERIES;
}

export function TrendArea({ data, x, y, name, format = 'currency', color = 'revenue' }: SeriesProps) {
  const id = 'grad-' + y;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[color]} stopOpacity={0.28} />
            <stop offset="100%" stopColor={SERIES[color]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 4" vertical={false} />
        <XAxis dataKey={x} tick={AXIS} tickLine={false} axisLine={false} minTickGap={18} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={format === 'currency' ? 84 : 64} tickFormatter={(v: number) => tick(v, format)} />
        <Tooltip content={<ChartTooltip format={format} name={name} />} cursor={{ stroke: 'var(--ss-line-strong)', strokeWidth: 1 }} />
        <Area type="monotone" dataKey={y} name={name} stroke={SERIES[color]} strokeWidth={2} fill={'url(#' + id + ')'} activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--ss-surface)' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data, x, y, name, format = 'number', color = 'customers' }: SeriesProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 4" vertical={false} />
        <XAxis dataKey={x} tick={AXIS} tickLine={false} axisLine={false} minTickGap={18} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => tick(v, format)} />
        <Tooltip content={<ChartTooltip format={format} name={name} />} cursor={{ stroke: 'var(--ss-line-strong)', strokeWidth: 1 }} />
        <Line type="monotone" dataKey={y} name={name} stroke={SERIES[color]} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--ss-surface)' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendBars({ data, x, y, name, format = 'number', color = 'orders' }: SeriesProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 4" vertical={false} />
        <XAxis dataKey={x} tick={AXIS} tickLine={false} axisLine={false} minTickGap={12} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} allowDecimals={false} tickFormatter={(v: number) => tick(v, format)} />
        <Tooltip content={<ChartTooltip format={format} name={name} />} cursor={{ fill: 'var(--ss-surface-muted)' }} />
        <Bar dataKey={y} name={name} fill={SERIES[color]} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Ranked horizontal bars (magnitude by category — single hue, sorted). */
export function RankedBars({ data, x, y, name, format = 'currency', color = 'revenue' }: SeriesProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={6}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 4" horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v: number) => tick(v, format)} />
        <YAxis type="category" dataKey={x} tick={{ ...AXIS, fill: 'var(--ss-fg-muted)' }} tickLine={false} axisLine={false} width={104} />
        <Tooltip content={<ChartTooltip format={format} name={name} />} cursor={{ fill: 'var(--ss-surface-muted)' }} />
        <Bar dataKey={y} name={name} fill={SERIES[color]} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

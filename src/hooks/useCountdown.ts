import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  totalMs: number;
}

function diff(target: number): Countdown {
  const totalMs = Math.max(0, target - Date.now());
  const s = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    expired: totalMs === 0,
    totalMs,
  };
}

export function useCountdown(targetIso: string | undefined): Countdown | null {
  const target = targetIso ? new Date(targetIso).getTime() : NaN;
  const [state, setState] = useState<Countdown | null>(() => (Number.isFinite(target) ? diff(target) : null));
  useEffect(() => {
    if (!Number.isFinite(target)) {
      setState(null);
      return;
    }
    setState(diff(target));
    const id = window.setInterval(() => setState(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return state;
}

/** Next Dubai midnight — the shared end time for the homepage flash-deal timer. */
export function nextDubaiMidnightIso(): string {
  const now = Date.now();
  const dubai = new Date(now + 4 * 3_600_000);
  return new Date(Date.UTC(dubai.getUTCFullYear(), dubai.getUTCMonth(), dubai.getUTCDate() + 1) - 4 * 3_600_000).toISOString();
}

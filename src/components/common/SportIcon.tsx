import type { SportIconName } from '@/types';

/** Custom line icons for each sport (24px grid, currentColor) — matches Lucide's 2px stroke style. */
const paths: Record<SportIconName, React.ReactNode> = {
  football: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l3.8 2.8-1.5 4.4H9.7L8.2 10.3z" />
      <path d="M12 3v4.5M20.6 9.3l-4.8 1M17.6 19.2l-3.3-4.5M6.4 19.2l3.3-4.5M3.4 9.3l4.8 1" />
    </>
  ),
  cricket: (
    <>
      <path d="M14.5 3.5l6 6-9.8 9.8a2 2 0 01-2.8 0l-3.2-3.2a2 2 0 010-2.8z" />
      <path d="M5 19l-1.8 1.8" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  basketball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18" />
      <path d="M5.6 5.6c2.6 2.6 2.6 10.2 0 12.8M18.4 5.6c-2.6 2.6-2.6 10.2 0 12.8" />
    </>
  ),
  tennis: (
    <>
      <ellipse cx="10" cy="9" rx="6" ry="6.5" transform="rotate(-35 10 9)" />
      <path d="M14.2 13.4L20 20" />
      <path d="M7 5.5l6 7M5 9l7 1" />
      <circle cx="19" cy="6" r="1.8" />
    </>
  ),
  running: (
    <>
      <circle cx="14.5" cy="4.5" r="2" />
      <path d="M9 21l2.5-5 3 2.5V22M7 11l3-3.5 4 1.5 2 3.5 3 1" />
      <path d="M10 7.5L8.5 15l-4 1" />
    </>
  ),
  fitness: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </>
  ),
  cycling: (
    <>
      <circle cx="5.5" cy="16.5" r="3.5" />
      <circle cx="18.5" cy="16.5" r="3.5" />
      <path d="M5.5 16.5L9 9h6l3.5 7.5M9 9l3 7.5h-6.5M12.5 6h3" />
    </>
  ),
  swimming: (
    <>
      <circle cx="16.5" cy="6" r="2" />
      <path d="M3 17c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
      <path d="M3 21c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
      <path d="M6 14l4-4 3 2.5 3.5-2" />
    </>
  ),
  boxing: (
    <>
      <path d="M7 11V7.5A4.5 4.5 0 0111.5 3h2A4.5 4.5 0 0118 7.5V13a5 5 0 01-5 5h-1.5A4.5 4.5 0 017 13.5z" />
      <path d="M7 11h4.5a1.5 1.5 0 000-3H9.5M8.5 18v3h7.5v-3.5" />
    </>
  ),
  outdoor: (
    <>
      <path d="M3 20l6.5-11 3.5 6 2.5-4L21 20z" />
      <path d="M8 13l1.5 1.5L11 13" />
      <circle cx="18" cy="5" r="1.8" />
    </>
  ),
};

export function SportIcon({ name, className = 'h-6 w-6', strokeWidth = 1.8 }: { name: SportIconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

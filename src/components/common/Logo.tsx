import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  /** Renders light text for dark backgrounds. */
  inverted?: boolean;
  compact?: boolean;
  to?: string;
  animate?: boolean;
}

/**
 * SportSouq mark: a rounded tile in Signal Orange holding a kinetic "S"
 * (two opposing arcs, like a ball seam) with a volt speed-notch.
 * Entrance: tile spins in and the S stroke draws on. Hover: subtle tilt + bounce.
 */
export function LogoMark({ size = 36, animate = true }: { size?: number; animate?: boolean }) {
  const id = useId();
  const reduce = useReducedMotion();
  const play = animate && !reduce;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      initial={play ? { rotate: -90, scale: 0.4, opacity: 0 } : false}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
      variants={{ hover: { rotate: -8, scale: 1.08 } }}
      className="shrink-0 drop-shadow-[0_6px_14px_rgb(212_59_12/0.35)]"
    >
      <defs>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a3d" />
          <stop offset="1" stopColor="#d43b0c" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill={'url(#' + id + 'g)'} />
      <path d="M1 30 L47 18 L47 22 L1 34 Z" fill="#ffffff" opacity="0.08" />
      <motion.path
        d="M33 15.5c-2-2.4-5.3-3.7-9-3.7-5.4 0-9.4 2.9-9.4 7.2 0 4 3.1 5.7 8.1 6.7 3.9.8 5.1 1.5 5.1 3 0 1.6-1.8 2.6-4.5 2.6-3 0-5.7-1.2-7.3-3.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.4"
        strokeLinecap="round"
        initial={play ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
      />
      <motion.path
        d="M35.5 33.5l4.5-4.5"
        stroke="#d4ff3a"
        strokeWidth="3.6"
        strokeLinecap="round"
        initial={play ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.85 }}
      />
    </motion.svg>
  );
}

export function Logo({ className, inverted, compact, to = '/', animate = true }: LogoProps) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;
  return (
    <Link to={to} aria-label="SportSouq — home" className={cn('group inline-flex items-center gap-2.5 rounded-xl', className)}>
      <motion.span whileHover="hover" className="inline-flex items-center gap-2.5" transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
        <LogoMark animate={animate} />
        {!compact && (
          <motion.span
            initial={play ? { opacity: 0, x: -8 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col leading-none"
          >
            <span className={cn('font-display text-[1.15rem] font-black tracking-[-0.03em] min-[360px]:text-[1.35rem]', inverted ? 'text-white' : 'text-fg')}>
              Sport<span className="text-brand-600 dark:text-brand-400">Souq</span>
            </span>
            <span className={cn('mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.22em] sm:block', inverted ? 'text-ink-300' : 'text-fg-subtle')}>
              Gear Up · Play Better
            </span>
          </motion.span>
        )}
      </motion.span>
    </Link>
  );
}

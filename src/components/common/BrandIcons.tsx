/* Simple, generic payment & social glyphs (self-drawn SVG — no third-party icon packs). */

export function PaymentBadges({ className = '' }: { className?: string }) {
  const card = 'flex h-7 items-center justify-center rounded-md bg-white px-2 text-[10px] font-black tracking-tight shadow-sm ring-1 ring-black/5';
  return (
    <ul className={'flex flex-wrap items-center gap-2 ' + className} aria-label="Accepted payment methods">
      <li className={card + ' text-[#1a1f71] italic'}>VISA</li>
      <li className={card} aria-label="Mastercard">
        <svg viewBox="0 0 32 20" className="h-4 w-7" aria-hidden="true">
          <circle cx="12" cy="10" r="7" fill="#eb001b" />
          <circle cx="20" cy="10" r="7" fill="#f79e1b" fillOpacity="0.9" />
        </svg>
      </li>
      <li className={card + ' text-[#2e77bb]'}>AMEX</li>
      <li className={card + ' text-black'} aria-label="Apple Pay">
        <svg viewBox="0 0 24 24" className="me-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z" />
        </svg>
        Pay
      </li>
      <li className={card + ' text-emerald-700'}>COD</li>
    </ul>
  );
}

type Social = 'instagram' | 'x' | 'facebook' | 'youtube' | 'tiktok';

const SOCIAL: Record<Social, { label: string; path: React.ReactNode }> = {
  instagram: {
    label: 'Instagram',
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
      </>
    ),
  },
  x: { label: 'X', path: <path d="M4 4l6.6 8.8L4.3 20h2.1l5.1-5.9 4.4 5.9H20l-6.9-9.2L19 4h-2.1l-4.7 5.4L8.2 4z" fill="currentColor" /> },
  facebook: { label: 'Facebook', path: <path d="M14 8h3V4.5h-3c-2.5 0-4 1.6-4 4.1V11H7.5v3.5H10V21h3.6v-6.5h2.9l.5-3.5h-3.4V9c0-.6.4-1 1-1z" fill="currentColor" /> },
  youtube: {
    label: 'YouTube',
    path: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" />
      </>
    ),
  },
  tiktok: { label: 'TikTok', path: <path d="M14 3h3c.2 1.9 1.4 3.4 3.5 3.6v3.1c-1.3 0-2.5-.4-3.5-1v6.1A5.8 5.8 0 1111.2 9v3.2a2.7 2.7 0 102 2.6z" fill="currentColor" /> },
};

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={'flex items-center gap-2 ' + className}>
      {(Object.keys(SOCIAL) as Social[]).map((key) => (
        <li key={key}>
          <a
            href={'https://www.' + (key === 'x' ? 'x' : key) + '.com/'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={'SportSouq on ' + SOCIAL[key].label + ' (opens in new tab)'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-ink-200 ring-1 ring-white/10 transition hover:bg-brand-600 hover:text-white hover:ring-brand-600"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
              {SOCIAL[key].path}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

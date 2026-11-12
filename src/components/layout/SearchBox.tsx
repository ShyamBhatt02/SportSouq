import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Clock, Loader2, Search, SearchX, TrendingUp, X } from 'lucide-react';
import { productService } from '@/services/productService';
import { useDebounce } from '@/hooks/useDebounce';
import { useRecentSearches } from '@/hooks/useRecentlyViewed';
import { qk } from '@/hooks/queries';
import { useI18n } from '@/i18n/I18nProvider';
import { POPULAR_SEARCHES } from '@/data/content';
import { SafeImage } from '@/components/ui/SafeImage';
import { useClickOutside } from '@/components/ui/Overlay';
import { escapeRegExp, sanitizeQuery } from '@/utils/sanitize';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Highlights matched tokens by splitting text — never injects HTML. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.trim().split(/\s+/).filter((t) => t.length > 1).map(escapeRegExp);
  if (!tokens.length) return <>{text}</>;
  const parts = text.split(new RegExp('(' + tokens.join('|') + ')', 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-transparent font-bold text-brand-600 dark:text-brand-400">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

type Option = { id: string; kind: 'recent' | 'popular' | 'suggestion' | 'product' | 'all'; label: string; href: string; image?: string; meta?: string };

interface SearchBoxProps {
  autoFocus?: boolean;
  onNavigate?: () => void;
  variant?: 'header' | 'overlay';
}

export function SearchBox({ autoFocus, onNavigate, variant = 'header' }: SearchBoxProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const id = useId();
  const listId = id + '-list';
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(variant === 'overlay');
  const [active, setActive] = useState(-1);
  const recent = useRecentSearches();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useClickOutside(open && variant === 'header', () => setOpen(false));

  const q = sanitizeQuery(useDebounce(value, 220));
  const { data, isFetching, isError } = useQuery({
    queryKey: qk.suggest(q),
    queryFn: () => productService.suggest(q),
    enabled: q.length >= 2,
    staleTime: 60_000,
  });

  const go = (href: string, term?: string) => {
    if (term) recent.add(term);
    setOpen(variant === 'overlay');
    setValue('');
    setActive(-1);
    inputRef.current?.blur();
    navigate(href);
    onNavigate?.();
  };

  const submit = (term = value) => {
    const clean = sanitizeQuery(term);
    if (clean.length < 1) return;
    go('/search?q=' + encodeURIComponent(clean), clean);
  };

  const options: Option[] = useMemo(() => {
    if (q.length < 2) {
      return [
        ...recent.terms.map((term) => ({ id: 'r-' + term, kind: 'recent' as const, label: term, href: '/search?q=' + encodeURIComponent(term) })),
        ...POPULAR_SEARCHES.map((term) => ({ id: 'p-' + term, kind: 'popular' as const, label: term, href: '/search?q=' + encodeURIComponent(term) })),
      ];
    }
    if (!data) return [];
    const sugg = data.suggestions.map((s) => ({
      id: 's-' + s.type + s.value,
      kind: 'suggestion' as const,
      label: s.label,
      meta: s.type === 'sport' ? 'Sport' : s.type === 'brand' ? 'Brand' : 'Category',
      href: s.type === 'sport' ? '/sport/' + s.value : s.type === 'brand' ? '/shop?brand=' + encodeURIComponent(s.value) : '/category/' + s.parent + '?subcategory=' + s.value,
    }));
    const prods = data.products.map((p) => ({ id: 'pr-' + p.id, kind: 'product' as const, label: p.name, href: '/product/' + p.slug, image: p.thumbnail, meta: formatPrice(p.price) }));
    const all = data.total ? [{ id: 'all', kind: 'all' as const, label: t.search.viewAllResults(data.total, q), href: '/search?q=' + encodeURIComponent(q) }] : [];
    return [...sugg, ...prods, ...all];
  }, [q, data, recent.terms, t]);

  useEffect(() => setActive(-1), [q]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[active];
      if (opt) go(opt.href, opt.kind === 'product' ? q : opt.kind === 'all' ? q : opt.label);
      else submit();
    } else if (e.key === 'Escape') {
      if (value) setValue('');
      else {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
  };

  const showPanel = open && (options.length > 0 || q.length >= 2);
  const groups: { title: string; kinds: Option['kind'][]; action?: { label: string; onClick: () => void } }[] =
    q.length < 2
      ? [
          { title: t.search.recent, kinds: ['recent'], action: recent.terms.length ? { label: t.search.clearRecent, onClick: recent.clear } : undefined },
          { title: t.search.popular, kinds: ['popular'] },
        ]
      : [
          { title: t.search.suggestions, kinds: ['suggestion'] },
          { title: t.search.products, kinds: ['product', 'all'] },
        ];

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className={cn('relative flex items-center rounded-2xl border bg-surface-muted transition-colors focus-within:border-brand-500 focus-within:bg-surface focus-within:ring-4 focus-within:ring-brand-500/15', variant === 'overlay' ? 'border-line-strong bg-surface' : 'border-transparent')}>
          <Search className="pointer-events-none absolute start-3.5 h-4.5 w-4.5 text-fg-subtle" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label={t.search.label}
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 && options[active] ? id + options[active].id : undefined}
            autoFocus={autoFocus}
            autoComplete="off"
            enterKeyHint="search"
            maxLength={80}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={t.search.placeholder}
            className="h-11 w-full bg-transparent ps-10 pe-10 text-sm text-fg placeholder:text-fg-subtle focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {isFetching ? (
            <Loader2 className="absolute end-3.5 h-4 w-4 animate-spin text-fg-subtle" aria-hidden="true" />
          ) : (
            value && (
              <button type="button" onClick={() => setValue('')} className="absolute end-2 rounded-lg p-1.5 text-fg-subtle hover:text-fg" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn('z-50 overflow-hidden', variant === 'header' ? 'absolute inset-x-0 top-full mt-2 rounded-2xl border border-line bg-surface shadow-pop' : 'mt-4')}
          >
            <div id={listId} role="listbox" aria-label={t.search.suggestions} className={cn('overflow-y-auto p-2', variant === 'header' && 'max-h-[70vh]')}>
              {q.length >= 2 && !isFetching && (isError || (data && !data.products.length && !data.suggestions.length)) ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <SearchX className="h-8 w-8 text-fg-subtle" aria-hidden="true" />
                  <p className="text-sm font-semibold text-fg">{isError ? t.search.searchFailed : t.search.noResults(q)}</p>
                  <p className="text-xs text-fg-muted">{t.search.noResultsHint}</p>
                </div>
              ) : (
                groups.map((g) => {
                  const items = options.map((o, index) => ({ o, index })).filter(({ o }) => g.kinds.includes(o.kind));
                  if (!items.length) return null;
                  return (
                    <div key={g.title} className="mb-1" role="group" aria-label={g.title}>
                      <div className="flex items-center justify-between px-3 pb-1 pt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-fg-subtle">{g.title}</p>
                        {g.action && (
                          <button type="button" onClick={g.action.onClick} className="text-[11px] font-bold text-brand-600">
                            {g.action.label}
                          </button>
                        )}
                      </div>
                      <div className={cn(g.kinds.includes('popular') && 'flex flex-wrap gap-2 px-3 pb-2')}>
                        {items.map(({ o, index }) => {
                          const isActive = index === active;
                          if (o.kind === 'popular') {
                            return (
                              <button key={o.id} id={id + o.id} role="option" aria-selected={isActive} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(o.href, o.label)} className={cn('inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-fg transition hover:border-fg', isActive && 'border-fg bg-surface-muted')}>
                                <TrendingUp className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                                {o.label}
                              </button>
                            );
                          }
                          return (
                            <button
                              key={o.id}
                              id={id + o.id}
                              role="option"
                              aria-selected={isActive}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() => setActive(index)}
                              onClick={() => go(o.href, o.kind === 'recent' || o.kind === 'suggestion' ? o.label : q)}
                              className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm transition-colors', isActive ? 'bg-surface-muted' : 'hover:bg-surface-muted', o.kind === 'all' && 'mt-1 justify-center font-bold text-brand-600')}
                            >
                              {o.kind === 'recent' && <Clock className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />}
                              {o.kind === 'suggestion' && <Search className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />}
                              {o.kind === 'product' && o.image && <SafeImage src={o.image} alt="" width={96} ratio={1} wrapperClassName="h-11 w-11 shrink-0 rounded-lg" />}
                              <span className="min-w-0 flex-1 truncate text-fg">
                                {o.kind === 'all' ? o.label : <Highlight text={o.label} query={q} />}
                              </span>
                              {o.meta && <span className={cn('shrink-0 text-xs', o.kind === 'product' ? 'font-bold text-fg' : 'text-fg-subtle')}>{o.meta}</span>}
                              {(o.kind === 'recent' || o.kind === 'suggestion') && <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-fg-subtle rtl:-scale-x-100" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

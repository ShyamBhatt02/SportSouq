import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Moon, Package, Search, ShoppingBag, Sun, User, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUI } from '@/context/UIContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { useScrolled } from '@/hooks/useMisc';
import { SPORTS } from '@/data/sports';
import { CATEGORY_MAP } from '@/data/categories';
import { ANNOUNCEMENTS } from '@/data/content';
import { Logo } from '@/components/common/Logo';
import { SportIcon } from '@/components/common/SportIcon';
import { SafeImage } from '@/components/ui/SafeImage';
import { Dropdown } from '@/components/ui/Dropdown';
import { initials } from '@/utils/format';
import { cn } from '@/utils/cn';
import { SearchBox } from './SearchBox';

export function AnnouncementBar() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4500);
    return () => window.clearInterval(id);
  }, [paused]);
  return (
    <div className="bg-ink-950 text-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
        <p className="hidden items-center gap-1.5 text-ink-300 lg:flex">
          <Zap className="h-3.5 w-3.5 text-volt-400" aria-hidden="true" /> {t.delivery.sameDayDubai}
        </p>
        <div className="relative h-full flex-1 overflow-hidden lg:max-w-md" aria-label="Store announcements">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center text-center font-semibold tracking-wide"
            >
              {ANNOUNCEMENTS[index]}
            </motion.p>
          </AnimatePresence>
        </div>
        <nav aria-label="Utility" className="hidden items-center gap-4 text-ink-300 lg:flex">
          <Link to="/account/orders" className="hover:text-white">Track order</Link>
          <Link to="/contact" className="hover:text-white">Help</Link>
          <span className="cursor-default text-ink-500" title="Arabic coming soon" lang="ar">العربية</span>
        </nav>
      </div>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.4 }}
      animate={{ scale: [1.35, 1] }}
      transition={{ duration: 0.35 }}
      className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-surface"
      aria-hidden="true"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
}

const iconBtn = 'relative flex h-9 w-9 items-center justify-center rounded-xl text-fg transition hover:bg-surface-muted min-[360px]:h-10 min-[360px]:w-10';

function SportsMegaMenu({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const groups = [CATEGORY_MAP.sportswear, CATEGORY_MAP['sports-shoes']];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full z-40 border-b border-line bg-surface shadow-lift"
    >
      <div className="container-page grid grid-cols-12 gap-8 py-8">
        <div className="col-span-6">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-fg-subtle">{t.nav.allSports}</p>
          <ul className="grid grid-cols-2 gap-1">
            {SPORTS.map((s) => (
              <li key={s.slug}>
                <Link to={'/sport/' + s.slug} onClick={onClose} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-muted">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-fg transition group-hover:bg-brand-600 group-hover:text-white">
                    <SportIcon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-fg">{s.name}</span>
                    <span className="block text-xs text-fg-subtle">{s.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3 space-y-6">
          {groups.map((c) => (
            <div key={c.slug}>
              <Link to={'/category/' + c.slug} onClick={onClose} className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-fg-subtle hover:text-fg">
                {c.name}
              </Link>
              <ul className="space-y-1.5">
                {c.subcategories.slice(0, 6).map((s) => (
                  <li key={s.slug}>
                    <Link to={'/category/' + c.slug + '?subcategory=' + s.slug} onClick={onClose} className="text-sm text-fg-muted hover:text-brand-600">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link to="/deals" onClick={onClose} className="group relative col-span-3 overflow-hidden rounded-2xl">
          <SafeImage src="runningGroup" alt="Runners at sunrise" width={500} ratio={1.15} wrapperClassName="h-full min-h-64" className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-volt-400">Up to 25% off</p>
            <p className="mt-1 font-display text-xl font-extrabold">Train More. Spend Less.</p>
            <p className="mt-1 text-sm text-ink-200">Shop this week’s deals →</p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export function Header() {
  const { t } = useI18n();
  const { user, isAdmin, logout } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const ui = useUI();
  const toast = useToast();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = usePreferences();
  const scrolled = useScrolled(40);
  const location = useLocation();
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => setMegaOpen(false), [location.pathname]);

  const nav = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/shop', label: t.nav.shop },
    { to: '/deals', label: t.nav.deals, accent: true },
    { to: '/new-arrivals', label: t.nav.newArrivals },
    { to: '/best-sellers', label: t.nav.bestSellers },
  ];

  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 150);
  };

  // Leave protected pages first so route guards don't bounce the user to /login.
  const onLogout = async () => {
    navigate('/');
    await logout();
    toast.info(t.auth.signedOut);
  };

  const themeToggle = (
    <button type="button" className={cn(iconBtn, 'hidden sm:flex')} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label={t.nav.theme}>
      {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );

  return (
    <header className={cn('sticky top-0 z-40 border-b bg-surface/95 backdrop-blur-md transition-shadow supports-[backdrop-filter]:bg-surface/85', scrolled ? 'border-line shadow-soft' : 'border-transparent')}>
      <div className="container-page flex h-16 items-center gap-2 lg:h-[72px] lg:gap-6">
        <button type="button" className={cn(iconBtn, '-ms-2 lg:hidden')} onClick={() => ui.setMobileNavOpen(true)} aria-label={t.nav.openMenu}>
          <Menu className="h-5.5 w-5.5" />
        </button>
        <Logo className="me-auto lg:me-0" />
        <div className="hidden max-w-xl flex-1 lg:block">
          <SearchBox />
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 lg:ms-auto">
          <button type="button" className={cn(iconBtn, 'lg:hidden')} onClick={() => ui.setSearchOpen(true)} aria-label={t.search.label}>
            <Search className="h-5 w-5" />
          </button>
          {themeToggle}
          {user ? (
            <Dropdown
              items={[
                { key: 'account', label: t.nav.myAccount, icon: <User className="h-4 w-4" />, onSelect: () => navigate('/account') },
                { key: 'orders', label: t.nav.myOrders, icon: <Package className="h-4 w-4" />, onSelect: () => navigate('/account/orders') },
                ...(isAdmin ? [{ key: 'admin', label: t.nav.admin, icon: <LayoutDashboard className="h-4 w-4" />, onSelect: () => navigate('/admin') }] : []),
                { key: 'logout', label: t.nav.signOut, icon: <LogOut className="h-4 w-4" />, onSelect: () => void onLogout(), danger: true },
              ]}
              header={
                <div className="mb-1 border-b border-line px-3 pb-3 pt-2">
                  <p className="truncate text-sm font-bold text-fg">{user.firstName} {user.lastName}</p>
                  <p className="truncate text-xs text-fg-subtle">{user.email}</p>
                </div>
              }
              trigger={(p) => (
                <button type="button" {...p} onClick={p.toggle} className={cn(iconBtn, 'hidden sm:flex')} aria-label={t.nav.account}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: user.avatarColor ?? '#141b2b' }}>
                    {initials(user.firstName + ' ' + user.lastName)}
                  </span>
                </button>
              )}
            />
          ) : (
            <Link to="/login" className={cn(iconBtn, 'hidden sm:flex')} aria-label={t.nav.signIn}>
              <User className="h-5 w-5" />
            </Link>
          )}
          <Link to="/wishlist" className={iconBtn} aria-label={t.nav.wishlist + (wishlist.count ? ', ' + wishlist.count + ' items' : '')}>
            <Heart className="h-5 w-5" />
            <CountBadge count={wishlist.count} />
          </Link>
          <button type="button" className={iconBtn} onClick={ui.openCart} aria-label={t.nav.cart + ', ' + t.common.items(cart.count)}>
            <ShoppingBag className="h-5 w-5" />
            <CountBadge count={cart.count} />
          </button>
        </div>
      </div>

      <nav aria-label="Main" className="relative hidden border-t border-line lg:block" onMouseLeave={scheduleClose}>
        <div className="container-page flex h-12 items-center gap-1">
          {nav.slice(0, 2).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-fg hover:bg-surface-muted')}>
              {n.label}
            </NavLink>
          ))}
          <button
            type="button"
            aria-expanded={megaOpen}
            aria-controls="sports-menu"
            onClick={() => setMegaOpen((v) => !v)}
            onMouseEnter={openMega}
            onKeyDown={(e) => e.key === 'Escape' && setMegaOpen(false)}
            className={cn('flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition', megaOpen || location.pathname.startsWith('/sport') ? 'text-brand-600 dark:text-brand-400' : 'text-fg hover:bg-surface-muted')}
          >
            {t.nav.sports}
            <ChevronDown className={cn('h-4 w-4 transition-transform', megaOpen && 'rotate-180')} aria-hidden="true" />
          </button>
          {nav.slice(2).map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'text-brand-600 dark:text-brand-400' : n.accent ? 'text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10' : 'text-fg hover:bg-surface-muted')}>
              {n.accent && <Zap className="me-1 inline h-3.5 w-3.5 -translate-y-px" aria-hidden="true" />}
              {n.label}
            </NavLink>
          ))}
          <div className="ms-auto flex items-center gap-5 text-xs font-medium text-fg-muted">
            {SPORTS.slice(0, 5).map((s) => (
              <Link key={s.slug} to={'/sport/' + s.slug} className="hidden items-center gap-1.5 hover:text-fg xl:flex">
                <SportIcon name={s.icon} className="h-4 w-4" />
                {s.name}
              </Link>
            ))}
          </div>
        </div>
        <div id="sports-menu" onMouseEnter={openMega}>
          <AnimatePresence>{megaOpen && <SportsMegaMenu onClose={() => setMegaOpen(false)} />}</AnimatePresence>
        </div>
      </nav>
    </header>
  );
}

import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, LayoutDashboard, LogIn, Moon, Package, Phone, Sun, User, Zap } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useI18n } from '@/i18n/I18nProvider';
import { SPORTS } from '@/data/sports';
import { SITE } from '@/config/site';
import { Drawer } from '@/components/ui/Overlay';
import { Logo } from '@/components/common/Logo';
import { SportIcon } from '@/components/common/SportIcon';
import { cn } from '@/utils/cn';
import { SearchBox } from './SearchBox';

export function MobileNav() {
  const { t } = useI18n();
  const { mobileNavOpen, setMobileNavOpen } = useUI();
  const { user, isAdmin } = useAuth();
  const { resolvedTheme, setTheme } = usePreferences();
  const close = () => setMobileNavOpen(false);

  const primary = [
    { to: '/', label: t.nav.home },
    { to: '/shop', label: t.nav.shop },
    { to: '/deals', label: t.nav.deals, accent: true },
    { to: '/new-arrivals', label: t.nav.newArrivals },
    { to: '/best-sellers', label: t.nav.bestSellers },
    { to: '/category/sportswear', label: 'Sportswear' },
    { to: '/category/sports-shoes', label: 'Sports Shoes' },
  ];

  return (
    <Drawer open={mobileNavOpen} onClose={close} side="left" widthClass="max-w-[22rem]" title={<Logo animate={false} />}>
      <div className="flex flex-col gap-6 p-5">
        <nav aria-label="Mobile">
          <ul className="space-y-0.5">
            {primary.map((n, i) => (
              <motion.li key={n.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  onClick={close}
                  className={({ isActive }) => cn('flex items-center justify-between rounded-xl px-3 py-3 text-base font-semibold', isActive ? 'bg-surface-muted text-brand-600' : n.accent ? 'text-brand-600' : 'text-fg hover:bg-surface-muted')}
                >
                  <span className="flex items-center gap-2">
                    {n.accent && <Zap className="h-4 w-4" aria-hidden="true" />}
                    {n.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-fg-subtle rtl:rotate-180" aria-hidden="true" />
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-fg-subtle">{t.nav.sports}</p>
          <ul className="grid grid-cols-2 gap-2">
            {SPORTS.map((s) => (
              <li key={s.slug}>
                <Link to={'/sport/' + s.slug} onClick={close} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-fg hover:border-fg">
                  <SportIcon name={s.icon} className="h-4.5 w-4.5 text-brand-600" />
                  <span className="truncate">{s.slug === 'boxing' ? 'Boxing' : s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1 border-t border-line pt-5">
          {user ? (
            <>
              <Link to="/account" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface-muted">
                <User className="h-4.5 w-4.5" aria-hidden="true" /> {t.nav.myAccount}
              </Link>
              <Link to="/account/orders" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface-muted">
                <Package className="h-4.5 w-4.5" aria-hidden="true" /> {t.nav.myOrders}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface-muted">
                  <LayoutDashboard className="h-4.5 w-4.5" aria-hidden="true" /> {t.nav.admin}
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface-muted">
              <LogIn className="h-4.5 w-4.5" aria-hidden="true" /> {t.nav.signIn}
            </Link>
          )}
          <Link to="/wishlist" onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface-muted">
            <Heart className="h-4.5 w-4.5" aria-hidden="true" /> {t.nav.wishlist}
          </Link>
          <button type="button" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface-muted">
            {resolvedTheme === 'dark' ? <Sun className="h-4.5 w-4.5" aria-hidden="true" /> : <Moon className="h-4.5 w-4.5" aria-hidden="true" />}
            {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <a href={'tel:' + SITE.supportPhone.replace(/\s/g, '')} className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 text-sm">
          <Phone className="h-5 w-5 text-brand-600" aria-hidden="true" />
          <span>
            <span className="block font-semibold text-fg">{SITE.supportPhone}</span>
            <span className="block text-xs text-fg-subtle">{SITE.hours}</span>
          </span>
        </a>
      </div>
    </Drawer>
  );
}

export function MobileSearch() {
  const { searchOpen, setSearchOpen } = useUI();
  const { t } = useI18n();
  return (
    <Drawer open={searchOpen} onClose={() => setSearchOpen(false)} side="bottom" title={t.search.title}>
      <div className="min-h-[60dvh] px-5 py-4">
        <SearchBox autoFocus variant="overlay" onNavigate={() => setSearchOpen(false)} />
      </div>
    </Drawer>
  );
}

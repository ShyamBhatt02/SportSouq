import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Boxes, FolderTree, LayoutDashboard, Menu, MessageSquare, Moon, Package, ShoppingCart, Store, Sun, TicketPercent, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useI18n } from '@/i18n/I18nProvider';
import { Logo } from '@/components/common/Logo';
import { Drawer } from '@/components/ui/Overlay';
import { AnimatedOutlet, ScrollManager, SkipLink } from '@/components/layout/MainLayout';
import { initials } from '@/utils/format';
import { cn } from '@/utils/cn';

export function AdminLayout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: '/admin', label: t.admin.dashboard, icon: LayoutDashboard, end: true },
    { to: '/admin/analytics', label: t.admin.analytics, icon: BarChart3 },
    { to: '/admin/orders', label: t.admin.orders, icon: ShoppingCart },
    { to: '/admin/products', label: t.admin.products, icon: Package },
    { to: '/admin/inventory', label: t.admin.inventory, icon: Boxes },
    { to: '/admin/categories', label: t.admin.categories, icon: FolderTree },
    { to: '/admin/customers', label: t.admin.customers, icon: Users },
    { to: '/admin/coupons', label: t.admin.coupons, icon: TicketPercent },
    { to: '/admin/reviews', label: t.admin.reviews, icon: MessageSquare },
  ];

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white')}>
          <l.icon className="h-4.5 w-4.5" aria-hidden="true" />
          {l.label}
        </NavLink>
      ))}
      <Link to="/" className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-ink-300 hover:text-white">
        <Store className="h-4.5 w-4.5" aria-hidden="true" /> {t.admin.backToStore}
      </Link>
    </nav>
  );

  const current = links.find((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)));

  return (
    <div className="min-h-dvh bg-surface-muted/50 lg:grid lg:grid-cols-[256px_1fr]">
      <ScrollManager />
      <SkipLink />
      <aside className="sticky top-0 hidden h-dvh flex-col bg-ink-950 p-5 lg:flex">
        <Logo inverted to="/admin" />
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-volt-400">Admin console</p>
        <div className="mt-8 flex-1 overflow-y-auto">{nav}</div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface-muted lg:hidden" aria-label={t.nav.openMenu}>
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-bold text-fg">{current?.label ?? t.admin.title}</p>
          <p className="ms-3 hidden rounded-full bg-warning-50 px-3 py-1 text-[11px] font-semibold text-warning-600 md:block dark:bg-warning-500/10">{t.admin.demoNotice}</p>
          <div className="ms-auto flex items-center gap-2">
            <button type="button" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="flex h-10 w-10 items-center justify-center rounded-xl text-fg hover:bg-surface-muted" aria-label={t.nav.theme}>
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user && (
              <span className="flex items-center gap-2 text-sm font-semibold text-fg">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-white dark:bg-white dark:text-ink-950">{initials(user.firstName + ' ' + user.lastName)}</span>
                <span className="hidden sm:inline">{user.firstName}</span>
              </span>
            )}
          </div>
        </header>
        <main id="main" tabIndex={-1} className="p-4 focus:outline-none sm:p-6 lg:p-8">
          <AnimatedOutlet />
        </main>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" widthClass="max-w-xs" title={<Logo animate={false} to="/admin" />}>
        <div className="min-h-full bg-ink-950 p-4">{nav}</div>
      </Drawer>
    </div>
  );
}

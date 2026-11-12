import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, MapPin, Package, Settings, ShieldAlert, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { formatDate, initials } from '@/utils/format';
import { InlineAlert } from '@/components/ui/States';
import { cn } from '@/utils/cn';

export function AccountLayout() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const denied = (location.state as { denied?: boolean } | null)?.denied;
  if (!user) return null;

  const links = [
    { to: '/account', label: t.account.dashboard, icon: LayoutDashboard, end: true },
    { to: '/account/orders', label: t.account.orders, icon: Package },
    { to: '/account/profile', label: t.account.profile, icon: User },
    { to: '/account/addresses', label: t.account.addresses, icon: MapPin },
    { to: '/account/wishlist', label: t.account.wishlist, icon: Heart },
    { to: '/account/settings', label: t.account.settings, icon: Settings },
  ];

  // Leave protected pages first so route guards don't bounce the user to /login.
  const onLogout = async () => {
    navigate('/');
    await logout();
    toast.info(t.auth.signedOut);
  };

  return (
    <div className="container-page py-8 pb-16">
      {denied && (
        <InlineAlert tone="warning" className="mb-6" icon={<ShieldAlert className="h-4 w-4" />}>
          The admin dashboard requires an administrator account. Sign in as admin@sportsouq.ae to explore it.
        </InlineAlert>
      )}
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside aria-label={t.account.title}>
          <div className="flex items-center gap-3 rounded-3xl bg-ink-950 p-5 text-white">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold" style={{ backgroundColor: user.avatarColor ?? '#d43b0c' }}>
              {initials(user.firstName + ' ' + user.lastName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold">{t.account.hello(user.firstName)}</p>
              <p className="truncate text-xs text-ink-400">{t.account.memberSince(formatDate(user.createdAt))}</p>
            </div>
          </div>
          <nav className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                    isActive ? 'bg-brand-600 text-white lg:bg-surface-muted lg:text-brand-600' : 'bg-surface-muted text-fg hover:bg-surface-sunken lg:bg-transparent lg:hover:bg-surface-muted',
                  )
                }
              >
                <l.icon className="h-4.5 w-4.5" aria-hidden="true" />
                {l.label}
              </NavLink>
            ))}
            <button type="button" onClick={onLogout} className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-danger-600 transition hover:bg-danger-50 dark:hover:bg-danger-500/10">
              <LogOut className="h-4.5 w-4.5" aria-hidden="true" /> {t.nav.signOut}
            </button>
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

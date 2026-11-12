import { Monitor, Moon, Sun } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRecentlyViewed, useRecentSearches } from '@/hooks/useRecentlyViewed';
import { useSeo } from '@/hooks/useSeo';
import { useI18n } from '@/i18n/I18nProvider';
import { authService } from '@/services/authService';
import { getErrorMessage } from '@/services/api/client';
import { Switch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { EmirateSelect } from '@/components/product/ProductDetails';
import { cn } from '@/utils/cn';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <h2 className="text-lg font-bold text-fg">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function SettingsPage() {
  const { t } = useI18n();
  const { preferences, update, setTheme, setEmirate } = usePreferences();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const recent = useRecentlyViewed();
  const searches = useRecentSearches();
  useSeo({ title: t.account.settings, noindex: true });

  const setMarketing = async (v: boolean) => {
    update({ newsletter: v });
    if (!user) return;
    try {
      const updated = await authService.updateProfile({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, marketingOptIn: v });
      setUser(updated);
      toast.success('Preferences saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const themes = [
    { key: 'light', label: t.account.themeLight, icon: Sun },
    { key: 'dark', label: t.account.themeDark, icon: Moon },
    { key: 'system', label: t.account.themeSystem, icon: Monitor },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-fg">{t.account.settings}</h1>
      <Card title={t.account.appearance}>
        <div role="radiogroup" aria-label={t.account.appearance} className="grid grid-cols-3 gap-3">
          {themes.map((th) => (
            <button key={th.key} role="radio" type="button" aria-checked={preferences.theme === th.key} onClick={() => setTheme(th.key)} className={cn('flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-semibold transition', preferences.theme === th.key ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-line-strong text-fg hover:border-fg')}>
              <th.icon className="h-5 w-5" aria-hidden="true" />
              {th.label}
            </button>
          ))}
        </div>
      </Card>
      <Card title={t.account.preferences}>
        <div>
          <p className="mb-2 text-sm font-medium text-fg">{t.account.defaultEmirate}</p>
          <EmirateSelect id="settings-emirate" value={preferences.emirate} onChange={(e) => { setEmirate(e); toast.success('Delivery emirate updated'); }} className="max-w-xs" />
        </div>
        <div>
          <p className="text-sm font-medium text-fg">{t.account.language}</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-canvas">English</span>
            <span className="cursor-not-allowed rounded-xl border border-line px-4 py-2 text-sm font-semibold text-fg-subtle" lang="ar" title="Coming soon">العربية</span>
          </div>
          <p className="mt-1 text-xs text-fg-subtle">{t.account.languageNote}</p>
        </div>
      </Card>
      <Card title={t.account.notifications}>
        <Switch label={t.account.orderUpdates} description="Dispatch, out-for-delivery and delivered alerts" checked={preferences.orderUpdates} onChange={(v) => update({ orderUpdates: v })} />
        <Switch label={t.account.newsletter} description="At most two emails a week. Unsubscribe anytime." checked={user?.marketingOptIn ?? preferences.newsletter} onChange={setMarketing} />
      </Card>
      <Card title={t.account.privacy}>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => { recent.clear(); toast.success(t.account.clearHistoryDone); }} disabled={!recent.ids.length}>
            {t.account.clearHistory} ({recent.ids.length})
          </Button>
          <Button variant="outline" onClick={() => { searches.clear(); toast.success('Search history cleared'); }} disabled={!searches.terms.length}>
            Clear search history ({searches.terms.length})
          </Button>
        </div>
        <p className="text-xs text-fg-subtle">SportSouq never stores card numbers. Your password is stored only as a salted hash.</p>
      </Card>
    </div>
  );
}

import { Suspense, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { PageSpinner } from '@/components/ui/Spinner';
import { AnnouncementBar, Header } from './Header';
import { MobileNav, MobileSearch } from './MobileNav';
import { Footer } from './Footer';

/** Scroll to top on navigation (but not when only filters/search params change). */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

/**
 * Enter-only page transition keyed by pathname. Deliberately no exit phase:
 * an exiting page would keep rendering against the *new* location, letting
 * stale route guards fire redirects (e.g. login → /account instead of ?redirect).
 */
export function AnimatedOutlet() {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  return (
    <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
      <Suspense fallback={<PageSpinner />}>{outlet}</Suspense>
    </motion.div>
  );
}

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main" className="sr-only z-[100] rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
      {t.nav.skipToContent}
    </a>
  );
}

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      <SkipLink />
      <AnnouncementBar />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <AnimatedOutlet />
      </main>
      <Footer />
      <CartDrawer />
      <MobileNav />
      <MobileSearch />
      <ProductQuickView />
    </div>
  );
}

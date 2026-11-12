import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { I18nProvider } from '@/i18n/I18nProvider';
import { PreferencesProvider, usePreferences } from '@/context/PreferencesContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Toaster } from '@/components/ui/Toaster';
import { getErrorStatus } from '@/services/api/client';
import { router } from '@/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        const status = getErrorStatus(error);
        if (status && status >= 400 && status < 500) return false;
        return count < 2;
      },
    },
  },
});

function LocalisedApp() {
  const { preferences } = usePreferences();
  return (
    <I18nProvider locale={preferences.locale}>
      <ToastProvider>
        <AuthProvider>
          <UIProvider>
            <WishlistProvider>
              <CartProvider>
                <MotionConfig reducedMotion="user">
                  <RouterProvider router={router} />
                  <Toaster />
                </MotionConfig>
              </CartProvider>
            </WishlistProvider>
          </UIProvider>
        </AuthProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <LocalisedApp />
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

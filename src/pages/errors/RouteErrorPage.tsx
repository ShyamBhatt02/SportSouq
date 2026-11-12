import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

/**
 * Last-resort boundary for render errors. Deliberately dependency-light (no
 * context hooks) so it still renders if a provider is what failed.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : undefined;
  const isChunkError = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);
  if (import.meta.env.DEV) console.error(error);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold text-fg">{status === 404 ? 'Page not found' : isChunkError ? 'A new version is available' : 'Something went wrong'}</h1>
      <p className="mt-2 max-w-md text-sm text-fg-muted">
        {isChunkError ? 'Please reload the page to get the latest version of SportSouq.' : 'We hit an unexpected problem loading this page. Please try again — your bag and wishlist are safe.'}
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reload
        </button>
        <a href={import.meta.env.BASE_URL} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong px-5 text-sm font-semibold text-fg hover:bg-surface-muted">
          <Home className="h-4 w-4" aria-hidden="true" /> Home
        </a>
      </div>
    </div>
  );
}

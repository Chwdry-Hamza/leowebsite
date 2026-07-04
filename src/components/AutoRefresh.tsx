'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Re-pulls the current route's server content when this tab regains focus, so
 * CMS edits published while you were in the CMS tab appear without a manual
 * reload. Uses router.refresh() — it re-renders the server components in place
 * (no full page reload; scroll position and client state are preserved) and,
 * because the backend already purged the ISR cache for the changed path on
 * publish (see leo-backend's revalidate.service.ts), the refetch returns the
 * fresh content.
 *
 * Focus-only by design: it fires when the tab becomes visible/focused, never on
 * an interval, so it adds no recurring load for public visitors. Disabled inside
 * the CMS live-preview iframe (?preview=1), which has its own postMessage-based
 * live update and must not be reset by a refresh.
 */
export default function AutoRefresh() {
  const router = useRouter();
  const lastRefresh = useRef(0);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === '1') {
      return;
    }

    const refresh = () => {
      // `focus` and `visibilitychange` can both fire for a single tab switch —
      // coalesce so we only re-render once.
      const now = Date.now();
      if (now - lastRefresh.current < 1000) return;
      lastRefresh.current = now;
      router.refresh();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router]);

  return null;
}

'use client';

import * as React from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const CONSENT_GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
} as const;

const CONSENT_DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const;

/**
 * Pushes a Consent Mode v2 *update* whenever the visitor makes (or changes)
 * a cookie-banner choice during the session. The consent *default* (denied)
 * and the returning-visitor upgrade are set by the server-rendered bootstrap
 * script in ConsentedAnalytics — this component only reacts to live changes.
 */
export default function ConsentUpdater() {
  const consent = useCookieConsent();

  React.useEffect(() => {
    if (consent !== 'accepted' && consent !== 'declined') return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== 'function') return;
    w.gtag('consent', 'update', consent === 'accepted' ? CONSENT_GRANTED : CONSENT_DENIED);
  }, [consent]);

  return null;
}

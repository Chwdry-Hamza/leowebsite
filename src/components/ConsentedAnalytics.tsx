'use client';

import * as React from 'react';
import Script from 'next/script';
import { COOKIE_CONSENT_STORAGE_KEY, useCookieConsent } from '@/hooks/useCookieConsent';

/**
 * Google Consent Mode v2 loader for GA4 + GTM (client-side).
 *
 * Industry-standard Consent Mode v2 pattern (Google's own guidance):
 *
 *   1. Consent defaults to DENIED for every storage type *before* any Google
 *      tag runs (the bootstrap script below).
 *   2. GA4 + the GTM container load on every page regardless of the banner.
 *      While consent is denied, Google tags self-throttle into cookieless
 *      "ping" mode — no cookies, no identifiers — keeping us GDPR-compliant
 *      while still letting Google model conversions from non-consenting users.
 *   3. When the visitor clicks Accept we push a consent *update* to "granted"
 *      and the tags upgrade to full tracking. Decline keeps everything denied.
 *
 * Container/measurement IDs come from the CMS `analytics` setting (resolved
 * server-side in PerformanceScripts) and are passed in as props.
 */

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

export default function ConsentedAnalytics({
  ga4Id,
  gtmId,
}: {
  ga4Id?: string;
  gtmId?: string;
}) {
  const consent = useCookieConsent();

  // Push a consent *update* whenever the visitor makes (or changes) a choice
  // during the session. 'ssr'/'pending' leave the denied default in place.
  React.useEffect(() => {
    if (consent !== 'accepted' && consent !== 'declined') return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== 'function') return;
    w.gtag('consent', 'update', consent === 'accepted' ? CONSENT_GRANTED : CONSENT_DENIED);
  }, [consent]);

  if (!ga4Id && !gtmId) return null;

  // Single self-contained bootstrap so nothing depends on cross-<Script>
  // execution order: define dataLayer + gtag, set the denied consent default,
  // upgrade returning accepted visitors, then configure GA4.
  const bootstrap = [
    `window.dataLayer = window.dataLayer || [];`,
    `function gtag(){dataLayer.push(arguments);}`,
    `window.gtag = gtag;`,
    `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`,
    `try{if(localStorage.getItem('${COOKIE_CONSENT_STORAGE_KEY}')==='accepted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}`,
    ga4Id ? `gtag('js',new Date());gtag('config','${ga4Id}');` : ``,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <>
      {/* Consent Mode v2 bootstrap + GA4 config */}
      <Script id="leo-analytics-bootstrap" strategy="afterInteractive">
        {bootstrap}
      </Script>

      {/* GA4 (gtag.js) library — drains the dataLayer queue above */}
      {ga4Id && (
        <Script
          id="leo-ga4-src"
          src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          strategy="afterInteractive"
        />
      )}

      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <Script id="leo-gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="gtm"
            />
          </noscript>
        </>
      )}
    </>
  );
}

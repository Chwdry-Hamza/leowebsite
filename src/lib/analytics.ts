import { COOKIE_CONSENT_STORAGE_KEY } from './consent';

/**
 * Build the inline analytics init: Consent Mode v2 default (denied),
 * returning-visitor upgrade, the GTM `gtm.start` marker, and GA4 config.
 *
 * The gtag.js and gtm.js LIBRARIES are rendered separately as
 * `<script async src>` tags (React 19 hoists them into <head>, satisfying the
 * requirement that GA4 + GTM appear in <head> site-wide). This init script only
 * seeds the dataLayer + consent so those libraries have what they need when
 * they execute; it does NOT inject the libraries itself.
 */
export function buildAnalyticsBootstrap(ga4Id: string, gtmId: string): string {
  return [
    `window.dataLayer = window.dataLayer || [];`,
    `function gtag(){dataLayer.push(arguments);}`,
    `window.gtag = gtag;`,
    `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`,
    `try{if(localStorage.getItem('${COOKIE_CONSENT_STORAGE_KEY}')==='accepted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}}catch(e){}`,
    gtmId ? `window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});` : ``,
    ga4Id ? `gtag('js',new Date());gtag('config','${ga4Id}');` : ``,
  ]
    .filter(Boolean)
    .join('\n');
}

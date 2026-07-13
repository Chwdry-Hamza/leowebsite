/**
 * Cookie-consent storage keys — plain module (NO 'use client') so these
 * constants can be imported from BOTH server and client code.
 *
 * Importing a value from a 'use client' module into a Server Component does
 * not give you the value — it gives a client-reference stub. Interpolating
 * that stub into a server-rendered inline script produces broken JS, which
 * silently kills the GA4/GTM bootstrap. Keep these here.
 */
export const COOKIE_CONSENT_STORAGE_KEY = 'leo-cookie-consent';
export const COOKIE_CONSENT_COOKIE_NAME = 'leo_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'leo-consent-change';

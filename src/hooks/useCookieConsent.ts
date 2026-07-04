'use client';

import { useSyncExternalStore } from 'react';

export const COOKIE_CONSENT_STORAGE_KEY = 'leo-cookie-consent';
export const COOKIE_CONSENT_COOKIE_NAME = 'leo_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'leo-consent-change';
const SSR_SENTINEL = '__ssr__';

export type ConsentChoice = 'accepted' | 'declined';
export type ConsentState = ConsentChoice | 'pending' | 'ssr';

function subscribe(callback: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function getServerSnapshot(): string {
  return SSR_SENTINEL;
}

/**
 * Returns the current consent state.
 *   - 'ssr'      → initial render before hydration
 *   - 'pending'  → user hasn't made a choice yet
 *   - 'accepted' → user clicked Accept (analytics may upgrade to full tracking)
 *   - 'declined' → user clicked Decline (analytics stays in cookieless mode)
 *
 * Re-renders any consumer when the state changes — including across tabs
 * (via the storage event) and same-tab (via a custom event we dispatch from
 * persistCookieConsent).
 */
export function useCookieConsent(): ConsentState {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (stored === SSR_SENTINEL) return 'ssr';
  if (stored === 'accepted' || stored === 'declined') return stored;
  return 'pending';
}

/**
 * Persist the visitor's choice and broadcast the change to every consumer in
 * this tab. Writes to localStorage (for the hook to read on next mount) and
 * also to a cookie (for any server-side consent-aware code that may grow
 * later). 180-day max-age matches industry-standard consent retention.
 */
export function persistCookieConsent(choice: ConsentChoice) {
  const maxAge = 60 * 60 * 24 * 180;
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
  } catch {
    /* localStorage blocked — cookie still set below */
  }
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${choice}; path=/; max-age=${maxAge}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }));
}

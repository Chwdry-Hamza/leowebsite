'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  persistCookieConsent,
  type ConsentChoice,
} from '@/hooks/useCookieConsent';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored = '';
    try {
      stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? '';
    } catch {}
    if (!stored) {
      const t = window.setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setMounted(true));
      }, 600);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.documentElement.classList.add('leo-consent-active');
    return () => {
      document.documentElement.classList.remove('leo-consent-active');
    };
  }, [visible]);

  // Persist the choice via the shared hook — that broadcasts to every
  // consumer (ConsentedAnalytics, etc.) via a CustomEvent so analytics
  // upgrades to full tracking on Accept without a page reload.
  const persist = (value: ConsentChoice) => {
    persistCookieConsent(value);
    setMounted(false);
    window.setTimeout(() => setVisible(false), 280);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 z-[2147483647] bottom-4 md:bottom-5 lg:bottom-6 xl:bottom-8 px-4 md:px-4 lg:px-6 pointer-events-none"
    >
      <div
        className={`pointer-events-auto mx-auto w-full max-w-[300px] md:max-w-[860px] lg:max-w-[1020px] xl:max-w-[1180px] rounded-2xl border border-[rgba(111,227,255,0.18)] bg-[rgba(10,21,39,0.6)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)] px-3 py-6 md:px-5 md:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12 flex items-center gap-3 md:gap-4 lg:gap-6 transition-all duration-300 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <p className="flex-1 min-w-0 text-[12px] md:text-sm lg:text-[15px] leading-[1.4] text-[#EAF4FF]/80 m-0">
          We use cookies to enhance your experience.{' '}
          <Link
            href="/privacy-policy"
            className="text-cyan-300 underline-offset-4 hover:underline"
          >
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => persist('declined')}
            className="rounded-[10px] border border-cyan-300/20 bg-white/[0.04] px-3 py-1.5 md:px-4 md:py-2 lg:px-[18px] lg:py-2.5 text-[11px] md:text-xs lg:text-sm font-semibold leading-none text-[#EAF4FF] hover:bg-white/[0.08] transition-colors whitespace-nowrap"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => persist('accepted')}
            className="rounded-[10px] bg-cyan-300 text-navy-950 px-3 py-1.5 md:px-4 md:py-2 lg:px-[22px] lg:py-3 text-[11px] md:text-xs lg:text-sm font-semibold leading-none hover:bg-cyan-200 transition-colors whitespace-nowrap"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

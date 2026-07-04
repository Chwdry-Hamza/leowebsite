import Script from 'next/script';
import { cms } from '@/lib/cms';
import type { PagePerformance } from '@/lib/cms';
import ConsentedAnalytics from './ConsentedAnalytics';

/**
 * Renders the global analytics + custom scripts on a per-page basis.
 *
 *   - Each leaf page mounts <PerformanceScripts perf={page.performance} />.
 *     If the page has no CMS row (e.g. /search, /about), pass `undefined`.
 *   - When the page sets skipAnalytics / skipCustomScripts in its CMS
 *     performance config, the corresponding scripts are simply not rendered
 *     for that route.
 *   - GA4 + GTM are loaded via <ConsentedAnalytics>, which uses Google Consent
 *     Mode v2: tags fire on every page but stay in cookieless "ping" mode
 *     until the visitor clicks Accept on the cookie banner. This is the
 *     GDPR-compliant pattern Google itself recommends.
 *
 * Custom header/body/footer scripts stay server-rendered here — they may be
 * functional (chat widgets, etc.) rather than analytics. Any *tracking* tags
 * an editor adds inside GTM must themselves respect consent (Consent Mode-aware
 * tags or a consent trigger).
 */
type AnalyticsSettings = {
  ga4Id?: string;
  gtmId?: string;
  headerScript?: string;
  bodyScript?: string;
  footerScript?: string;
};

export async function PerformanceScripts({ perf }: { perf?: PagePerformance | null }) {
  const skipAnalytics     = perf?.skipAnalytics === true;
  const skipCustomScripts = perf?.skipCustomScripts === true;

  // Short-circuit when everything is off — saves a backend round-trip.
  if (skipAnalytics && skipCustomScripts) return null;

  const settings = await cms.getSetting<AnalyticsSettings>('analytics');
  if (!settings) return null;

  return (
    <>
      {/* GA4 + GTM with Google Consent Mode v2 (cookieless until Accept) */}
      {!skipAnalytics && (
        <ConsentedAnalytics ga4Id={settings.ga4Id} gtmId={settings.gtmId} />
      )}

      {/* Custom header / body / footer scripts from CMS Analytics settings.
          Editors can paste raw <script> contents (no surrounding tag needed
          — Next.js Script handles that). */}
      {!skipCustomScripts && settings.headerScript?.trim() && (
        <Script id="cms-header-script" strategy="beforeInteractive">
          {settings.headerScript}
        </Script>
      )}
      {!skipCustomScripts && settings.bodyScript?.trim() && (
        <Script id="cms-body-script" strategy="afterInteractive">
          {settings.bodyScript}
        </Script>
      )}
      {!skipCustomScripts && settings.footerScript?.trim() && (
        <Script id="cms-footer-script" strategy="lazyOnload">
          {settings.footerScript}
        </Script>
      )}
    </>
  );
}

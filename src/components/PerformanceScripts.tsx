import type { PagePerformance } from '@/lib/cms';

/**
 * Deprecated shim. GA4 + GTM are now rendered SITE-WIDE from the root layout
 * (see ConsentedAnalytics in app/layout.tsx) so both tags land in <head> on
 * every page. This component is kept as a no-op so the existing per-page mounts
 * (`<PerformanceScripts perf={...} />`) keep compiling without edits.
 *
 * Note: the previous per-page `performance.skipAnalytics` / `skipCustomScripts`
 * overrides no longer apply — analytics is intentionally global now, per the
 * requirement that GA4/GTM load in <head> on every page. Custom header/body/
 * footer snippets are authored via CMS → SEO → Code (the CodeInjection feature).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PerformanceScripts(_props: { perf?: PagePerformance | null }) {
  return null;
}

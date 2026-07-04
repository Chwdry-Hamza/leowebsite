/**
 * Fires a fire-and-forget POST to the backend's /api/logs-404/record endpoint
 * whenever the website renders a 404.
 *
 * Why server-side: we want to log every miss, including ones from bots and
 * Lighthouse — a client-side ping would miss those. The downside is that
 * fetch from a Server Component runs on every request, so we'd over-count.
 * The backend deduplicates by URL via an upsert with $inc on `hits`, so
 * each unique URL still produces a single row no matter how often it's hit.
 *
 * We swallow all errors silently — a logging failure should never break the
 * 404 page render.
 */
const API_URL = process.env.LEO_API_URL ?? 'http://localhost:4000';

const ALLOW_BOT_AGENTS = false;
const BOT_REGEX = /bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot/i;

export async function logMissingUrl(opts: {
  url: string;
  /** Used only locally to filter out bots; never sent to the backend. */
  userAgent?: string;
}): Promise<void> {
  try {
    // Skip junk URLs (probe scans for /wp-admin, etc.) to keep the log clean.
    if (!opts.url || opts.url.length > 2000) return;
    if (!ALLOW_BOT_AGENTS && opts.userAgent && BOT_REGEX.test(opts.userAgent)) return;

    await fetch(`${API_URL}/api/logs-404/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: opts.url }),
      cache: 'no-store',
      // Never let a slow/unreachable CMS hang the logging call.
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    /* swallow — never break the user's 404 page */
  }
}

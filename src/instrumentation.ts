/**
 * Next.js instrumentation hook — runs ONCE on server boot (Node runtime only).
 *
 * For every hand-built static route, fire `cms.ensurePageRegistered()` so the
 * page appears in spay-cms / leo-cms immediately as SEO-editable, without
 * waiting for the first visitor. The CMS backend uses `$setOnInsert` so this
 * is idempotent — it never overwrites SEO that an admin has already set.
 *
 * Failures (CMS down, registration disabled, bad secret) are swallowed by
 * `ensurePageRegistered` itself — server boot is never blocked.
 */
export async function register() {
  // Edge runtime can't talk to the backend (no Node fetch options like timeouts /
  // signal aborts), and middleware runs on edge. Skip there.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Dynamic import so this module's effects only run when register() executes
  // (otherwise Next would try to bundle these for the edge runtime too).
  const { cms } = await import('./lib/cms');
  const { STATIC_ROUTES } = await import('./lib/static-routes');

  // Fire in parallel — each call has a 2.5s timeout inside `ensurePageRegistered`
  // and is fire-and-forget, so this completes in ≤2.5s in the worst case.
  await Promise.all(
    STATIC_ROUTES.map((r) =>
      cms.ensurePageRegistered(r.slug, r.title, r.template).catch(() => undefined),
    ),
  );
}

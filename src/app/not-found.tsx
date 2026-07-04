import Link from 'next/link';
import { headers } from 'next/headers';
import { after } from 'next/server';
import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { logMissingUrl } from '@/lib/log-404';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you\'re looking for has moved or no longer exists.',
  // index:false keeps the 404 out of search, but follow:true lets link equity
  // from the page's nav links still flow to real pages/posts.
  robots: { index: false, follow: true },
};

/**
 * Routes that are always valid. Next renders the not-found boundary as a
 * fallback even on SUCCESSFUL pages that read dynamic `headers()` — so without
 * this guard valid routes (notably the homepage `/`) get logged as a 404 on
 * every visit, polluting the CMS 404 log. We skip logging for these.
 */
const ALWAYS_VALID = new Set<string>([
  '/', '/about', '/support', '/blog', '/search',
  '/card-terms', '/privacy-policy', '/e-sign-consent', '/prohibited-activities',
]);

function isAlwaysValid(path: string): boolean {
  const p = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return ALWAYS_VALID.has(p);
}

/**
 * Custom 404 page.
 *
 * Server component: on every render we fire-and-forget a /api/logs-404/record
 * to the backend with the URL, referer, and UA so editors can see what
 * visitors are searching for and fix it with a one-click redirect from the
 * CMS → 404 Logs page.
 *
 * Implementation note: `notFound()` in App Router doesn't expose the
 * originally requested path — we have to read it from the `x-invoked-path`
 * header (or fall back to `referer`), which we populate via middleware below.
 */
export default async function NotFound() {
  const h = await headers();
  const requestedPath = h.get('x-leo-original-path') || h.get('x-invoke-path') || '';
  const userAgent = h.get('user-agent') || '';

  if (requestedPath && !isAlwaysValid(requestedPath)) {
    // Defer past response flush via `after()` so logging never delays the 404
    // render. `userAgent` is used only locally inside logMissingUrl to filter
    // bots; it isn't sent.
    after(() => logMissingUrl({ url: requestedPath, userAgent }));
  }

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <NavBar />

      <section className="relative pt-12 sm:pt-16 pb-20 md:pb-28">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'Page not found' }]} />
          </div>

          <div className="flex flex-col items-start max-w-2xl">
            <p className="font-display text-xs font-medium tracking-[0.28em] uppercase text-[#B8C8E2] mb-4">
              ERROR 404
            </p>
            <div className="font-display font-bold text-cyan-300/[0.08] text-[clamp(140px,22vw,260px)] leading-none tracking-tighter -ml-2 select-none pointer-events-none">
              404
            </div>
            <h1 className="font-display font-bold text-[clamp(36px,4.6vw,60px)] leading-[1.05] tracking-[-0.02em] text-white -mt-6 sm:-mt-10 mb-5">
              This page <em className="not-italic text-cyan-300">doesn't exist</em>.
            </h1>
            <p className="text-[15px] md:text-[17px] leading-[1.6] text-fg-2 mb-8">
              {requestedPath ? (
                <>
                  We couldn't find <code className="font-mono text-fg-1 px-1.5 py-0.5 rounded bg-surface border border-line">{requestedPath}</code>.
                  It may have moved, been renamed, or never existed.
                </>
              ) : (
                <>The page you're looking for has moved or no longer exists.</>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-11 px-5 rounded-leo-md bg-cyan-300 text-navy-950 font-display font-semibold text-sm hover:bg-cyan-200 transition-colors"
              >
                Back to home
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center h-11 px-5 rounded-leo-md border border-line text-fg-1 font-display font-semibold text-sm hover:border-cyan-300/40 hover:text-cyan-300 transition-colors"
              >
                Read the blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

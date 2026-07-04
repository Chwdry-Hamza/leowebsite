import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.LEO_API_URL ?? 'http://localhost:4000';
// Short server-side window so deleting/editing a redirect in the CMS takes
// effect within a few seconds rather than up to a minute.
const CACHE_TTL_MS = 10_000;

type RedirectRow = { _id: string; from: string; to: string };
type CrawlSettings = {
  noindexSearch: boolean;
  noindexTags: boolean;
  noindexFiltered: boolean;
};

// Fail-safe: if the CMS crawl endpoint is unreachable, keep thin/duplicate URLs
// out of the index (all toggles on) rather than letting them be crawled.
const DEFAULT_CRAWL: CrawlSettings = {
  noindexSearch: true, noindexTags: true, noindexFiltered: true,
};

/** Strip a trailing slash (except root) so '/x' and '/x/' match the same row. */
function normalize(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

/**
 * Match the site's `trailingSlash: true` canonical form on a relative redirect
 * target so the 301 lands on the final URL directly — without it the visitor
 * gets a 301 followed by a 308 (Next adding the slash), an avoidable chain.
 * External URLs and file-looking paths are left untouched.
 */
function toCanonicalTarget(target: string): string {
  if (/^https?:\/\//i.test(target)) return target;
  const splitAt = target.search(/[?#]/);
  const path = splitAt === -1 ? target : target.slice(0, splitAt);
  const suffix = splitAt === -1 ? '' : target.slice(splitAt);
  if (path === '/' || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path)) return target;
  return `${path}/${suffix}`;
}

let cache: { items: RedirectRow[]; expires: number } | null = null;
let crawlCache: { value: CrawlSettings; expires: number } | null = null;

async function getRedirects(): Promise<RedirectRow[]> {
  if (cache && cache.expires > Date.now()) return cache.items;
  try {
    const res = await fetch(`${API_URL}/api/redirects/all.json`, { cache: 'no-store' });
    if (!res.ok) return cache?.items ?? [];
    const data = await res.json() as { items: RedirectRow[] };
    cache = { items: data.items, expires: Date.now() + CACHE_TTL_MS };
    return data.items;
  } catch {
    return cache?.items ?? [];
  }
}

async function getCrawlSettings(): Promise<CrawlSettings> {
  if (crawlCache && crawlCache.expires > Date.now()) return crawlCache.value;
  try {
    const res = await fetch(`${API_URL}/api/public/settings/crawl`, { cache: 'no-store' });
    if (!res.ok) return crawlCache?.value ?? DEFAULT_CRAWL;
    const data = await res.json();
    const value = { ...DEFAULT_CRAWL, ...(data ?? {}) } as CrawlSettings;
    crawlCache = { value, expires: Date.now() + CACHE_TTL_MS };
    return value;
  } catch {
    return crawlCache?.value ?? DEFAULT_CRAWL;
  }
}

/**
 * Returns the X-Robots-Tag policy to emit for this URL, or null when the
 * page should index normally.
 *
 *   Search pages get `noindex, follow` — they shouldn't appear in results
 *   but links from them (to real pages/posts) should still pass authority.
 *
 *   Tag, filtered, and extra-pattern matches get `noindex, nofollow` —
 *   these tend to be thin or filter-state URLs where neither indexing
 *   nor link-following adds anything for SEO.
 */
function noindexPolicy(pathname: string, search: URLSearchParams, crawl: CrawlSettings): string | null {
  const p = normalize(pathname);
  // Keep `follow` on every category so link equity flows to real pages/posts,
  // and treat each toggle as on unless explicitly false (matches the CMS).
  // Search pages — /search or any URL carrying ?q=
  if (crawl.noindexSearch !== false) {
    if (p === '/search' || p.startsWith('/search/') || search.has('q')) return 'noindex, follow';
  }
  // Tag archives — /tag/*, /blog/tag/*, plus the bare /tag and /blog/tag.
  if (crawl.noindexTags !== false) {
    if (
      p.startsWith('/tag/') || p.startsWith('/tags/') ||
      p.startsWith('/blog/tag/') || p.startsWith('/blog/tags/') ||
      p === '/tag' || p === '/blog/tag'
    ) return 'noindex, follow';
  }
  // Filtered / faceted URLs — any URL with at least one query param.
  if (crawl.noindexFiltered !== false && Array.from(search.keys()).length > 0) {
    return 'noindex, follow';
  }
  return null;
}

function matchRedirect(items: RedirectRow[], pathname: string): RedirectRow | null {
  const target = normalize(pathname);
  return items.find((r) => normalize(r.from) === target) ?? null;
}

export async function middleware(req: NextRequest) {
  const { pathname, origin, searchParams } = req.nextUrl;

  // Skip Next internals + assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const items = await getRedirects();
  const match = matchRedirect(items, pathname);
  if (match) {
    // 301 Moved Permanently — passes link equity and is what SEO tooling expects.
    const canonical = toCanonicalTarget(match.to);
    const dest = /^https?:\/\//i.test(canonical) ? canonical : new URL(canonical, origin);
    const redirectRes = NextResponse.redirect(dest, 301);
    // Keep the 301 (SEO-permanent) but stop browsers from caching it forever —
    // otherwise deleting the redirect in the CMS appears to have no effect.
    redirectRes.headers.set('Cache-Control', 'no-store, max-age=0');
    return redirectRes;
  }

  // Crawler controls — search / tag / filtered URL patterns get an X-Robots-Tag
  const crawl = await getCrawlSettings();
  // Forward the original requested path so the not-found.tsx page can read it
  // (Next App Router doesn't expose it any other way) and log the 404 to the CMS.
  const forwardHeaders = new Headers(req.headers);
  forwardHeaders.set('x-leo-original-path', pathname + (req.nextUrl.search ?? ''));

  const res = NextResponse.next({ request: { headers: forwardHeaders } });
  const policy = noindexPolicy(pathname, searchParams, crawl);
  if (policy) {
    res.headers.set('X-Robots-Tag', policy);
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};

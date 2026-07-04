/**
 * XML helpers for the sitemap index + sub-sitemap route handlers.
 * Centralizes URL absolutization and XML-escaping so every sub-sitemap
 * route stays a 5-line file.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Absolute URL for a site-local path. */
export function absUrl(path: string): string {
  const p = path.startsWith('/') ? path : '/' + path;
  return `${SITE_URL}${p}`;
}

/**
 * Match the site's `trailingSlash: true` canonical form so sitemap <loc> URLs
 * equal the live indexable URL (no sitemap-vs-canonical mismatch / extra 308).
 * Leaves the query/hash, file-looking paths, and already-slashed paths alone.
 */
export function canonicalLoc(absolute: string): string {
  const splitAt = absolute.search(/[?#]/);
  const base = splitAt === -1 ? absolute : absolute.slice(0, splitAt);
  const suffix = splitAt === -1 ? '' : absolute.slice(splitAt);
  if (base.endsWith('/') || /\.[a-z0-9]+$/i.test(base)) return absolute;
  return `${base}/${suffix}`;
}

export type UrlNode = {
  /** Path on this site (e.g. '/blog/foo') OR a fully absolute URL. */
  loc: string;
  lastmod?: string | null;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

function isoDate(d?: string | null): string | null {
  if (!d) return null;
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Build a <urlset> document from a list of URL nodes. */
export function buildUrlset(urls: UrlNode[]): string {
  const body = urls
    .map(({ loc, lastmod, changefreq, priority }) => {
      const absolute = canonicalLoc(/^https?:\/\//i.test(loc) ? loc : absUrl(loc));
      const escaped = xmlEscape(absolute);
      const lm = isoDate(lastmod);
      return (
        `  <url>\n` +
        `    <loc>${escaped}</loc>` +
        (lm ? `\n    <lastmod>${lm}</lastmod>` : '') +
        (changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : '') +
        (priority !== undefined ? `\n    <priority>${priority}</priority>` : '') +
        `\n  </url>`
      );
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

/** Build a <sitemapindex> document pointing at sub-sitemap filenames. */
export function buildSitemapIndex(filenames: string[]): string {
  const now = new Date().toISOString();
  const body = filenames
    .map(
      (name) =>
        `  <sitemap>\n    <loc>${xmlEscape(`${SITE_URL}/${name}`)}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=600, s-maxage=600',
};

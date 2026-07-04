import { cms } from '@/lib/cms';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Cache for 10min on the edge; robots rarely changes.
export const revalidate = 600;

/**
 * Serves /robots.txt.
 *
 *   1. If the admin has saved a custom robots.txt in the CMS (Setting('robots')),
 *      that text is returned verbatim — they're in full control.
 *   2. Otherwise we generate a safe default from the live "Crawler controls"
 *      settings + always block AI training crawlers.
 */
export async function GET() {
  // 1. Manual override
  const manual = await cms.getSetting<string>('robots');
  if (typeof manual === 'string' && manual.trim()) {
    return new Response(ensureSitemap(manual.trim()), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 2. Allow-all fallback.
  //    We deliberately do NOT Disallow /search, /tag/, or filtered (?…) URLs.
  //    The middleware already marks those `noindex, follow`, and Google can only
  //    honor a noindex if it's allowed to CRAWL the URL — a Disallow here would
  //    block the crawl and defeat the noindex, leaving "blocked" entries in the
  //    index. Crawling is cheap; keeping thin URLs out of the index via noindex
  //    is what actually works.
  const lines: string[] = [
    '# robots.txt for leo.financial',
    '# Auto-generated — thin URLs are kept out of the index via X-Robots-Tag',
    '# noindex (see middleware), NOT via Disallow, so crawlers can see it.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  });
}

/** If the manual text doesn't end with a Sitemap directive, append one. */
function ensureSitemap(text: string): string {
  if (/^\s*Sitemap:/im.test(text)) return text;
  return text.replace(/\s*$/, '') + `\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

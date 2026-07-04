/**
 * Pages sitemap — CMS Page rows that are:
 *   - status === 'published'
 *   - seo.noindex !== true
 *
 * The home page ('/') is intentionally excluded here because it's already
 * in sitemap-static.xml. We only emit a URL once across the whole index.
 */
import { cms } from '@/lib/cms';
import { buildUrlset, XML_HEADERS } from '@/lib/sitemap';

export const revalidate = 60;

export async function GET() {
  const data = await cms.getSitemapPages();
  const items = (data?.items ?? []).filter((p) => p.slug !== '/');

  const xml = buildUrlset(
    items.map((p) => ({
      loc: p.slug.startsWith('/') ? p.slug : `/${p.slug}`,
      lastmod: p.updatedAt,
      changefreq: 'monthly',
      priority: 0.6,
    })),
  );

  return new Response(xml, { headers: XML_HEADERS });
}

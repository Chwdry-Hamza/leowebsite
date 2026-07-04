/**
 * Posts sitemap — CMS Post rows that are:
 *   - status === 'published'
 *   - seo.noindex !== true
 */
import { cms } from '@/lib/cms';
import { buildUrlset, XML_HEADERS } from '@/lib/sitemap';

export const revalidate = 60;

export async function GET() {
  const data = await cms.getSitemapPosts();
  const items = data?.items ?? [];

  const xml = buildUrlset(
    items.map((p) => ({
      loc: `/blog/${p.slug}`,
      lastmod: p.updatedAt,
      changefreq: 'weekly',
      priority: 0.7,
    })),
  );

  return new Response(xml, { headers: XML_HEADERS });
}

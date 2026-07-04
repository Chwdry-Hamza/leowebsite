/**
 * Categories sitemap — one URL per Category landing page (page 1 only).
 */
import { cms } from '@/lib/cms';
import { buildUrlset, XML_HEADERS } from '@/lib/sitemap';

export const revalidate = 60;

export async function GET() {
  const data = await cms.getSitemapCategories();
  const items = data?.items ?? [];

  const xml = buildUrlset(
    items.map((c) => ({
      loc: `/blog/category/${c.slug}`,
      lastmod: c.updatedAt,
      changefreq: 'weekly',
      priority: 0.5,
    })),
  );

  return new Response(xml, { headers: XML_HEADERS });
}

/**
 * Sitemap index — points search engines at the per-content-type sitemaps.
 *
 *   /sitemap.xml          ← this file (the index)
 *   /sitemap-static.xml   ← home, /blog
 *   /sitemap-pages.xml    ← CMS Pages (published, indexable)
 *   /sitemap-posts.xml    ← CMS Posts (published, indexable)
 *   /sitemap-categories.xml ← CMS Categories
 */
import { buildSitemapIndex, XML_HEADERS } from '@/lib/sitemap';

export const revalidate = 60;

export async function GET() {
  const xml = buildSitemapIndex([
    'sitemap-static.xml',
    'sitemap-pages.xml',
    'sitemap-posts.xml',
    'sitemap-categories.xml',
  ]);

  return new Response(xml, { headers: XML_HEADERS });
}

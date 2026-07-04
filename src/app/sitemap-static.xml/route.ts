/**
 * Static URL sitemap — hand-built routes that aren't backed by CMS rows.
 * Home + blog index live here. CMS pages/posts/categories are in their
 * dedicated sub-sitemaps so each URL appears exactly once.
 */
import { buildUrlset, XML_HEADERS } from '@/lib/sitemap';

export const revalidate = 60;

export async function GET() {
  const now = new Date().toISOString();
  const xml = buildUrlset([
    { loc: '/',      lastmod: now, changefreq: 'weekly', priority: 1.0 },
    { loc: '/blog',  lastmod: now, changefreq: 'daily',  priority: 0.8 },
  ]);

  return new Response(xml, { headers: XML_HEADERS });
}

import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { cms } from '@/lib/cms';
import { buildMetadataFromCMS } from '@/lib/cms-meta';
import {
  buildArticleJsonLd, buildFaqJsonLd, buildServiceJsonLd, parseCustomJsonLd,
  serializeJsonLd, type Organization,
} from '@/lib/structured-data';
import { TiptapRenderer } from '@/components/TiptapRenderer';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PerformanceScripts } from '@/components/PerformanceScripts';
import CodeInjection from '@/components/CodeInjection';
import { STATIC_SLUGS } from '@/lib/static-routes';

export const revalidate = 60; // ISR fallback (CMS also triggers on-demand revalidation)

type RouteParams = { slug: string };

/**
 * Collision guard — a CMS Page with a slug like `/about` must not shadow
 * the hand-built `/about` route. Next.js' file-based routing already gives
 * static routes priority, but the catch-all `[slug]` page can still be hit
 * for nested paths or via SSR data fetches; this short-circuits there too.
 */
function isStatic(slug: string): boolean {
  const withSlash = slug.startsWith('/') ? slug : '/' + slug;
  return STATIC_SLUGS.has(withSlash);
}

async function resolvePage(slug: string) {
  // Try '/slug' first (canonical), fall back to bare 'slug' for legacy data
  return (await cms.getPageBySlug('/' + slug)) ?? (await cms.getPageBySlug(slug));
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;
  if (isStatic(slug)) return { title: 'Not found' };
  const page = await resolvePage(slug);
  if (!page) return { title: 'Not found' };

  // The live path for this catch-all is just /<slug>. buildMetadataFromCMS
  // handles canonical (auto-fallback), robots, OG image (with featured-image fallback),
  // Twitter image, and keyword propagation in one place.
  const base = await buildMetadataFromCMS(page, '/' + slug);

  // Article-style timestamps for CMS-managed content
  return {
    ...base,
    openGraph: {
      ...(base.openGraph ?? {}),
      type: 'article',
      publishedTime: page.publishedAt ?? undefined,
      modifiedTime: page.updatedAt ?? undefined,
    },
    other: {
      ...((base.other ?? {}) as Record<string, string>),
      'article:modified_time': page.updatedAt ?? '',
    },
  };
}

export default async function CMSPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  if (isStatic(slug)) notFound();
  const page = await resolvePage(slug);
  if (!page) notFound();

  const perf = page.performance;
  if (perf?.disableCache) noStore();

  const updated = page.updatedAt ? new Date(page.updatedAt) : null;

  const org = await cms.getSetting<Organization>('organization');
  const pageLd = await buildPageLevelSchema(page, org ?? undefined);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <CodeInjection code={page?.codeInjection} slots={['header', 'body']} />
      <NavBar />

      {pageLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageLd) }}
        />
      ) : null}

      <section className="relative pt-12 sm:pt-16 pb-12 md:pb-20">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: page.title }]} />
          </div>
          <p className="font-display text-xs font-medium tracking-[0.28em] uppercase text-[#B8C8E2] mb-[22px]">
            {page.template || 'Page'}
          </p>
          <h1 className="font-display font-bold text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] text-white m-0 mb-6">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="text-[15px] md:text-[17px] leading-[1.6] text-fg-2 max-w-2xl mb-6">{page.excerpt}</p>
          )}
          {updated && (
            <p className="text-xs text-fg-4">
              Last updated{' '}
              <time dateTime={updated.toISOString()}>
                {updated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </p>
          )}
        </div>
      </section>

      <section className="relative pb-24 md:pb-32">
        <article className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 leo-article">
          <TiptapRenderer doc={page.content} />
        </article>
      </section>

      <Footer />
      <PerformanceScripts perf={perf} />
      <CodeInjection code={page?.codeInjection} slots={['footer']} />
    </main>
  );
}

/**
 * Dispatches on `page.schema.type` to build the right JSON-LD shape:
 *   none     → falls back to a basic WebPage entry so the page still has
 *              SOME structured data
 *   article  → Article (with org as publisher)
 *   faq      → FAQPage from Q&A list
 *   service  → Service (with org as provider)
 *   custom   → pass-through user JSON
 */
async function buildPageLevelSchema(page: any, org?: Organization) {
  const schema = page.schema;
  if (!schema || schema.type === 'none' || !schema.type) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      headline: page.title,
      description: page.seo?.description || page.excerpt || undefined,
      url: `https://leo.financial${page.slug.startsWith('/') ? page.slug : '/' + page.slug}`,
      datePublished: page.publishedAt ? new Date(page.publishedAt).toISOString() : undefined,
      dateModified: page.updatedAt ? new Date(page.updatedAt).toISOString() : undefined,
      inLanguage: 'en-US',
    };
  }
  switch (schema.type) {
    case 'article':
      return buildArticleJsonLd({
        type: 'Article',
        title: page.title,
        description: page.seo?.description || page.excerpt || undefined,
        url: page.slug.startsWith('/') ? page.slug : '/' + page.slug,
        image: page.featuredImage?.url,
        authorName: page.authorName,
        datePublished: page.publishedAt,
        dateModified: page.updatedAt,
        org,
      });
    case 'faq':
      return buildFaqJsonLd(schema.faq);
    case 'service':
      return buildServiceJsonLd(schema.service, page.title, page.excerpt, org);
    case 'custom':
      return parseCustomJsonLd(schema.customJsonLd);
    default:
      return null;
  }
}

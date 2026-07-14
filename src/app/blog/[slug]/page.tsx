import Link from 'next/link';
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
import { Breadcrumbs, type Crumb } from '@/components/Breadcrumbs';
import { PerformanceScripts } from '@/components/PerformanceScripts';
import CodeInjection from '@/components/CodeInjection';

export const revalidate = 60;

type RouteParams = { slug: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await cms.getPostBySlug(slug);
  if (!post) return { title: 'Not found' };

  // /blog/<slug> is the live path. buildMetadataFromCMS handles canonical
  // auto-fallback, OG image chain (cover/coverMedia → featured), and Twitter image.
  const base = await buildMetadataFromCMS(post, `/blog/${slug}`);

  return {
    ...base,
    openGraph: {
      ...(base.openGraph ?? {}),
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      tags: post.tags,
    },
    other: {
      ...((base.other ?? {}) as Record<string, string>),
      'article:modified_time': post.updatedAt ?? '',
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const post = await cms.getPostBySlug(slug);
  if (!post) notFound();

  // Per-page performance hooks. Opting out of the cache is per-render — we
  // call noStore() here so the module-level `revalidate = 60` is bypassed for
  // this specific page when the editor checks "Disable caching".
  const perf = post.performance;
  if (perf?.disableCache) noStore();

  // Intrinsic BlogPosting + any extra page-level schema configured in the CMS.
  const org = await cms.getSetting<Organization>('organization');
  const articleLd = buildArticleJsonLd({
    type: 'BlogPosting',
    title: post.title,
    description: post.seo?.description || post.excerpt || undefined,
    url: `/blog/${post.slug}`,
    image: post.cover || undefined,
    authorName: post.authorName,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    keywords: post.tags,
    category: post.categoryName,
    org: org ?? undefined,
  });
  const extraLd = buildExtraSchema(post.schema, post.title, post.excerpt, org ?? undefined);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <CodeInjection code={post?.codeInjection} slots={['body']} />
      <NavBar />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
      />
      {extraLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(extraLd) }}
        />
      ) : null}

      <section className="relative pt-10 sm:pt-16 pb-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="mb-6">
            <Breadcrumbs items={buildPostCrumbs(post)} />
          </div>
          {post.categoryName && (
            <p className="font-display text-xs font-medium tracking-[0.28em] uppercase text-cyan-300 mb-4">
              {post.categoryName}
            </p>
          )}
          <h1 className="font-display font-bold text-[clamp(32px,4.5vw,56px)] leading-[1.1] tracking-[-0.02em] text-white m-0 mb-8">
            {post.title}
          </h1>
        </div>

      </section>

      <section className="relative pb-24 md:pb-32">
        <article className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 leo-article">
          <TiptapRenderer doc={post.content} />
        </article>

        {post.tags?.length > 0 && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-6">
              <span className="text-sm text-fg-3">Tags:</span>
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/blog/tag/${encodeURIComponent(t)}`}
                  className="rounded-full px-3 py-1 text-xs font-mono text-cyan-300 border border-cyan-300/25 bg-cyan-300/[0.06] hover:opacity-80 transition-opacity"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
      <PerformanceScripts perf={perf} />
      <CodeInjection code={post?.codeInjection} slots={['footer']} />
    </main>
  );
}

/**
 * Builds the page-level extra JSON-LD declared in the CMS:
 *   - article  → emits a generic Article JSON-LD (note: posts already emit
 *                BlogPosting intrinsically, so this is mostly used for static
 *                pages; we just pass through here for completeness)
 *   - faq      → FAQPage
 *   - service  → Service
 *   - custom   → user JSON, validated by parseCustomJsonLd
 * Returns null when nothing is configured (or invalid).
 */
function buildExtraSchema(
  schema: any,
  fallbackName: string,
  fallbackDescription: string,
  org?: Organization,
) {
  if (!schema || schema.type === 'none' || !schema.type) return null;
  switch (schema.type) {
    case 'faq':     return buildFaqJsonLd(schema.faq);
    case 'service': return buildServiceJsonLd(schema.service, fallbackName, fallbackDescription, org);
    case 'custom':  return parseCustomJsonLd(schema.customJsonLd);
    case 'article': return null; // posts already emit BlogPosting above
    default:        return null;
  }
}

function buildPostCrumbs(post: any): Crumb[] {
  const trail: Crumb[] = [{ label: 'Blog', href: '/blog' }];
  // If the post belongs to a category, link it as the middle crumb.
  const categorySlug =
    typeof post.category === 'object' && post.category?.slug ? post.category.slug : null;
  const categoryName: string =
    (typeof post.category === 'object' && post.category?.name) || post.categoryName || '';
  if (categorySlug && categoryName) {
    trail.push({ label: categoryName, href: `/blog/category/${categorySlug}` });
  }
  trail.push({ label: post.title });
  return trail;
}

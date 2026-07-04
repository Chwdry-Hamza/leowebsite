import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cms } from '@/lib/cms';
import { buildListingMetadata } from '@/lib/cms-meta';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { PostGrid } from '@/components/PostGrid';
import { Pagination } from '@/components/Pagination';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PerformanceScripts } from '@/components/PerformanceScripts';

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp?.page);
  const data = await cms.getCategoryBySlug(slug, page);
  if (!data) return { title: 'Category not found' };

  const { category, totalPages } = data;
  return await buildListingMetadata({
    baseTitle:       category.name,
    baseDescription: category.description || `Posts categorized under ${category.name}.`,
    basePath:        `/blog/category/${category.slug}`,
    page,
    totalPages,
    seo:             category.seo,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp?.page);

  const data = await cms.getCategoryBySlug(slug, page);
  if (!data) notFound();

  const { category, items: posts, total, totalPages, limit } = data;
  const paragraphs = (category.content ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <NavBar />

      <section className="relative pt-12 sm:pt-16 pb-10 md:pb-14">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Blog', href: '/blog' },
                { label: page > 1 ? `${category.name} — Page ${page}` : category.name },
              ]}
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span
              className="size-2.5 rounded-full"
              style={{ background: category.color }}
            />
            <p className="font-display text-xs font-medium tracking-[0.28em] uppercase text-[#B8C8E2]">
              CATEGORY · {total} post{total === 1 ? '' : 's'}
            </p>
          </div>

          <h1 className="font-display font-bold text-[clamp(36px,4.6vw,60px)] leading-[1.05] tracking-[-0.02em] text-white mt-4 mb-5">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-[15px] md:text-[17px] leading-[1.6] text-fg-2 max-w-2xl">
              {category.description}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div className="mt-6 max-w-2xl space-y-3">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm md:text-[15px] text-fg-3 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative pb-24 md:pb-32">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <PostGrid posts={posts} />
          <Pagination basePath={`/blog/category/${category.slug}`} page={page} totalPages={totalPages} />
          {total > 0 && (
            <p className="text-center text-xs text-fg-4 mt-6">
              Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total} posts
            </p>
          )}
        </div>
      </section>

      <Footer />
      <PerformanceScripts perf={undefined} />
    </main>
  );
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

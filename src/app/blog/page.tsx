import Link from 'next/link';
import type { Metadata } from 'next';
import { cms } from '@/lib/cms';
import { buildListingMetadata } from '@/lib/cms-meta';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { PostGrid } from '@/components/PostGrid';
import { Pagination } from '@/components/Pagination';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import BlogSearchBar from '@/components/BlogSearchBar';
import { PerformanceScripts } from '@/components/PerformanceScripts';

export const revalidate = 60;

const POSTS_PER_PAGE = 12;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp?.page);
  const data = await cms.listPosts({ limit: POSTS_PER_PAGE, page });
  const totalPages = data?.totalPages ?? 1;

  return await buildListingMetadata({
    baseTitle:       'Blog',
    baseDescription: "Founders' notes, product launches, and a quiet rebellion against confusing money.",
    basePath:        '/blog',
    page,
    totalPages,
  });
}

export default async function BlogIndex({ searchParams }: Props) {
  const sp = await searchParams;
  const page = parsePage(sp?.page);

  const [data, catData] = await Promise.all([
    cms.listPosts({ limit: POSTS_PER_PAGE, page }),
    cms.listCategories(),
  ]);
  const posts = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const categories = (catData?.items ?? []).filter((c) => c.postCount > 0);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <NavBar />

      <section className="relative pt-12 sm:pt-16 pb-12 md:pb-16">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: page > 1 ? `Blog — Page ${page}` : 'Blog' }]} />
          </div>
          <h1 className="font-display font-bold text-[clamp(40px,5.2vw,68px)] leading-[1.05] tracking-[-0.02em] text-white m-0 mb-6">
            What we're <em className="not-italic text-cyan-300">thinking</em>.
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.6] text-fg-2 max-w-2xl">
            Founders' notes, product launches, and a quiet rebellion against confusing money.
          </p>

          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-display font-semibold tracking-[0.18em] uppercase text-fg-4 mr-1">Browse:</span>
              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/blog/category/${c.slug}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line text-xs text-fg-2 hover:border-cyan-300/40 hover:text-cyan-300 transition-colors"
                >
                  <span className="size-1.5 rounded-full" style={{ background: c.color }} />
                  {c.name}
                  <span className="text-fg-4">·</span>
                  <span className="text-fg-4 tabular-nums">{c.postCount}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative pb-24 md:pb-32">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <BlogSearchBar />
          <PostGrid posts={posts} />
          <Pagination basePath="/blog" page={page} totalPages={totalPages} />
          {total > 0 && (
            <p className="text-center text-xs text-fg-4 mt-6">
              Showing {Math.min((page - 1) * POSTS_PER_PAGE + 1, total)}–{Math.min(page * POSTS_PER_PAGE, total)} of {total} posts
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

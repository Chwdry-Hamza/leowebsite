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

const POSTS_PER_PAGE = 12;

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
};

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { tag } = await params;
  const sp = await searchParams;
  const page = parsePage(sp?.page);
  const label = decodeURIComponent(tag);
  const [data, crawl] = await Promise.all([
    cms.listPosts({ limit: POSTS_PER_PAGE, page, tag }),
    cms.getSetting<{ noindexTags?: boolean; noindexSearch?: boolean }>('crawl'),
  ]);
  const totalPages = data?.totalPages ?? 1;

  const meta = await buildListingMetadata({
    baseTitle:       `Posts tagged "${label}"`,
    baseDescription: `All LEO articles tagged ${label}.`,
    basePath:        `/blog/tag/${tag}`,
    page,
    totalPages,
  });

  // Respect the "Noindex tag pages" crawl setting (defaults to noindex).
  return {
    ...meta,
    robots: { index: !(crawl?.noindexTags !== false), follow: true },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const sp = await searchParams;
  const page = parsePage(sp?.page);
  const label = decodeURIComponent(tag);

  const data = await cms.listPosts({ limit: POSTS_PER_PAGE, page, tag });
  const posts = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const basePath = `/blog/tag/${tag}`;

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <NavBar />

      <section className="relative pt-12 sm:pt-16 pb-12 md:pb-16">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Blog', href: '/blog' },
                { label: page > 1 ? `#${label} — Page ${page}` : `#${label}` },
              ]}
            />
          </div>
          <p className="font-display text-xs font-medium tracking-[0.28em] uppercase text-[#B8C8E2] mb-4">
            TAG · {total} {total === 1 ? 'post' : 'posts'}
          </p>
          <h1 className="font-display font-bold text-[clamp(36px,4.6vw,60px)] leading-[1.05] tracking-[-0.02em] text-white m-0 mb-4">
            Posts tagged <em className="not-italic text-cyan-300">#{label}</em>
          </h1>
        </div>
      </section>

      <section className="relative pb-24 md:pb-32">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <PostGrid posts={posts} />
          <Pagination basePath={basePath} page={page} totalPages={totalPages} />
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

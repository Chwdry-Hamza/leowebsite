import Link from 'next/link';
import type { Metadata } from 'next';
import { Search as SearchIcon, FileText, Newspaper } from 'lucide-react';
import { cms, type CMSSearchHit } from '@/lib/cms';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';

/**
 * Internal search results page.
 *
 *   SEO posture:
 *     - <meta robots="noindex, follow"> via Metadata API below
 *     - Same `noindex, follow` is also set by middleware (X-Robots-Tag header)
 *       for the path `/search` and for any URL carrying `?q=` — so even if a
 *       crawler hits a search variant via a stray link, it stays out of the
 *       index but still passes link authority through.
 *     - Excluded from sitemap by construction: only static + CMS pages/posts/
 *       categories are listed in sitemap-*.xml; /search has no CMS row and
 *       isn't in the static list.
 *     - Dynamic — no ISR, no cache, since the result list is the URL itself.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  // Respect the "Noindex search pages" crawl setting (defaults to noindex).
  // `follow` stays on so links are still crawled.
  const crawl = await cms.getSetting<{ noindexSearch?: boolean; noindexTags?: boolean }>('crawl');
  return {
    title: 'Search',
    description: 'Search the LEO blog and site.',
    robots: { index: !(crawl?.noindexSearch !== false), follow: true },
  };
}

type Props = { searchParams: Promise<{ q?: string }> };

const RESULT_LIMIT = 25;

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? '').trim().slice(0, 200);

  let items: CMSSearchHit[] = [];
  if (q) {
    try {
      const data = await cms.search(q, RESULT_LIMIT);
      items = data?.items ?? [];
    } catch {
      items = [];
    }
  }

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <NavBar />

      <section className="relative pt-12 sm:pt-16 pb-10 md:pb-14">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: q ? `Search — ${q}` : 'Search' }]} />
          </div>

          <p className="font-display text-xs font-medium tracking-[0.28em] uppercase text-[#B8C8E2] mb-4">
            SITE SEARCH
          </p>
          <h1 className="font-display font-bold text-[clamp(36px,4.6vw,60px)] leading-[1.05] tracking-[-0.02em] text-white m-0 mb-6">
            {q ? <>Results for <em className="not-italic text-cyan-300">"{q}"</em></> : 'What are you looking for?'}
          </h1>

          {/* GET form so the URL itself holds the query — required for the
              middleware noindex policy and so links to a search remain shareable. */}
          <form action="/search" method="get" className="max-w-2xl">
            <div className="flex items-center gap-2 rounded-leo-md border border-line bg-surface/40 focus-within:border-cyan-300/40 transition-colors">
              <SearchIcon className="size-4 text-fg-4 ml-3 shrink-0" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="e.g. stablecoins, compliance, cards"
                autoFocus={!q}
                className="flex-1 bg-transparent py-3 text-sm text-fg-1 placeholder:text-fg-4 outline-none border-0"
                maxLength={200}
              />
              <button
                type="submit"
                className="m-1 inline-flex items-center h-9 px-4 rounded-leo-sm bg-cyan-300 text-navy-950 text-sm font-display font-semibold hover:bg-cyan-200 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {q && (
            <p className="text-xs text-fg-4 mt-3 tabular-nums">
              {items.length === 0 ? 'No matches.' : `${items.length} match${items.length === 1 ? '' : 'es'}.`}
            </p>
          )}
        </div>
      </section>

      <section className="relative pb-24 md:pb-32">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8">
          {!q ? (
            <EmptyHint />
          ) : items.length === 0 ? (
            <NoResults q={q} />
          ) : (
            <ul className="divide-y divide-line border border-line rounded-leo-lg bg-surface/30 overflow-hidden">
              {items.map((hit) => (
                <SearchResult key={`${hit.kind}-${hit._id}`} hit={hit} q={q} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SearchResult({ hit, q }: { hit: { kind: 'page' | 'post'; _id: string; title: string; slug: string; excerpt: string; categoryName?: string }; q: string }) {
  const Icon = hit.kind === 'page' ? FileText : Newspaper;
  const href = hit.kind === 'page'
    ? (hit.slug.startsWith('/') ? hit.slug : '/' + hit.slug)
    : `/blog/${hit.slug}`;
  return (
    <li>
      <Link href={href} className="block p-5 hover:bg-cyan-300/[0.04] transition-colors group">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-leo-md border border-line bg-surface/60 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="size-4 text-cyan-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-display font-semibold tracking-[0.18em] text-fg-4">
                {hit.kind === 'page' ? 'Page' : 'Post'}
              </span>
              {hit.categoryName && (
                <>
                  <span className="text-fg-4">·</span>
                  <span className="text-[10px] uppercase font-display font-semibold tracking-[0.18em] text-cyan-300">{hit.categoryName}</span>
                </>
              )}
            </div>
            <p className="font-display font-bold text-lg text-white leading-snug group-hover:text-cyan-300 transition-colors">
              <Highlight text={hit.title} q={q} />
            </p>
            {hit.excerpt && (
              <p className="text-sm text-fg-3 leading-relaxed mt-1.5 line-clamp-2">
                <Highlight text={hit.excerpt} q={q} />
              </p>
            )}
            <p className="text-[11px] text-fg-4 font-mono mt-2 truncate">{href}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}

/** Bold the query inside the result title/excerpt. Plain text only — no HTML escaping needed since React handles it. */
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegex(q)})`, 'ig'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase()
          ? <mark key={i} className="bg-cyan-300/20 text-cyan-300 rounded-sm px-0.5">{part}</mark>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-leo-lg border border-dashed border-line p-10 text-center">
      <p className="text-fg-2 text-sm">
        Type a keyword above to search pages and posts.
      </p>
      <p className="text-fg-4 text-xs mt-2">
        Try <Link href="/search?q=stablecoins" className="text-cyan-300 hover:underline">stablecoins</Link>,{' '}
        <Link href="/search?q=compliance" className="text-cyan-300 hover:underline">compliance</Link>, or{' '}
        <Link href="/search?q=launch" className="text-cyan-300 hover:underline">launch</Link>.
      </p>
    </div>
  );
}

function NoResults({ q }: { q: string }) {
  return (
    <div className="rounded-leo-lg border border-dashed border-line p-10 text-center">
      <p className="text-fg-1 font-display font-semibold">No matches for "{q}".</p>
      <p className="text-fg-3 text-sm mt-2">
        Try a shorter or different keyword, or{' '}
        <Link href="/blog" className="text-cyan-300 hover:underline">browse the blog</Link>.
      </p>
    </div>
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

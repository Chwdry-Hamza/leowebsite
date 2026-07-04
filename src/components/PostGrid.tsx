import Link from 'next/link';
import type { CMSPost } from '@/lib/cms';

function tiptapText(node: any): string {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.content)) return node.content.map(tiptapText).join(' ');
  return '';
}

function readTimeFor(p: CMSPost): number {
  if (p.readTime && p.readTime > 0) return p.readTime;
  const text = `${tiptapText((p as any).content)} ${p.excerpt ?? ''}`.trim();
  if (!text) return 0;
  return Math.max(1, Math.round(text.split(/\s+/).length / 225));
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PostGrid({ posts }: { posts: CMSPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 rounded-leo-lg border border-dashed border-line">
        <p className="text-fg-1 font-display font-semibold">No posts to show.</p>
        <p className="text-fg-3 text-sm mt-2">Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {posts.map((p) => {
        return (
          <article
            key={p._id}
            className="group relative flex flex-col h-full rounded-leo-lg border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden transition-all duration-200 hover:border-cyan-300/40 hover:-translate-y-1"
          >
            {/* Whole-card link covers the card so the entire card is clickable. */}
            <Link
              href={`/blog/${p.slug}`}
              aria-label={p.title}
              className="absolute inset-0 z-0"
            />
            <div className="aspect-[16/9] relative overflow-hidden">
              {p.cover ? (
                <img src={p.cover} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/15 to-navy-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
            </div>
            <div className="relative z-10 p-5 flex-1 flex flex-col pointer-events-none">
              {p.categoryName && (
                <p className="text-[11px] font-display font-semibold tracking-[0.18em] uppercase text-cyan-300 mb-3">{p.categoryName}</p>
              )}
              <h2 className="font-display font-bold text-xl text-white leading-snug mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                {p.title}
              </h2>
              {p.excerpt && <p className="text-sm text-fg-2 leading-relaxed line-clamp-2">{p.excerpt}</p>}
              <div className="flex items-center gap-2 text-xs text-fg-4 mt-auto pt-4 border-t border-line">
                {(() => {
                  const date = formatDate(p.publishedAt);
                  const rt = readTimeFor(p);
                  return (
                    <>
                      {date && <time dateTime={p.publishedAt ?? undefined}>{date}</time>}
                      {date && rt > 0 ? <span aria-hidden>·</span> : null}
                      {rt > 0 ? <span>{rt} min read</span> : null}
                    </>
                  );
                })()}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

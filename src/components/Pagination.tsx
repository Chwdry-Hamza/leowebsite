import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Server-rendered numbered pagination.
 *
 * - Page 1 link uses the bare basePath (no `?page=`) — keeps the canonical
 *   URL tidy and avoids two URLs (`/blog` and `/blog?page=1`) competing
 *   in search results.
 * - Hides itself entirely when totalPages <= 1.
 * - Renders ellipses around long page ranges so a 50-page archive doesn't
 *   blow up the layout.
 */
export function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);
  const hrefFor = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-12">
      <PageLink
        href={hrefFor(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        rel="prev"
      >
        <ChevronLeft className="size-4" />
      </PageLink>

      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`gap-${idx}`} className="px-2 text-fg-4 text-sm">…</span>
        ) : (
          <PageLink
            key={p}
            href={hrefFor(p)}
            active={p === page}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </PageLink>
        ),
      )}

      <PageLink
        href={hrefFor(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        rel="next"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href, children, active, disabled, ...rest
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base = 'inline-flex items-center justify-center min-w-[34px] h-[34px] px-2 rounded-leo-sm text-sm font-medium border transition-colors';
  if (disabled) {
    return (
      <span className={`${base} border-line/40 text-fg-4 cursor-not-allowed`}>
        {children}
      </span>
    );
  }
  if (active) {
    return (
      <span className={`${base} border-cyan-300/60 bg-cyan-300/10 text-cyan-300`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`${base} border-line text-fg-2 hover:border-cyan-300/40 hover:text-cyan-300`} {...rest}>
      {children}
    </Link>
  );
}

/** [1, '…', 4, 5, 6, '…', 12] — shows current ± 1 plus first/last with gaps. */
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push('…');
  out.push(total);
  return out;
}

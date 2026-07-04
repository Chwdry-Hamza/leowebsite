import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export type Crumb = {
  label: string;
  /** When undefined, the crumb is the current page (rendered as plain text). */
  href?: string;
};

/**
 * Visible breadcrumb nav + matching BreadcrumbList JSON-LD.
 *
 * Pass the trail in order. The last item should NOT have an href — it's the
 * current page. Skip the leading "Home" entry; it's always rendered first.
 *
 * Examples:
 *   <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: 'Crypto' }]} />
 *   <Breadcrumbs items={[{ label: 'About' }]} />
 *
 * Why JSON-LD here too: Google uses BreadcrumbList structured data to render
 * the path-style breadcrumb in search results instead of the bare URL — much
 * higher click-through.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const full: Crumb[] = [{ label: 'Home', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: full.map((c, i) => {
      const el: Record<string, unknown> = {
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
      };
      if (c.href) {
        el.item = c.href.startsWith('http') ? c.href : `${SITE_ORIGIN}${c.href}`;
      }
      return el;
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/*
        Pill-bar breadcrumb (styled to match the spay-website design): a rounded,
        translucent bar with a home icon, chevron separators, muted links that
        brighten on hover, and the current page shown in an accent pill. Uses
        Leo's cyan accent to stay on-brand.
      */}
      <nav aria-label="Breadcrumb">
        <ol className="inline-flex flex-wrap items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm backdrop-blur-sm bg-surface/40 border border-cyan-300/[0.16]">
          {full.map((c, i) => {
            const isLast = i === full.length - 1;
            const isHome = i === 0;
            return (
              <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight aria-hidden className="size-3.5 shrink-0 text-fg-4" />
                )}
                {!isLast && c.href ? (
                  <Link
                    href={c.href}
                    className="inline-flex items-center gap-1.5 px-1 text-fg-3 hover:text-white transition-colors"
                  >
                    {isHome && <Home aria-hidden className="size-3.5 shrink-0" />}
                    {c.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-cyan-300 bg-cyan-300/10"
                  >
                    {isHome && <Home aria-hidden className="size-3.5 shrink-0" />}
                    {c.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

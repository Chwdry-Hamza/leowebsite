'use client';

import React from 'react';
import Link from 'next/link';

export type FooterBlogLink = { title: string; slug: string };

/**
 * Footer "Blogs" item — a click-to-open dropdown listing the latest posts,
 * with a "View all blogs" link to /blog. Opens upward (footer is at the
 * bottom), closes on outside-click. Styled to match the footer chrome.
 */
export default function FooterBlogsDropdown({
  posts,
  textClassName = 'text-sm',
}: {
  posts: FooterBlogLink[];
  textClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 text-zinc-300 hover:text-white transition-colors ${textClassName}`}
      >
        Blogs
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[260px] rounded-leo-md border border-line bg-surface-deeper shadow-[0_12px_32px_rgba(0,0,0,0.45)] py-2 z-50"
        >
          {posts.length === 0 ? (
            <p className="px-4 py-2 text-xs text-fg-3">No posts yet.</p>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-fg-2 hover:bg-cyan-300/[0.06] hover:text-cyan-300 transition-colors truncate"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line mt-1 pt-1">
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-4 py-2 text-xs font-display font-semibold uppercase tracking-[0.14em] text-cyan-300 hover:bg-cyan-300/[0.06] transition-colors"
            >
              View all blogs →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

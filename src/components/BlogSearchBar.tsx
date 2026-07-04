/**
 * Search entry point for the blog / listing pages.
 *
 * A plain GET form that submits to the SEO-safe `/search?q=…` results page
 * (which is `noindex,follow` and excluded from the sitemap). It's a server
 * component — no client JS needed; the browser performs the GET navigation,
 * so the query ends up in the shareable `?q=` URL.
 */
export default function BlogSearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/search" method="get" role="search" className="flex gap-3 mb-8">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search posts and pages…"
        aria-label="Search posts and pages"
        autoComplete="off"
        className="flex-1 rounded-leo-md px-4 py-3 text-base text-fg-1 outline-none border border-line bg-surface/40 focus:border-cyan-300/50 transition-colors"
      />
      <button
        type="submit"
        className="rounded-leo-md px-5 py-3 text-sm font-display font-semibold bg-cyan-300 text-navy-950 hover:bg-cyan-200 transition-colors"
      >
        Search
      </button>
    </form>
  );
}

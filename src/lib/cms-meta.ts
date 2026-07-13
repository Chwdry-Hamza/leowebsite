import type { Metadata } from 'next';
import { cms, type CMSPage, type CMSPost, type CMSCategory } from './cms';

const SITE_ORIGIN = 'https://leo.financial';

/**
 * Build a canonical URL in the site's `trailingSlash: true` form so the
 * rel=canonical tag matches the live indexable URL (and the sitemap <loc>).
 * Without the slash the canonical points at a URL that 308-redirects, which
 * weakens the canonical signal. Root, already-slashed, and file-like paths
 * are left as-is; an optional query (e.g. `?page=2`) is appended after.
 */
export function canonicalUrl(path: string, query = ''): string {
  const p = path.startsWith('/') ? path : '/' + path;
  const slashed = p === '/' || p.endsWith('/') || /\.[a-z0-9]+$/i.test(p) ? p : `${p}/`;
  return `${SITE_ORIGIN}${slashed}${query}`;
}

type CMSMedia = {
  url?: string;
  alt?: string;
  variants?: Record<string, string>;
  width?: number;
  height?: number;
};

/** Resolve a featured/cover image down to a flat URL. */
function resolveMediaUrl(input: unknown): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    const m = input as CMSMedia;
    return m.url || undefined;
  }
  return undefined;
}

/** Resolve the alt text of a populated media (used for image alt-text on OG). */
function resolveMediaAlt(input: unknown): string | undefined {
  if (!input || typeof input !== 'object') return undefined;
  return (input as CMSMedia).alt || undefined;
}

/**
 * Builds Next Metadata for a static page whose visual content lives in code
 * but whose SEO fields are managed in the CMS by slug.
 *
 * Falls back chains:
 *   - canonical:       seo.canonical → auto = SITE_ORIGIN + livePath
 *   - og.image:        seo.og.image  → featuredImage.url
 *   - twitter.image:   seo.twitter.image → og.image → featuredImage.url
 */
/** Site-wide SEO defaults edited in CMS → SEO Settings → General. */
type SiteSeoDefaults = { defaultDescription?: string; defaultOgImage?: string };

export async function cmsMeta(slug: string, defaults: Metadata = {}): Promise<Metadata> {
  const page = await cms.getPageBySlug(slug);
  if (!page) return defaults;

  return buildMetadataFromCMS(page, slug, defaults);
}

/** Same builder but for any kind — used by /page.tsx for Home and [slug] for catch-all. */
export async function buildMetadataFromCMS(
  doc: CMSPage | CMSPost,
  livePath: string,
  defaults: Metadata = {}
): Promise<Metadata> {
  const site = await cms.getSetting<SiteSeoDefaults>('seo');
  const seo = doc.seo ?? ({} as CMSPage['seo']);

  // Title: a per-page SEO title is rendered EXACTLY (title.absolute), bypassing
  // the site-wide "Default title template". WITHOUT a custom SEO title we return
  // a plain string (the page title) so the root layout's title template wraps it
  // — that's how the CMS "Default title template" applies to untitled documents.
  const customTitle = seo.title?.trim();
  const titleText =
    customTitle ||
    doc.title?.trim() ||
    (typeof defaults.title === 'string' ? defaults.title : undefined);

  // Description precedence: the page's own SEO description → the site-wide
  // "Default meta description" (CMS → SEO Settings) → the page excerpt → any
  // per-page built-in default. The site default sits ABOVE the excerpt so the
  // default you set in the CMS applies to EVERY page/post (static, CMS, blog)
  // that has no explicit SEO description of its own.
  const description =
    seo.description?.trim() ||
    site?.defaultDescription?.trim() ||
    doc.excerpt?.trim() ||
    (typeof defaults.description === 'string' ? defaults.description : undefined);

  // Resolve images with fallbacks (incl. the site-wide Default OG image setting)
  const featuredUrl = resolveMediaUrl((doc as any).featuredImage ?? (doc as any).coverMedia ?? (doc as any).cover);
  const featuredAlt = resolveMediaAlt((doc as any).featuredImage ?? (doc as any).coverMedia);
  const ogImage = seo.og?.image || featuredUrl || site?.defaultOgImage?.trim() || undefined;
  const twitterImage = (seo.twitter as any)?.image || ogImage;

  // Canonical: explicit override → auto (trailing-slash canonical form)
  const canonical = seo.canonical || canonicalUrl(livePath);

  return {
    ...defaults,
    title: customTitle ? { absolute: customTitle } : (titleText ?? defaults.title),
    description,
    alternates: { canonical },
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow,
    },
    openGraph: {
      title: seo.og?.title || titleText,
      description: seo.og?.description || description,
      images: ogImage ? [{ url: ogImage, alt: featuredAlt || titleText }] : (defaults.openGraph as any)?.images,
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: (seo.twitter?.card as any) || 'summary_large_image',
      title: seo.twitter?.title || titleText,
      description: seo.twitter?.description || description,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

/**
 * Metadata for a listing/category page with pagination.
 *
 * Canonical rules (Google's modern guidance — rel=prev/next is ignored):
 *   - page 1 canonical = base path (no ?page=)
 *   - page N (>1) canonical = `${base}?page=N` (self-referential)
 *   - title gets "Page N of M" appended on N>1 for differentiation
 *   - page N>1 is intentionally NOT noindex'd (it's real, crawlable content)
 *     but pagination beyond totalPages, or an empty page, gets noindex
 */
export async function buildListingMetadata({
  baseTitle,
  baseDescription,
  basePath,
  page,
  totalPages,
  seo,
  defaults = {},
}: {
  baseTitle: string;
  baseDescription: string;
  basePath: string;            // e.g. '/blog' or '/blog/category/crypto'
  page: number;
  totalPages: number;
  seo?: CMSCategory['seo'];
  defaults?: Metadata;
}): Promise<Metadata> {
  const site = await cms.getSetting<SiteSeoDefaults>('seo');
  // A per-listing custom SEO title is rendered exactly (title.absolute); without
  // one, the base title is a plain string so the layout's title template wraps it.
  const exactTitle = Boolean(seo?.title?.trim());
  const titleText = seo?.title
    ? (page > 1 ? `${seo.title} — Page ${page}` : seo.title)
    : (page > 1 ? `${baseTitle} — Page ${page} of ${totalPages}` : baseTitle);
  // Site-wide default applies above the per-listing base description so the CMS
  // "Default meta description" reaches listing pages (blog, category, tag) too.
  const description = seo?.description?.trim() || site?.defaultDescription?.trim() || baseDescription?.trim() || undefined;

  const canonical = page > 1 ? canonicalUrl(basePath, `?page=${page}`) : canonicalUrl(basePath);

  // Noindex an out-of-range page (e.g. /blog?page=99 when only 3 pages exist)
  const outOfRange = page > 1 && page > totalPages;

  return {
    ...defaults,
    // Custom SEO title → absolute (no template); otherwise plain so the layout's
    // "Default title template" wraps it.
    title: exactTitle ? { absolute: titleText } : titleText,
    description,
    alternates: { canonical },
    robots: {
      index: !outOfRange,
      follow: true,
    },
    openGraph: {
      title: titleText,
      description,
      images: (defaults.openGraph as any)?.images,
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description,
    },
  };
}

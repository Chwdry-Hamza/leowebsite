/**
 * Server-side helpers for fetching content from leo-backend.
 * Used by App Router server components and route handlers.
 */
const API_URL = process.env.LEO_API_URL ?? 'http://localhost:4000';

export type CMSMedia = {
  _id?: string;
  url: string;
  alt?: string;
  variants?: Record<string, string>;
  width?: number;
  height?: number;
};

/** Raw admin-authored header/body/footer snippets injected verbatim into a page. */
export type CmsCodeInjection = {
  header?: string;
  body?: string;
  footer?: string;
};

export type CMSPage = {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  template: string;
  content: any;            // TipTap JSON
  /** Structured section overrides for code-driven pages (e.g. the homepage). */
  sections?: Record<string, unknown> | null;
  excerpt: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
    noindex: boolean;
    nofollow: boolean;
    og: { title: string; description: string; image: string };
    twitter: { card: string; title: string; description: string; image?: string };
  };
  featuredImage?: CMSMedia | string | null;
  schema?: {
    type: 'none' | 'article' | 'faq' | 'service' | 'custom';
    faq?: { q: string; a: string }[];
    service?: {
      name?: string;
      description?: string;
      serviceType?: string;
      areaServed?: string;
      priceRange?: string;
    };
    customJsonLd?: string;
  };
  performance?: PagePerformance;
  /** Per-page custom code injection (header / body / footer), rendered verbatim. */
  codeInjection?: CmsCodeInjection | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type PagePerformance = {
  skipAnalytics?: boolean;
  skipCustomScripts?: boolean;
  disableCache?: boolean;
  lazyLoadImages?: boolean;
};

export type CMSPost = CMSPage & {
  cover: string;
  coverMedia?: CMSMedia | string | null;
  // The backend may return a populated category object OR a bare string id when
  // the ref isn't populated — handle both via categorySlugOf / categoryDisplayName.
  category?: { _id: string; name: string; slug: string; color: string } | string | null;
  categoryName: string;
  tags: string[];
  readTime: number;
  authorName: string;
};

/** Resolve a post's category slug whether `category` is populated, a string id, or absent. */
export function categorySlugOf(post: Pick<CMSPost, 'category'>): string | null {
  const c = post.category;
  if (!c) return null;
  if (typeof c === 'string') return null; // bare id — no slug available
  return c.slug ?? null;
}

/** Resolve a post's category display name, falling back to `categoryName`. */
export function categoryDisplayName(post: Pick<CMSPost, 'category' | 'categoryName'>): string {
  const c = post.category;
  if (c && typeof c !== 'string' && c.name) return c.name;
  return post.categoryName ?? '';
}

export type CMSCategory = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
  content?: string;
  pageSize?: number;
  seo?: {
    title?: string;
    description?: string;
  };
};

export type CMSCategoryWithPosts = {
  category: CMSCategory;
  items: CMSPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CMSSearchHit = {
  kind: 'page' | 'post';
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryName?: string;
  score: number;
};

export type CMSSearchResults = {
  q: string;
  items: CMSSearchHit[];
  total: number;
};

export type CMSSitemap = {
  pages: { slug: string; updatedAt: string; publishedAt?: string | null }[];
  posts: { slug: string; updatedAt: string; publishedAt?: string | null }[];
};

export type CMSSitemapEntry = { slug: string; updatedAt: string; publishedAt?: string | null };
export type CMSSitemapSection = { items: CMSSitemapEntry[]; excluded: { slug: string; reason: 'draft' | 'scheduled' | 'noindex'; updatedAt: string }[] };

async function fetchJSON<T>(path: string, opts: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
      next: { revalidate: 60, ...(opts as any).next },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const cms = {
  /** SEO metadata for the marketing landing — body is ignored on the live page. */
  getHome: () => fetchJSON<CMSPage>('/api/public/home'),

  getPageBySlug: (slug: string) =>
    fetchJSON<CMSPage>(`/api/public/pages/by-slug/${encodeURIComponent(slug)}`),

  /**
   * List every published CMS Page (used by the Footer to auto-link any page an
   * admin creates beyond the hand-built static routes). Returns an empty array
   * if the CMS is unreachable so the footer still renders.
   */
  getPages: async (): Promise<CMSPage[]> => {
    const data = await fetchJSON<{ items: CMSPage[] }>('/api/public/pages');
    return data?.items ?? [];
  },

  getPostBySlug: (slug: string) =>
    fetchJSON<CMSPost>(`/api/public/posts/by-slug/${encodeURIComponent(slug)}`),

  listPosts: (params: { limit?: number; page?: number; category?: string; tag?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.page) qs.set('page', String(params.page));
    if (params.category) qs.set('category', params.category);
    if (params.tag) qs.set('tag', params.tag);
    const suffix = qs.toString() ? `?${qs}` : '';
    return fetchJSON<{ items: CMSPost[]; total: number; totalPages: number }>(`/api/public/posts${suffix}`);
  },

  search: (q: string, limit = 20) => {
    const qs = new URLSearchParams({ q, limit: String(limit) });
    return fetchJSON<CMSSearchResults>(`/api/public/search?${qs}`);
  },

  getSitemap: () => fetchJSON<CMSSitemap>('/api/public/sitemap'),

  getSitemapPages: () => fetchJSON<CMSSitemapSection>('/api/public/sitemap/pages'),

  getSitemapPosts: () => fetchJSON<CMSSitemapSection>('/api/public/sitemap/posts'),

  getSitemapCategories: () => fetchJSON<CMSSitemapSection>('/api/public/sitemap/categories'),

  listCategories: () => fetchJSON<{ items: CMSCategory[] }>('/api/public/categories'),

  /** Category landing page + paginated published posts. */
  getCategoryBySlug: (slug: string, page = 1, limit?: number) => {
    const qs = new URLSearchParams({ page: String(page) });
    if (limit) qs.set('limit', String(limit));
    return fetchJSON<CMSCategoryWithPosts>(`/api/public/categories/by-slug/${encodeURIComponent(slug)}?${qs}`);
  },

  getRedirects: () =>
    fetchJSON<{ items: { _id: string; from: string; to: string; statusCode: number }[] }>(
      '/api/redirects/all.json',
      { next: { revalidate: 30 } as any }
    ),

  getSetting: <T = any>(key: string) =>
    fetchJSON<T>(`/api/public/settings/${encodeURIComponent(key)}`),

  /**
   * Ensure a CMS Page record exists for a website route so it shows up in
   * spay-cms and becomes SEO-editable. Idempotent on the server — never
   * overwrites SEO an editor has set. Fire-and-forget: failures (CMS down,
   * registration disabled) never block rendering.
   */
  ensurePageRegistered: async (slug: string, title: string, template?: string): Promise<void> => {
    const secret = process.env.SPAY_REGISTER_SECRET || '';
    try {
      await fetch(`${API_URL}/api/public/pages/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'x-register-secret': secret } : {}),
        },
        body: JSON.stringify({ slug, title, template }),
        cache: 'no-store',
        signal: AbortSignal.timeout(2500),
      });
    } catch {
      // Registration is best-effort — the page still renders without it.
    }
  },

  /**
   * For a static website route: make sure it's registered in the CMS, then
   * return its CMS Page (used by the homepage to read SEO + sections overrides).
   * The home route '/' uses the dedicated /home endpoint.
   */
  getRouteSeoPage: async function (slug: string, title: string, template?: string): Promise<CMSPage | null> {
    await this.ensurePageRegistered(slug, title, template);
    return slug === '/' ? this.getHome() : this.getPageBySlug(slug);
  },
};

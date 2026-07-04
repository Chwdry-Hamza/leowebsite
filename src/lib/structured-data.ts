/**
 * JSON-LD builders used across the site.
 *
 * Every helper returns a plain object (or array of objects). The caller is
 * responsible for stringifying and injecting via <script type="application/ld+json">.
 * Returning data — not React — lets the same helpers run from the metadata
 * API, layout, or a leaf page without React imports.
 *
 * Why this lives in one file:
 *   - all helpers share the Organization reference (publisher / provider)
 *   - schema.org property names are easy to typo; co-locating prevents drift
 */

const SITE_ORIGIN = 'https://leo.financial';

// ─── Types ─────────────────────────────────────────────────────────

export type Organization = {
  name?: string;
  legalName?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: { telephone?: string; email?: string; contactType?: string };
  isLocalBusiness?: boolean;
  priceRange?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
};

export type StructuredData = {
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

// ─── Organization / LocalBusiness ─────────────────────────────────

/**
 * Global org schema for the root layout.
 * If `isLocalBusiness` is true, the @type flips to LocalBusiness and we
 * emit the address / priceRange / geo fields that Google needs to show
 * the rich result card.
 */
export function buildOrganizationJsonLd(org: Organization | null | undefined) {
  if (!org || !org.name) return null;

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': org.isLocalBusiness ? 'LocalBusiness' : 'Organization',
    name: org.name,
    url: org.url || SITE_ORIGIN,
  };

  if (org.legalName)   base.legalName   = org.legalName;
  if (org.logo)        base.logo        = abs(org.logo);
  if (org.description) base.description = org.description;
  if (org.sameAs?.length) base.sameAs = org.sameAs.filter(Boolean);

  if (org.contactPoint && (org.contactPoint.telephone || org.contactPoint.email)) {
    base.contactPoint = {
      '@type': 'ContactPoint',
      contactType: org.contactPoint.contactType || 'customer service',
      ...(org.contactPoint.telephone ? { telephone: org.contactPoint.telephone } : {}),
      ...(org.contactPoint.email     ? { email: org.contactPoint.email }         : {}),
    };
  }

  if (org.isLocalBusiness) {
    if (org.priceRange) base.priceRange = org.priceRange;
    if (org.address && (org.address.streetAddress || org.address.addressLocality)) {
      base.address = {
        '@type': 'PostalAddress',
        ...trimEmpty({
          streetAddress:   org.address.streetAddress,
          addressLocality: org.address.addressLocality,
          addressRegion:   org.address.addressRegion,
          postalCode:      org.address.postalCode,
          addressCountry:  org.address.addressCountry,
        }),
      };
    }
  }

  return base;
}

/** Stripped-down org reference used as Article.publisher and Service.provider. */
export function orgReference(org: Organization | null | undefined) {
  if (!org?.name) return undefined;
  return {
    '@type': 'Organization',
    name: org.name,
    ...(org.logo ? { logo: { '@type': 'ImageObject', url: abs(org.logo) } } : {}),
  };
}

// ─── Article / BlogPosting ────────────────────────────────────────

export function buildArticleJsonLd(opts: {
  type?: 'Article' | 'BlogPosting';
  title: string;
  description?: string;
  url: string;                  // absolute or path
  image?: string;
  authorName?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  keywords?: string[];
  category?: string;
  org?: Organization | null;
}) {
  const url = abs(opts.url);
  const out: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': opts.type || 'Article',
    headline: opts.title,
    description: opts.description || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
  if (opts.image) out.image = [abs(opts.image)];
  if (opts.authorName) out.author = { '@type': 'Person', name: opts.authorName };
  if (opts.datePublished) out.datePublished = new Date(opts.datePublished).toISOString();
  if (opts.dateModified) out.dateModified = new Date(opts.dateModified).toISOString();
  if (opts.keywords?.length) out.keywords = opts.keywords.join(', ');
  if (opts.category) out.articleSection = opts.category;
  const publisher = orgReference(opts.org);
  if (publisher) out.publisher = publisher;
  out.inLanguage = 'en-US';
  return out;
}

// ─── FAQ ───────────────────────────────────────────────────────────

export function buildFaqJsonLd(faq: { q: string; a: string }[] | undefined) {
  const clean = (faq ?? []).filter((x) => x?.q?.trim() && x?.a?.trim());
  if (clean.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: clean.map((f) => ({
      '@type': 'Question',
      name: f.q.trim(),
      acceptedAnswer: { '@type': 'Answer', text: f.a.trim() },
    })),
  };
}

// ─── Service ──────────────────────────────────────────────────────

export function buildServiceJsonLd(
  service: NonNullable<StructuredData['service']> | undefined,
  fallbackName: string,
  fallbackDescription: string,
  org: Organization | null | undefined,
) {
  if (!service) return null;
  const name = (service.name || fallbackName || '').trim();
  if (!name) return null;
  const out: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
  };
  const description = (service.description || fallbackDescription || '').trim();
  if (description) out.description = description;
  if (service.serviceType) out.serviceType = service.serviceType;
  if (service.areaServed)  out.areaServed  = service.areaServed;
  if (service.priceRange)  out.offers      = { '@type': 'Offer', priceCurrency: 'USD', price: service.priceRange };
  const provider = orgReference(org);
  if (provider) out.provider = provider;
  return out;
}

// ─── Custom JSON-LD ───────────────────────────────────────────────

/**
 * Parses user-provided JSON. Returns null when blank or invalid so the page
 * never crashes from a bad paste. Accepts a single object OR an array of
 * objects (schema.org supports both forms in a single <script>).
 */
export function parseCustomJsonLd(raw: string | undefined): unknown | null {
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Render helper (server components only) ──────────────────────

/** Serializes a JSON-LD value safely for inline injection. */
export function serializeJsonLd(data: unknown): string {
  // Escape `</` to prevent prematurely closing the script tag if the JSON
  // contains a literal `</script>` substring.
  return JSON.stringify(data).replace(/<\/(script)/gi, '<\\/$1');
}

// ─── Internal helpers ─────────────────────────────────────────────

function abs(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_ORIGIN}${url.startsWith('/') ? url : '/' + url}`;
}

function trimEmpty<T extends Record<string, unknown>>(o: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out as Partial<T>;
}

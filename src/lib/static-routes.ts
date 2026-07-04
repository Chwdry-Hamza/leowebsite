/**
 * Single source of truth for every hand-built route on leo-website-next.
 *
 *   - Read by `instrumentation.ts` on server boot → each route is registered
 *     in leo-backend so it appears in the CMS Pages list for SEO editing
 *     without waiting for the first visitor.
 *   - Read by `app/[slug]/page.tsx` as the STATIC_SLUGS collision guard so
 *     a CMS Page with a slug like `/about` can never shadow the hand-built
 *     `/about` route.
 *   - Read by `app/sitemap-static.xml/route.ts` to list the static URLs.
 *
 * Add new hand-built routes here; the CMS picks them up automatically on
 * the next boot.
 */
export type StaticRoute = {
  /** Leading-slash slug as stored in the CMS Page (e.g. '/about'). '/' = home. */
  slug: string;
  /** Initial CMS title — only used on FIRST creation; admins can edit later. */
  title: string;
  /** Template hint shown in the CMS list. */
  template?: 'Landing' | 'Content' | 'Legal';
};

export const STATIC_ROUTES: StaticRoute[] = [
  { slug: '/',                       title: 'Home',                  template: 'Landing' },
  { slug: '/about',                  title: 'About LEO',             template: 'Content' },
  { slug: '/support',                title: 'Support',               template: 'Content' },
  { slug: '/card-terms',             title: 'Card Terms',            template: 'Legal'   },
  { slug: '/privacy-policy',         title: 'Privacy Policy',        template: 'Legal'   },
  { slug: '/prohibited-activities',  title: 'Prohibited Activities', template: 'Legal'   },
  { slug: '/e-sign-consent',         title: 'E-Sign Consent',        template: 'Legal'   },
];

/** Set form used by `[slug]/page.tsx` to short-circuit on static-route collisions. */
export const STATIC_SLUGS: Set<string> = new Set(STATIC_ROUTES.map((r) => r.slug));

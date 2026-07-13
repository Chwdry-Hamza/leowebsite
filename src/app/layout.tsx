import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import ClientEffects from '../components/ClientEffects';
import CookieConsent from '../components/CookieConsent';
import AutoRefresh from '../components/AutoRefresh';
import { cms, type CmsCodeInjection } from '@/lib/cms';
import { buildOrganizationJsonLd, type Organization } from '@/lib/structured-data';
import { serializeJsonLd } from '@/lib/sanitize';
import CodeInjection from '../components/CodeInjection';
import ConsentedAnalytics from '../components/ConsentedAnalytics';

/**
 * Font loaded via next/font — Next adds preconnect + preload links into
 * <head> automatically, eliminates external font CSS round-trips, and sets
 * font-display: swap by default. The CSS variable name matches the existing
 * `--leo-font-display` and `--leo-font-sans` references in globals.css.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--leo-font-display',
});

/**
 * Site-wide SEO settings — edited from CMS → SEO → General + Verification.
 * Saved via PUT /api/settings/seo on the backend; the backend fires
 * revalidate('/') on save so this layout re-renders within seconds.
 */
type SiteSEO = {
  siteName?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  defaultLocale?: string;
  defaultOgImage?: string;
  twitterHandle?: string;
  searchConsoleVerification?: string;
};

const FALLBACK_TITLE = 'LEO — Money, made simple.';
const FALLBACK_DESCRIPTION = 'LEO — Money, made simple.';
const FALLBACK_LOCALE = 'en';
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

function langOf(locale?: string): string {
  if (!locale) return FALLBACK_LOCALE;
  return locale.split('-')[0] || FALLBACK_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await cms.getSetting<SiteSEO>('seo');
  const siteName = seo?.siteName?.trim() || 'LEO';
  const description = seo?.defaultDescription?.trim() || FALLBACK_DESCRIPTION;
  const ogImage = seo?.defaultOgImage?.trim();

  // Site-wide default title: the CMS "Site name" (SEO Settings) is the fallback
  // shown when a document has no title of its own (e.g. the homepage without its
  // own SEO title), so the configured value takes effect on the front end.
  const defaultTitle = seo?.siteName?.trim() || FALLBACK_TITLE;

  // The CMS "Default title template" is the FALLBACK title format for documents
  // that have no per-page SEO title of their own. Pages WITH their own SEO title
  // emit it as title.absolute and bypass this template (see buildMetadataFromCMS
  // / buildListingMetadata), so the template only ever applies to untitled docs.
  // Used exactly as written:
  //   - contains {title} → replaced with the document's own title (Next %s),
  //   - a non-empty literal with no placeholder → used verbatim (e.g. "LEO"),
  //   - empty → falls back to the built-in "%s | <siteName>" pattern.
  const rawTemplate = seo?.titleTemplate?.trim();
  const titleTemplate = rawTemplate
    ? rawTemplate.includes('{title}')
      ? rawTemplate.replace('{title}', '%s')
      : rawTemplate
    : `%s | ${siteName}`;

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    description,
    icons: { icon: '/leoFavicon.png', apple: '/leoFavicon.png' },
    manifest: '/manifest.json',
    // Root canonical points at the site origin. Child pages (cms-meta) set
    // their own canonical per-route and override this.
    alternates: { canonical: '/' },
    openGraph: {
      siteName,
      title: defaultTitle,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description,
      ...(seo?.twitterHandle?.trim() ? { site: seo.twitterHandle.trim() } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    // NOTE: Google Search Console verification is intentionally NOT emitted via
    // `metadata.verification` here. Next 16 streams generateMetadata output into
    // the <body> for regular browsers on dynamic pages, so the tag can miss the
    // <head> that the SEO team checks via View Source. It is instead rendered as
    // a plain <meta> in RootLayout (React hoists it into <head>). See
    // searchConsoleToken + RootLayout below.
  };
}

/**
 * Google Search Console verification token from the CMS `seo` setting.
 * Editors sometimes store the full `<meta … content="TOKEN">` tag — accept
 * that too by extracting the content value. Rendered as a plain <meta> in
 * RootLayout (React hoists it into <head>) rather than via
 * `metadata.verification`.
 */
function searchConsoleToken(seo: SiteSEO | null): string | undefined {
  const raw = seo?.searchConsoleVerification?.trim();
  if (!raw) return undefined;
  return raw.match(/content=["']([^"']+)["']/i)?.[1] ?? raw;
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Global Organization (or LocalBusiness) JSON-LD — edited from CMS → SEO.
  // Site-wide code injection — edited from CMS → SEO → Code (header/body/footer).
  const [org, siteSeo, globalCode, analytics] = await Promise.all([
    cms.getSetting<Organization>('organization'),
    cms.getSetting<SiteSEO>('seo'),
    cms.getSetting<CmsCodeInjection>('codeInjection'),
    cms.getSetting<{ ga4Id?: string; gtmId?: string }>('analytics'),
  ]);
  const orgJsonLd = buildOrganizationJsonLd(org ?? undefined);
  // GSC verification token — rendered as a raw <meta> below so React hoists it
  // into <head> for every user agent, including plain browsers doing View Source.
  const gscToken = searchConsoleToken(siteSeo ?? null);

  return (
    <html lang={langOf(siteSeo?.defaultLocale)} className={spaceGrotesk.variable}>
      <body>
        {/* Google Search Console verification — React hoists this <meta> into
            <head> so it is present in View Source on every route. */}
        {gscToken && (
          <meta name="google-site-verification" content={gscToken} />
        )}
        {/* GA4 + GTM, rendered site-wide so both land in <head> on every page. */}
        <ConsentedAnalytics ga4Id={analytics?.ga4Id} gtmId={analytics?.gtmId} />
        {/*
          JSON-LD is hoisted into <head> by React 19's metadata support when
          rendered as a <script type="application/ld+json"> at the top of body.
          Search engines read it from anywhere in the document, but keeping it
          here lets the metadata API stay clean.
        */}
        {orgJsonLd && (
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgJsonLd) }}
          />
        )}
        {/* Site-wide code injection: header → <head>, body at top of <body>. */}
        <CodeInjection code={globalCode} slots={['header', 'body']} />
        <div className="App leo-scope">
          <ClientEffects />
          <AutoRefresh />
          {children}
          <CookieConsent />
        </div>
        {/* Site-wide code injection: footer at the very end of <body>. */}
        <CodeInjection code={globalCode} slots={['footer']} />
      </body>
    </html>
  );
}

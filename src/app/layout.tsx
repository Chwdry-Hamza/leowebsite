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

function toNextTemplate(tpl: string | undefined, siteName: string): string {
  if (tpl && tpl.includes('{title}')) return tpl.replace('{title}', '%s');
  return `%s | ${siteName}`;
}

function langOf(locale?: string): string {
  if (!locale) return FALLBACK_LOCALE;
  return locale.split('-')[0] || FALLBACK_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await cms.getSetting<SiteSEO>('seo');
  const siteName = seo?.siteName?.trim() || 'LEO';
  const defaultTitle = siteName === 'LEO' ? FALLBACK_TITLE : siteName;
  const description = seo?.defaultDescription?.trim() || FALLBACK_DESCRIPTION;
  const ogImage = seo?.defaultOgImage?.trim();

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: defaultTitle,
      template: toNextTemplate(seo?.titleTemplate, siteName),
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
    verification: {
      ...(seo?.searchConsoleVerification?.trim() ? { google: seo.searchConsoleVerification.trim() } : {}),
    },
  };
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
  const [org, siteSeo, globalCode] = await Promise.all([
    cms.getSetting<Organization>('organization'),
    cms.getSetting<SiteSEO>('seo'),
    cms.getSetting<CmsCodeInjection>('codeInjection'),
  ]);
  const orgJsonLd = buildOrganizationJsonLd(org ?? undefined);

  return (
    <html lang={langOf(siteSeo?.defaultLocale)} className={spaceGrotesk.variable}>
      <body>
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

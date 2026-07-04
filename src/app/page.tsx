import type { Metadata } from 'next';
import { cms } from '@/lib/cms';
import { buildMetadataFromCMS } from '@/lib/cms-meta';
import { resolveHomeContent } from '@/lib/homeContent';
import HomeSections from '../components/HomeSections';
import NavBar from '../components/NavBar';
import { getFooterExtras } from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { PerformanceScripts } from '../components/PerformanceScripts';
import CodeInjection from '@/components/CodeInjection';

// ISR — also revalidated on demand when the Home page is edited in the CMS
export const revalidate = 60;

const HOME_TITLE = 'LEO — Money, made simple.';

const DEFAULT_META: Metadata = {
  title: HOME_TITLE,
  description: 'Send, spend, split, and save — in one quietly beautiful app. Free to start, honest at every turn, and built to last.',
  openGraph: {
    title: HOME_TITLE,
    description: 'Send, spend, split, and save — in one quietly beautiful app.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  // Auto-register the homepage in the CMS so it appears as SEO-editable, then
  // read its current SEO record. Registered with the brand title (not a generic
  // "Home") so a fresh CMS record shows the brand. Best-effort: if the CMS is
  // unreachable the page still renders with DEFAULT_META.
  const home = await cms.getRouteSeoPage('/', HOME_TITLE, 'Landing');
  if (!home) return DEFAULT_META;
  const meta = await buildMetadataFromCMS(home, '/', DEFAULT_META);
  // Home title shouldn't be wrapped by the layout's "%s | Leo" template, and
  // shouldn't fall back to the generic auto-registration title — use the
  // editor's Home SEO title if set, else the brand line.
  meta.title = { absolute: home?.seo?.title?.trim() || HOME_TITLE };
  return meta;
}

export default async function Page() {
  // Fetch the home Page from the CMS to read its `sections` overrides, then
  // deep-merge over our defaults. Footer extras (auto-listed CMS pages + latest
  // posts) are fetched in parallel and passed into HomeSections so the inline
  // FooterView can update during live preview. If the CMS is unreachable, the
  // resolvers fall back to defaults and the footer renders with its built-in
  // links only.
  const [home, footerExtras] = await Promise.all([cms.getHome(), getFooterExtras()]);
  const initialContent = resolveHomeContent(home?.sections);

  return (
    <>
      <CodeInjection code={home?.codeInjection} slots={['header', 'body']} />
      <NavBar content={initialContent.navBar} />
      <HomeSections
        initialContent={initialContent}
        footerDynamicLinks={footerExtras.dynamicLinks}
        latestBlogs={footerExtras.latestBlogs}
      />
      <BottomNav content={initialContent.bottomNav} />
      <PerformanceScripts perf={home?.performance} />
      <CodeInjection code={home?.codeInjection} slots={['footer']} />
    </>
  );
}

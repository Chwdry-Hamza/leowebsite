import type { Metadata } from 'next';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import AboutSections from '@/components/AboutSections';
import { PerformanceScripts } from '@/components/PerformanceScripts';
import CodeInjection from '@/components/CodeInjection';
import { cms } from '@/lib/cms';
import { buildMetadataFromCMS } from '@/lib/cms-meta';
import { resolveAboutContent } from '@/lib/aboutContent';

export const revalidate = 60;

const DEFAULT_META: Metadata = {
  title: 'About',
  description: 'LEO is the money app where fiat and crypto live side by side. Our mission, vision, and the team building it.',
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getRouteSeoPage('/about', 'About', 'Content');
  if (!page) return DEFAULT_META;
  return await buildMetadataFromCMS(page, '/about', DEFAULT_META);
}

export default async function AboutPage() {
  const page = await cms.getRouteSeoPage('/about', 'About', 'Content');
  const initialContent = resolveAboutContent(page?.sections);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <CodeInjection code={page?.codeInjection} slots={['body']} />
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <Breadcrumbs items={[{ label: 'About' }]} />
      </div>
      <AboutSections initialContent={initialContent} />
      <Footer />
      <PerformanceScripts perf={page?.performance} />
      <CodeInjection code={page?.codeInjection} slots={['footer']} />
    </main>
  );
}

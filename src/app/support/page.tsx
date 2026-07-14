import type { Metadata } from 'next';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import SupportSections from '@/components/SupportSections';
import { PerformanceScripts } from '@/components/PerformanceScripts';
import CodeInjection from '@/components/CodeInjection';
import { cms } from '@/lib/cms';
import { buildMetadataFromCMS } from '@/lib/cms-meta';
import { resolveSupportContent } from '@/lib/supportContent';

export const revalidate = 60;

const DEFAULT_META: Metadata = {
  title: 'Support',
  description: 'Get help with your LEO account, card, or transactions. Email, phone, and support hours.',
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getRouteSeoPage('/support', 'Support', 'Content');
  if (!page) return DEFAULT_META;
  return await buildMetadataFromCMS(page, '/support', DEFAULT_META);
}

export default async function SupportPage() {
  const page = await cms.getRouteSeoPage('/support', 'Support', 'Content');
  const initialContent = resolveSupportContent(page?.sections);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <CodeInjection code={page?.codeInjection} slots={['body']} />
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <Breadcrumbs items={[{ label: 'Support' }]} />
      </div>
      <SupportSections initialContent={initialContent} />
      <Footer />
      <PerformanceScripts perf={page?.performance} />
      <CodeInjection code={page?.codeInjection} slots={['footer']} />
    </main>
  );
}

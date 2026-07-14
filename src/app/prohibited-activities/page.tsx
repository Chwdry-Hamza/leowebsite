import type { Metadata } from 'next';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import LegalSections from '@/components/LegalSections';
import { PerformanceScripts } from '@/components/PerformanceScripts';
import CodeInjection from '@/components/CodeInjection';
import { cms } from '@/lib/cms';
import { buildMetadataFromCMS } from '@/lib/cms-meta';
import { PROHIBITED_DEFAULTS, resolveLegalContent } from '@/lib/legalContent';

export const revalidate = 60;

const DEFAULT_META: Metadata = {
  title: 'Prohibited Activities',
  description: 'Activities you may not engage in when using the LEO Card.',
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getRouteSeoPage('/prohibited-activities', 'Prohibited Activities', 'Legal');
  if (!page) return DEFAULT_META;
  return await buildMetadataFromCMS(page, '/prohibited-activities', DEFAULT_META);
}

export default async function ProhibitedActivitiesPage() {
  const page = await cms.getRouteSeoPage('/prohibited-activities', 'Prohibited Activities', 'Legal');
  const initialContent = resolveLegalContent(PROHIBITED_DEFAULTS, page?.sections);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <CodeInjection code={page?.codeInjection} slots={['body']} />
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <Breadcrumbs items={[{ label: 'Prohibited Activities' }]} />
      </div>
      <LegalSections initialContent={initialContent} defaults={PROHIBITED_DEFAULTS} />
      <Footer />
      <PerformanceScripts perf={page?.performance} />
      <CodeInjection code={page?.codeInjection} slots={['footer']} />
    </main>
  );
}

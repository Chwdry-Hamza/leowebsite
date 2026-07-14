import type { Metadata } from 'next';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import LegalSections from '@/components/LegalSections';
import { PerformanceScripts } from '@/components/PerformanceScripts';
import CodeInjection from '@/components/CodeInjection';
import { cms } from '@/lib/cms';
import { buildMetadataFromCMS } from '@/lib/cms-meta';
import { ESIGN_DEFAULTS, resolveLegalContent } from '@/lib/legalContent';

export const revalidate = 60;

const DEFAULT_META: Metadata = {
  title: 'E-Sign Consent',
  description: "LEO's E-Sign & Electronic Communications Notice.",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await cms.getRouteSeoPage('/e-sign-consent', 'E-Sign Consent', 'Legal');
  if (!page) return DEFAULT_META;
  return await buildMetadataFromCMS(page, '/e-sign-consent', DEFAULT_META);
}

export default async function ESignConsentPage() {
  const page = await cms.getRouteSeoPage('/e-sign-consent', 'E-Sign Consent', 'Legal');
  const initialContent = resolveLegalContent(ESIGN_DEFAULTS, page?.sections);

  return (
    <main className="bg-[#0a1527] min-h-screen overflow-x-hidden">
      <CodeInjection code={page?.codeInjection} slots={['body']} />
      <NavBar />
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-16">
        <Breadcrumbs items={[{ label: 'E-Sign Consent' }]} />
      </div>
      <LegalSections initialContent={initialContent} defaults={ESIGN_DEFAULTS} />
      <Footer />
      <PerformanceScripts perf={page?.performance} />
      <CodeInjection code={page?.codeInjection} slots={['footer']} />
    </main>
  );
}

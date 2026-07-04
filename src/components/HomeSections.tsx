"use client";

import { useEditablePreview } from '@/hooks/usePreview';
import { resolveHomeContent, type HomeContent } from '@/lib/homeContent';
import HeroSection from './heroSection';
import ControlSection from './ControlSection';
import PaymentSection from './PaymentSection';
import TransferSection from './TransferSection';
import CryptoSection from './CryptoSection';
import FeaturesGrid from './FeaturesGrid';
import JoinUsSection from './JoinUsSection';
import CollaborationsSection from './CollaborationsSection';
import CryptoTicker from './CryptoTicker';
import FooterView, { type FooterLink } from './FooterView';
import { type FooterBlogLink } from './FooterBlogsDropdown';

/**
 * Client wrapper for the homepage body.
 *
 * - In normal mode: renders the homepage sections with the server-resolved `content`.
 * - In preview mode (?preview=1): also subscribes to the CMS preview postMessage
 *   stream so an editor sees their edits live in the iframe and can click-edit
 *   fields tagged with `data-cms-*`.
 *
 * The Footer is rendered INSIDE this component (as `FooterView`, a pure client
 * presentational component) so live-preview edits to the footer slice update in
 * real time. The dynamic data (auto-listed CMS pages + latest posts) is
 * pre-fetched on the server in `app/page.tsx` and passed in as props. Other
 * pages use the async `<Footer />` server component which wraps `FooterView`
 * with its own data fetch.
 *
 * NavBar + BottomNav stay at the server page level — they're not interactive
 * with the preview stream, so they don't need to live inside this client tree.
 */
export default function HomeSections({
  initialContent,
  footerDynamicLinks,
  latestBlogs,
}: {
  initialContent: HomeContent;
  footerDynamicLinks: FooterLink[];
  latestBlogs: FooterBlogLink[];
}) {
  const { content, rootRef } = useEditablePreview(initialContent, resolveHomeContent);
  const renderedFooterLinks: FooterLink[] = [...content.footer.links, ...footerDynamicLinks];

  return (
    <div ref={rootRef}>
      <HeroSection content={content.hero} />
      <ControlSection content={content.control} />
      <PaymentSection content={content.payment} />
      <CryptoTicker content={content.cryptoTicker} />
      <TransferSection content={content.transfer} />
      <CryptoSection content={content.crypto} />
      <FeaturesGrid content={content.featuresGrid} />
      <JoinUsSection content={content.joinUs} />
      <CollaborationsSection content={content.collaborations} />
      <FooterView
        content={content.footer}
        renderedLinks={renderedFooterLinks}
        latestBlogs={latestBlogs}
      />
    </div>
  );
}

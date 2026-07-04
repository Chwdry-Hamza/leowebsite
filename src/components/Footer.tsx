import { cms } from '@/lib/cms';
import { resolveHomeContent } from '@/lib/homeContent';
import { STATIC_SLUGS } from '@/lib/static-routes';
import FooterView, { type FooterLink } from './FooterView';
import { type FooterBlogLink } from './FooterBlogsDropdown';

/**
 * Dynamic footer extras shared by the server `Footer` and the homepage live-
 * preview bridge: every CMS Page (except the static hand-built routes) is auto-
 * listed in the footer nav, and the latest two posts feed the Blogs dropdown.
 *
 * Both calls run in parallel and tolerate CMS outages — the footer still
 * renders with just the editable links from the home `sections.footer.links`.
 */
export async function getFooterExtras(): Promise<{
  dynamicLinks: FooterLink[];
  latestBlogs: FooterBlogLink[];
}> {
  const [pages, postsResult] = await Promise.all([
    cms.getPages(),
    cms.listPosts({ limit: 5 }).catch(() => null),
  ]);

  const dynamicLinks: FooterLink[] = pages
    .filter((p) => p.slug && p.slug !== '/' && !STATIC_SLUGS.has(p.slug))
    .map((p) => ({ label: p.title, href: p.slug }));

  const latestBlogs: FooterBlogLink[] = (postsResult?.items ?? []).map((p) => ({
    title: p.title,
    slug: p.slug,
  }));

  return { dynamicLinks, latestBlogs };
}

/**
 * Server-rendered footer for every non-homepage route. The homepage skips this
 * and renders <FooterView> directly inside <HomeSections> so live-preview edits
 * to the footer slice update in real time.
 */
export default async function Footer() {
  const [home, extras] = await Promise.all([cms.getHome(), getFooterExtras()]);
  const content = resolveHomeContent(home?.sections).footer;
  const { dynamicLinks, latestBlogs } = extras;
  const renderedLinks: FooterLink[] = [...content.links, ...dynamicLinks];

  return (
    <FooterView
      content={content}
      renderedLinks={renderedLinks}
      latestBlogs={latestBlogs}
    />
  );
}

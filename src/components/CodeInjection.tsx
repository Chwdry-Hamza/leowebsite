import * as React from 'react';
import parse, {
  Element,
  attributesToProps,
  type HTMLReactParserOptions,
} from 'html-react-parser';
import type { CmsCodeInjection } from '@/lib/cms';

/**
 * Server-rendered custom code injection (header / body / footer) authored in the
 * CMS — raw, admin-authored HTML/JS dropped in verbatim (analytics, tracking
 * pixels, chat widgets, verification meta, A/B-test tags, structured data, …).
 *
 * Everything is emitted into the server HTML, so the snippets appear in the page
 * source (View Source / non-JS crawlers / verification bots) — not added later.
 * This is required for Google Search Console property-level verification and for
 * GA/GTM tags to land in <head> in the served HTML.
 *
 * Slot placement:
 *   header → parsed into real React elements. React 19 hoists <meta>/<link>/
 *            <title> (and async <script src>) into <head> in the server output
 *            (verification tags and analytics loaders are LITERALLY inside <head>
 *            for SEO/verification bots), and <script> tags execute (async `src`
 *            loaded from <head>; inline scripts run).
 *   body   → rendered at the top of the page <body>.
 *   footer → rendered at the end of the page <body>.
 *
 * The HTML is intentionally NOT sanitized: only authenticated CMS users author
 * it, and stripping <script> would defeat the entire feature.
 */

type Slot = 'header' | 'body' | 'footer';

// Render <script> via dangerouslySetInnerHTML so React keeps the inline body
// intact (and so inline analytics/config snippets actually run); other tags
// (<meta>/<link>/<title>) are left to React 19's automatic <head> hoisting.
const headerParseOptions: HTMLReactParserOptions = {
  replace: (node) => {
    if (node instanceof Element && node.name === 'script') {
      const props = attributesToProps(node.attribs);
      const inline = node.children
        .map((c) =>
          (c as { type?: string; data?: string }).type === 'text'
            ? (c as { data?: string }).data ?? ''
            : ''
        )
        .join('');
      return inline ? (
        <script {...props} dangerouslySetInnerHTML={{ __html: inline }} />
      ) : (
        <script {...props} />
      );
    }
    return undefined;
  },
};

/** header: real elements; React 19 hoists metadata + async scripts into <head>. */
function HeadHtml({ html }: { html: string }) {
  if (!html?.trim()) return null;
  return <>{parse(html, headerParseOptions) as React.ReactNode}</>;
}

/** body / footer: server-rendered in place inside the <body>. */
function BodyHtml({ html }: { html: string }) {
  if (!html?.trim()) return null;
  return (
    <div
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Render the requested slots from a page/post `codeInjection` object.
 *   - mount `slots={['header', 'body']}` near the top of the page
 *   - mount `slots={['footer']}` at the very end of the page
 */
export default function CodeInjection({
  code,
  slots,
}: {
  code?: CmsCodeInjection | null;
  slots: Slot[];
}) {
  if (!code) return null;
  return (
    <>
      {slots.includes('header') && <HeadHtml html={code.header ?? ''} />}
      {slots.includes('body') && <BodyHtml html={code.body ?? ''} />}
      {slots.includes('footer') && <BodyHtml html={code.footer ?? ''} />}
    </>
  );
}

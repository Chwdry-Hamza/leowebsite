'use client';

import * as React from 'react';
import type { CmsCodeInjection } from '@/lib/cms';

/**
 * Renders the per-page / per-post custom code injection (header / body / footer)
 * authored in the CMS — raw, admin-authored HTML/JS dropped in verbatim
 * (tracking pixels, chat widgets, verification meta, A/B-test tags, etc.).
 *
 * Slot placement:
 *   header → relocated into <head> on the client (see HeadInjection)
 *   body   → rendered at the top of the page <body>
 *   footer → rendered at the end of the page <body>
 *
 * Why <script> needs special handling: tags written through innerHTML /
 * dangerouslySetInnerHTML are parsed but NEVER executed by the browser. So we
 * always re-create <script> nodes into fresh elements, which DO execute (covers
 * both inline and `src=` scripts).
 *
 * The HTML is intentionally NOT sanitized: only authenticated CMS users author
 * it, and stripping <script> would defeat the entire feature.
 */

/** Re-create every <script> under `root` so the browser actually runs it. */
function activateScripts(root: HTMLElement): void {
  const scripts = Array.from(root.querySelectorAll('script'));
  for (const old of scripts) {
    const fresh = document.createElement('script');
    for (const attr of Array.from(old.attributes)) {
      fresh.setAttribute(attr.name, attr.value);
    }
    fresh.text = old.textContent ?? '';
    old.replaceWith(fresh);
  }
}

/** body / footer: render in place inside the <body>. */
function RawHtmlBlock({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) activateScripts(ref.current);
  }, []);

  if (!html?.trim()) return null;

  return (
    <div
      ref={ref}
      // The markup is server-rendered as-is; React never diffs its contents.
      suppressHydrationWarning
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Map raw HTML attribute names to their React prop equivalents. */
const ATTR_MAP: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  charset: 'charSet',
  'http-equiv': 'httpEquiv',
  crossorigin: 'crossOrigin',
  referrerpolicy: 'referrerPolicy',
  nomodule: 'noModule',
};

function toProps(attrStr: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const re = /([:.\w-]+)(?:\s*=\s*"([^"]*)"|\s*=\s*'([^']*)')?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrStr))) {
    const raw = m[1];
    if (!raw) continue;
    const name = ATTR_MAP[raw.toLowerCase()] ?? raw;
    const val = m[2] ?? m[3];
    props[name] = val === undefined ? true : val;
  }
  return props;
}

type ParsedTag = { tag: string; props: Record<string, unknown>; inner?: string };

/** Parse a head snippet into its top-level tags so we can render them as JSX. */
function parseHead(input: string): ParsedTag[] {
  const out: ParsedTag[] = [];
  // Paired tags (with inner content) first, removing them as we go.
  const paired = /<(script|style|title|noscript)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  const rest = input.replace(paired, (_full, tag: string, attrs: string, inner: string) => {
    out.push({ tag: tag.toLowerCase(), props: toProps(attrs), inner });
    return '';
  });
  // Void tags (meta / link / base) from what's left.
  const voids = /<(meta|link|base)\b([^>]*?)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = voids.exec(rest))) {
    out.push({ tag: m[1].toLowerCase(), props: toProps(m[2]) });
  }
  return out;
}

/**
 * header: render the snippet's tags as real React elements so they are present
 * in the SERVER-rendered HTML. React 19 hoists <meta>/<link>/<title>/<script>
 * (and <style precedence>) into <head>, so admin-authored verification meta,
 * pixels, and analytics tags appear in the served <head> (visible in view-source
 * and to non-JS crawlers), not just the live DOM after hydration.
 */
function HeadInjection({ html }: { html: string }) {
  if (!html?.trim()) return null;
  return (
    <>
      {parseHead(html).map(({ tag, props, inner }, i) => {
        if (tag === 'meta' || tag === 'link' || tag === 'base') {
          return React.createElement(tag, { key: i, ...props });
        }
        if (tag === 'title') {
          return (
            <title key={i} {...props}>
              {inner}
            </title>
          );
        }
        if (tag === 'style') {
          // `precedence` makes React hoist the <style> into <head>.
          return React.createElement('style', {
            key: i,
            precedence: 'leo-ci',
            ...props,
            dangerouslySetInnerHTML: { __html: inner ?? '' },
          });
        }
        if (tag === 'script' || tag === 'noscript') {
          return React.createElement(tag, {
            key: i,
            ...props,
            ...(inner ? { dangerouslySetInnerHTML: { __html: inner } } : {}),
          });
        }
        return null;
      })}
    </>
  );
}

type Slot = 'header' | 'body' | 'footer';

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
      {slots.includes('header') && <HeadInjection html={code.header ?? ''} />}
      {slots.includes('body') && <RawHtmlBlock html={code.body ?? ''} />}
      {slots.includes('footer') && <RawHtmlBlock html={code.footer ?? ''} />}
    </>
  );
}

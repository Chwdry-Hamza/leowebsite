'use client';

import React from 'react';
import { resolveLegalContent, type LegalContent } from '@/lib/legalContent';
import { useEditablePreview } from '@/hooks/usePreview';
import { safeHref } from '@/lib/sanitize';

/**
 * Renders a legal page (Prohibited Activities, Privacy Policy, E-Sign,
 * Card Terms) from CMS `sections`. Design stays in code; text comes from
 * `content`. In the CMS live-preview iframe (`?preview=1`) it listens for
 * postMessage updates and re-renders in real time.
 *
 * Text fields support light inline formatting so links survive CMS editing:
 *   - [label](url)            → link (relative or absolute)
 *   - bare emails / http URLs → auto-linked
 *   - **bold**                → bold white text
 */

const LINK = '#6FE3FF'; // leo cyan-300

function pushAutoLink(parts: React.ReactNode[], text: string) {
  const re = /([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    const href = tok.includes('@') ? `mailto:${tok}` : tok;
    parts.push(
      <a
        key={parts.length}
        href={href}
        style={{ color: LINK }}
        {...(tok.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {tok}
      </a>,
    );
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
}

function pushBold(parts: React.ReactNode[], text: string) {
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) pushAutoLink(parts, text.slice(last, m.index));
    parts.push(<strong key={parts.length} className="text-white">{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) pushAutoLink(parts, text.slice(last));
}

/** Render text with [label](url) links, auto-linked emails/URLs, and **bold**. */
function rich(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) pushBold(parts, text.slice(last, m.index));
    const href = safeHref(m[2]);
    parts.push(
      <a
        key={parts.length}
        href={href}
        style={{ color: LINK }}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) pushBold(parts, text.slice(last));
  return parts;
}

export default function LegalSections({
  initialContent,
  defaults,
}: {
  initialContent: LegalContent;
  defaults: LegalContent;
}) {
  // Legal body/items are markdown — tagged `data-cms-raw` so InlineEditRuntime
  // edits the source string, not the rendered output (which would destroy links).
  const { content, rootRef } = useEditablePreview(
    initialContent,
    React.useCallback((raw: unknown) => resolveLegalContent(defaults, raw), [defaults]),
  );

  const { header, body } = content;

  return (
    <div ref={rootRef}>
      <section className="relative overflow-hidden pt-6 sm:pt-8 bg-[#0a1527]">
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-2 md:pt-8 pb-16">
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-4 tracking-[-0.02em]">
            <span className="text-white" data-cms-field="header.white">{header.white}</span>{' '}
            <span style={{ color: LINK }} data-cms-field="header.accent">{header.accent}</span>
          </h1>
          {header.effectiveDate && (
            <p
              className="font-mono text-xs md:text-sm tracking-wide mb-10 text-fg-3"
              data-cms-field="header.effectiveDate"
            >
              {header.effectiveDate}
            </p>
          )}

          <div className="space-y-6 md:space-y-8 text-[15px] md:text-base leading-[1.7] text-fg-2">
            {body.sections.map((s, i) => (
              <div key={i}>
                {s.heading && (
                  <h2
                    className="font-display font-semibold text-xl md:text-2xl text-white tracking-[-0.01em] mt-10 mb-4"
                    data-cms-field={`body.sections.${i}.heading`}
                  >
                    {s.heading}
                  </h2>
                )}
                {s.body && (
                  <p
                    className="whitespace-pre-line"
                    data-cms-field={`body.sections.${i}.body`}
                    data-cms-raw={s.body}
                    data-cms-multiline
                  >
                    {rich(s.body)}
                  </p>
                )}
                {s.items && s.items.length > 0 && (
                  <ul className="list-disc pl-6 space-y-2 mt-3 marker:text-cyan-300">
                    {s.items.map((it, j) => (
                      <li
                        key={j}
                        data-cms-field={`body.sections.${i}.items.${j}`}
                        data-cms-raw={it}
                      >
                        {rich(it)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { resolveAboutContent, type AboutContent } from '@/lib/aboutContent';
import { useEditablePreview } from '@/hooks/usePreview';

/**
 * About page body, rendered from CMS `sections`. The design stays in code;
 * the text comes from `content`. In the CMS live-preview iframe (`?preview=1`)
 * it is edited inline — `useEditablePreview` streams updates, handles the
 * Edit toggle, and mounts the inline-edit runtime (mirrors HomeSections).
 * Fields are tagged with `data-cms-*`.
 */
export default function AboutSections({ initialContent }: { initialContent: AboutContent }) {
  const { content, rootRef } = useEditablePreview(initialContent, resolveAboutContent);
  const { hero, mission, vision, collaborations } = content;
  const partners = collaborations.partners ?? [];

  return (
    <div ref={rootRef}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-6 sm:pt-8 bg-[#0a1527]">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] blur-3xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(111,227,255,0.15) 0%, rgba(14,30,60,0.4) 35%, transparent 75%)' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-2 md:pt-8 pb-16">
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 md:mb-10 tracking-[-0.02em]">
            <span className="text-white" data-cms-field="hero.headingWhite">{hero.headingWhite}</span>{' '}
            <span className="text-cyan-300" data-cms-field="hero.headingAccent">{hero.headingAccent}</span>
          </h1>
          <p
            className="text-[15px] md:text-[17px] leading-[1.7] text-fg-2 max-w-3xl whitespace-pre-line"
            data-cms-field="hero.intro"
            data-cms-multiline
          >
            {hero.intro}
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="relative pb-12 md:pb-20 bg-[#0a1527]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h2
              className="font-display font-bold text-2xl md:text-3xl text-cyan-300 tracking-[0.04em] mb-4"
              data-cms-field="mission.heading"
            >
              {mission.heading}
            </h2>
            <p
              className="text-[15px] md:text-base leading-[1.7] text-fg-2 whitespace-pre-line"
              data-cms-field="mission.body"
              data-cms-multiline
            >
              {mission.body}
            </p>
          </div>
          <div>
            <h2
              className="font-display font-bold text-2xl md:text-3xl text-cyan-300 tracking-[0.04em] mb-4"
              data-cms-field="vision.heading"
            >
              {vision.heading}
            </h2>
            <p
              className="text-[15px] md:text-base leading-[1.7] text-fg-2 whitespace-pre-line"
              data-cms-field="vision.body"
              data-cms-multiline
            >
              {vision.body}
            </p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="relative pb-24 md:pb-32 bg-[#0a1527]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <h2 className="font-display font-bold text-2xl md:text-4xl mb-10 tracking-[-0.01em]">
            <span className="text-white" data-cms-field="collaborations.headingBefore">{collaborations.headingBefore}</span>
            <span className="text-cyan-300" data-cms-field="collaborations.headingHighlight">{collaborations.headingHighlight}</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-12 md:gap-y-6">
            {partners.map((p, i) => (
              <span
                key={`${p}-${i}`}
                data-cms-field={`collaborations.partners.${i}`}
                className="font-display font-bold text-base md:text-lg text-fg-2/80 tracking-wider uppercase"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

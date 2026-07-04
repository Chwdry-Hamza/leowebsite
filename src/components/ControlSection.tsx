import React from 'react';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

const cardBase =
  'relative rounded-[22px] overflow-hidden bg-[#5ccbe3] border border-[rgba(92,203,227,0.6)] shadow-[0_30px_60px_rgba(0,0,0,0.45),0_0_0_1px_rgba(92,203,227,0.25)] px-6 pt-7 pb-[26px] transition-[transform,box-shadow] duration-[220ms] ease-leo-out hover:shadow-[0_40px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(155,230,255,0.55)]';
const cardSide = `${cardBase} hover:-translate-y-[6px]`;
const cardCenter = `${cardBase} desktop:-translate-y-[10px] desktop:hover:-translate-y-[16px]`;
const cardMediaBase =
  'rounded-[14px] overflow-hidden bg-[rgba(4,7,15,0.45)] mb-[22px] flex items-center justify-center';
const cardBody = {
  h3: 'font-display font-bold text-[22px] tracking-[0.04em] text-navy-950 mb-2.5 mt-0',
  p: 'text-sm leading-[1.5] text-[rgba(4,7,15,0.72)] m-0',
};

type Props = { content?: HomeContent['control'] };

const ControlSection: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.control;
  return (
    <section className="relative overflow-hidden py-10 bg-[#0a1527]">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.55] bg-[radial-gradient(ellipse_800px_260px_at_50%_22%,#123a5a,transparent_70%)]"
      />

      <div className="relative z-[1] max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="leo-reveal text-center max-w-[900px] mx-auto mb-10 md:mb-16">
          <div
            data-cms-field="control.eyebrow"
            className="font-display text-xs font-medium tracking-[0.28em] uppercase text-[#B8C8E2] mb-[22px]"
          >
            {c.eyebrow}
          </div>
          <h2 className="font-display font-bold text-[clamp(28px,5.2vw,68px)] leading-[1.05] tracking-[-0.02em] text-white m-0">
            <span data-cms-field="control.titlePart1">{c.titlePart1}</span>
            <em data-cms-field="control.titleAccent1" className="not-italic text-cyan-300">
              {c.titleAccent1}
            </em>
            <span data-cms-field="control.titlePart2">{c.titlePart2}</span>
            <em data-cms-field="control.titleAccent2" className="not-italic text-cyan-300">
              {c.titleAccent2}
            </em>
            <span data-cms-field="control.titlePart3">{c.titlePart3}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 desktop:grid-cols-[1fr_1.12fr_1fr] gap-7 items-center">
          {c.cards.map((card, i) => {
            const isCenter = i === 1;
            const mediaClass = isCenter ? cardMediaBase : `${cardMediaBase} aspect-[9/10]`;
            const articleClass = isCenter ? `leo-reveal ${cardCenter}` : `leo-reveal ${cardSide}`;
            const style = i > 0 ? ({ ['--d' as any]: `${i * 120}ms` } as React.CSSProperties) : undefined;
            return (
              <article key={i} className={articleClass} style={style}>
                <div className={mediaClass} data-cms-field={`control.cards.${i}.image`} data-cms-type="image">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className={isCenter ? 'w-full h-auto block rounded-[14px]' : 'w-full h-full object-cover rounded-[14px]'}
                    draggable={false}
                  />
                </div>
                <div>
                  <h3 data-cms-field={`control.cards.${i}.title`} className={cardBody.h3}>{card.title}</h3>
                  <p data-cms-field={`control.cards.${i}.desc`} className={cardBody.p}>{card.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ControlSection;

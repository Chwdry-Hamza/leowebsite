import React from 'react';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

const PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1564564295391-7f24f26f568b?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face',
];

type Props = { content?: HomeContent['joinUs'] };

const JoinUsSection: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.joinUs;
  return (
    <section className="relative overflow-hidden pt-16 md:pt-32 pb-24 md:pb-48 bg-[#0a1527]">
      {/* Photo grid background */}
      <div className="absolute inset-y-0 left-0 right-0 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
        {PHOTOS.map((src, i) => (
          <div key={i} className="h-40 sm:h-52 md:h-64 rounded-lg overflow-hidden relative">
            <img
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-40"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="leo-reveal relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 text-center py-16 md:py-24">
        <p
          data-cms-field="joinUs.eyebrow"
          className="font-display text-xs font-medium tracking-[0.28em] uppercase text-[#B8C8E2] mb-[22px]"
        >
          {c.eyebrow}
        </p>
        <h2 className="font-display font-bold text-[clamp(32px,5.2vw,68px)] leading-[1.05] tracking-[-0.02em] text-white m-0 mb-5">
          <span data-cms-field="joinUs.titleWhite">{c.titleWhite}</span>
          <em data-cms-field="joinUs.titleAccent" className="not-italic text-cyan-300">{c.titleAccent}</em>
        </h2>
        <p
          data-cms-field="joinUs.subtitle"
          data-cms-multiline
          className="text-[15px] leading-[1.6] text-fg-2 text-center max-w-[520px] mx-auto mb-8 whitespace-pre-line"
        >
          {c.subtitle}
        </p>
        <a
          href={c.ctaUrl}
          data-cms-href="joinUs.ctaUrl"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-sans font-semibold text-[15px] leading-none px-[22px] py-3 rounded-[10px] border border-transparent cursor-pointer bg-cyan-300 text-navy-950 transition-all duration-[180ms] ease-leo-out hover:bg-cyan-200 hover:-translate-y-px"
        >
          <span data-cms-field="joinUs.ctaLabel">{c.ctaLabel}</span>
          <span className="inline-block transition-transform duration-200 ease-leo-out group-hover:translate-x-[3px]">
            →
          </span>
        </a>
      </div>
    </section>
  );
};

export default JoinUsSection;

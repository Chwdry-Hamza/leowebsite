import React from 'react';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

type Props = { content?: HomeContent['transfer'] };

const TransferSection: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.transfer;
  return (
    <section
      id="transfer"
      className="relative overflow-hidden pt-12 md:pt-[60px] pb-16 md:pb-[100px] bg-[#0a1527]"
    >
      <div className="relative z-[1] max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 desktop:grid-cols-[1.1fr_1fr] gap-10 desktop:gap-[60px] items-center text-center desktop:text-left">
        <div className="leo-reveal max-w-[560px] mx-auto desktop:mx-0 desktop:justify-self-start">
          <p
            data-cms-field="transfer.eyebrow"
            className="font-display text-xs font-medium tracking-[0.3em] uppercase text-[#B8C8E2] mb-[22px]"
          >
            {c.eyebrow}
          </p>
          <h2 className="font-display font-bold text-[clamp(28px,4.6vw,60px)] leading-[1.05] tracking-[-0.02em] text-white mb-7">
            <span data-cms-field="transfer.titleLine1">{c.titleLine1}</span>
            <br />
            BORDERS —{' '}
            <em data-cms-field="transfer.titleAccent" className="not-italic text-cyan-300">
              {c.titleAccent}
            </em>
            <br />
            <span data-cms-field="transfer.titleLine3">{c.titleLine3}</span>
          </h2>
          <p
            data-cms-field="transfer.subtitle"
            data-cms-multiline
            className="text-[15px] leading-[1.6] text-fg-2 max-w-[520px] mx-auto desktop:mx-0 whitespace-pre-line"
          >
            {c.subtitle}
          </p>
        </div>

        <div
          className="leo-reveal relative flex items-center justify-center desktop:justify-end desktop:pl-10 lg:desktop:pl-20 desktop:pr-0 desktop:mr-0 lg:desktop:mr-12"
          style={{ ['--d' as any]: '120ms' }}
        >
          <div
            aria-hidden
            className="absolute -top-[20%] -left-[20%] -right-[20%] bottom-0 pointer-events-none z-0 blur-[80px] animate-leo-hero-glow bg-[radial-gradient(ellipse_at_center,rgba(111,227,255,0.7)_0%,rgba(111,227,255,0.3)_35%,transparent_65%)]"
          />
          <div
            aria-hidden
            className="absolute top-[-20%] bottom-0 right-[-30%] w-[60%] pointer-events-none z-0 blur-[80px] animate-leo-hero-glow bg-[radial-gradient(ellipse_at_center,rgba(111,227,255,0.7)_0%,rgba(111,227,255,0.3)_35%,transparent_65%)]"
          />
          <div
            data-cms-field="transfer.mockupImage"
            data-cms-type="image"
            className="relative z-[1] block"
          >
            <img
              src={c.mockupImage}
              alt={c.mockupAlt}
              className="w-full max-w-[228px] h-auto object-contain [filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.55))]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransferSection;

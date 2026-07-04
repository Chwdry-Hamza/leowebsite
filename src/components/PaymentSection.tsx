import React from 'react';
import FlipCard from './FlipCard';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

type Props = { content?: HomeContent['payment'] };

const PaymentSection: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.payment;
  return (
    <section
      id="payment"
      className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-[100px] bg-[#0a1527]"
    >
      <div className="relative z-[1] w-full max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center">
        <div className="leo-reveal flex flex-col items-center w-full">
          <p
            data-cms-field="payment.eyebrow"
            className="font-display text-[13px] font-medium tracking-[0.28em] uppercase text-[#B8C8E2] mb-[22px] text-center"
          >
            {c.eyebrow}
          </p>
          <h2 className="font-display font-bold text-[clamp(32px,5.2vw,68px)] leading-[1.05] tracking-[-0.02em] text-center mb-5">
            <span data-cms-field="payment.titleWhite" className="text-white">{c.titleWhite}</span>{' '}
            <em data-cms-field="payment.titleAccent" className="not-italic text-cyan-300">
              {c.titleAccent}
            </em>
          </h2>
          <p
            data-cms-field="payment.subtitle"
            data-cms-multiline
            className="text-[15px] md:text-[17px] leading-[1.5] text-fg-2 text-center max-w-[460px] mb-4 whitespace-pre-line"
          >
            {c.subtitle}
          </p>
        </div>

        <div className="leo-reveal relative w-full max-w-[860px] mx-auto mb-[-80px] md:mb-[-140px] -translate-y-[20px] md:-translate-y-[40px]" style={{ ['--d' as any]: '120ms' }}>
          <div
            aria-hidden
            className="absolute -inset-[20%] pointer-events-none z-0 blur-[80px] animate-leo-hero-glow bg-[radial-gradient(ellipse_at_center,rgba(111,227,255,0.7)_0%,rgba(111,227,255,0.3)_35%,transparent_65%)]"
          />
          <div className="relative z-[1]">
            <FlipCard
              frontSrc={c.cardFrontSrc}
              backSrc={c.cardBackSrc}
              frontAlt={c.cardFrontAlt}
              backAlt={c.cardBackAlt}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;

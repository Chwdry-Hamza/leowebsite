import React from 'react';
import type { HomeContent } from '@/lib/homeContent';

type Props = {
  /** Defaults to HOME_CONTENT_DEFAULTS.hero when omitted — preserves old call sites. */
  content?: HomeContent['hero'];
};

const HeroSection: React.FC<Props> = ({ content }) => {
  // Prop is optional so old static usage still works; when wired through
  // HomeSections, the resolved CMS-merged content flows in.
  const c = content;
  if (!c) {
    // Fallback: render the original hardcoded markup
    return <HeroSectionFallback />;
  }

  return (
    <section className="relative overflow-hidden pt-10 pb-20 bg-[#0a1527]">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_900px_500px_at_75%_10%,rgba(78,203,255,0.12),transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.35] bg-[length:96px_100%] bg-[linear-gradient(to_right,rgba(111,227,255,0.06)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_70%,transparent_100%)]"
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="relative grid grid-cols-1 desktop:grid-cols-[1.5fr_1fr] gap-10 desktop:gap-20 items-center">
          <div className="leo-reveal is-in">
            <h1 className="font-display font-bold text-[clamp(36px,6.2vw,84px)] leading-[0.98] tracking-[-0.035em] text-cyan-300 mb-6">
              <span data-cms-field="hero.titleHighlight">{c.titleHighlight}</span>{' '}
              <em
                data-cms-field="hero.titleSuffix"
                className="not-italic text-white"
              >
                {c.titleSuffix}
              </em>
            </h1>

            <p
              data-cms-field="hero.subtitle"
              data-cms-multiline
              className="text-[16px] md:text-[19px] leading-[1.5] text-fg-2 max-w-[520px] mb-9 whitespace-pre-line"
            >
              {c.subtitle}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={c.ctaUrl}
                data-cms-href="hero.ctaUrl"
                data-cms-href-below
                className="group inline-flex items-center gap-2 font-sans font-semibold text-[15px] leading-none px-[22px] py-3 rounded-[10px] border border-transparent cursor-pointer bg-cyan-300 text-navy-950 transition-all duration-[180ms] ease-leo-out hover:bg-cyan-200 hover:-translate-y-px"
              >
                <span data-cms-field="hero.ctaLabel">{c.ctaLabel}</span>
                <span className="inline-block transition-transform duration-200 ease-leo-out group-hover:translate-x-[3px]">
                  →
                </span>
              </a>
            </div>
          </div>

          <div
            className="leo-reveal is-in group order-first desktop:order-none ml-0 desktop:ml-0 relative h-[360px] sm:h-[440px] desktop:h-[520px] pt-10 desktop:pt-16 flex items-center justify-center desktop:justify-end"
            style={{ ['--d' as any]: '120ms' }}
          >
            <div
              aria-hidden
              className="absolute -top-[10%] -bottom-[10%] inset-x-0 right-0 w-full pointer-events-none z-0 blur-[70px] animate-leo-hero-glow bg-[radial-gradient(circle_at_75%_50%,rgba(111,227,255,0.65),transparent_60%)] desktop:bottom-[1px]"
            />
            <div
              data-cms-field="hero.heroImage"
              data-cms-type="image"
              className="relative z-[1] max-w-full max-h-full w-auto h-full flex items-center justify-center"
            >
              <img
                src={c.heroImage}
                alt={c.heroImageAlt}
                className="max-w-full max-h-full w-auto h-full object-contain drop-shadow-[0_20px_60px_rgba(111,227,255,0.4)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Original hardcoded fallback — kept so existing call sites without props still work. */
const HeroSectionFallback: React.FC = () => (
  <section className="relative overflow-hidden pt-10 pb-20 bg-[#0a1527]">
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_900px_500px_at_75%_10%,rgba(78,203,255,0.12),transparent_60%)]"
    />
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-[0.35] bg-[length:96px_100%] bg-[linear-gradient(to_right,rgba(111,227,255,0.06)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_70%,transparent_100%)]"
    />
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
      <div className="relative grid grid-cols-1 desktop:grid-cols-[1.5fr_1fr] gap-10 desktop:gap-20 items-center">
        <div className="leo-reveal is-in">
          <h1 className="font-display font-bold text-[clamp(36px,6.2vw,84px)] leading-[0.98] tracking-[-0.035em] text-cyan-300 mb-6">
            MONEY, <em className="not-italic text-white">MADE SIMPLE.</em>
          </h1>
          <p className="text-[16px] md:text-[19px] leading-[1.5] text-fg-2 max-w-[520px] mb-9">
            Send, spend, split, and save — in one quietly beautiful app.
            Free to start, honest at every turn, and built to last.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="#get"
              className="group inline-flex items-center gap-2 font-sans font-semibold text-[15px] leading-none px-[22px] py-3 rounded-[10px] border border-transparent cursor-pointer bg-cyan-300 text-navy-950 transition-all duration-[180ms] ease-leo-out hover:bg-cyan-200 hover:-translate-y-px"
            >
              GET LEO APP
              <span className="inline-block transition-transform duration-200 ease-leo-out group-hover:translate-x-[3px]">→</span>
            </a>
          </div>
        </div>
        <div
          className="leo-reveal is-in group order-first desktop:order-none ml-0 desktop:ml-0 relative h-[360px] sm:h-[440px] desktop:h-[520px] pt-10 desktop:pt-16 flex items-center justify-center desktop:justify-end"
          style={{ ['--d' as any]: '120ms' }}
        >
          <div
            aria-hidden
            className="absolute -top-[10%] -bottom-[10%] inset-x-0 right-0 w-full pointer-events-none z-0 blur-[70px] animate-leo-hero-glow bg-[radial-gradient(circle_at_75%_50%,rgba(111,227,255,0.65),transparent_60%)] desktop:bottom-[1px]"
          />
          <img
            src="/heroImagee.png"
            alt="Leo app preview"
            className="relative z-[1] max-w-full max-h-full w-auto h-full object-contain drop-shadow-[0_20px_60px_rgba(111,227,255,0.4)]"
          />
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

import React from 'react';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

type Props = { content?: HomeContent['collaborations'] };

const CollaborationsSection: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.collaborations;
  return (
    <section className="relative overflow-hidden pt-4 md:pt-12 pb-4 md:pb-8 bg-[#0a1527]">
      {/* Subtle light streaks - Mobile (vertical) */}
      <div className="md:hidden absolute top-0 bottom-0 left-1/2 w-64 -translate-x-1/2 pointer-events-none">
        <div
          className="absolute inset-0 transform -skew-x-3"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(111,227,255,0.14), transparent)' }}
        />
        <div
          className="absolute inset-0 transform skew-x-2 translate-x-8"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(111,227,255,0.08), transparent)' }}
        />
      </div>

      {/* Subtle light streaks - Tablet/Desktop (horizontal) */}
      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-64 -translate-y-1/2 pointer-events-none">
        <div
          className="absolute inset-0 transform -skew-y-3"
          style={{ background: 'linear-gradient(to right, transparent, rgba(111,227,255,0.14), transparent)' }}
        />
        <div
          className="absolute inset-0 transform skew-y-2 translate-y-8"
          style={{ background: 'linear-gradient(to right, transparent, rgba(111,227,255,0.08), transparent)' }}
        />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden relative z-10 w-full px-6">
        <h2 className="leo-reveal font-display text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-12">
          <span data-cms-field="collaborations.headingBefore" className="text-white">{c.headingBefore}</span>
          <em data-cms-field="collaborations.headingAccent" className="not-italic text-cyan-300">{c.headingAccent}</em>
        </h2>

        {/* Partner Logos - Stacked vertically */}
        <div className="leo-reveal flex flex-col items-center gap-7 sm:gap-8 mb-14" style={{ ['--d' as any]: '120ms' }}>
          {/* BitGo */}
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 border-2 border-white/80 rounded-lg flex items-center justify-center">
              <span className="text-[10px] font-bold">₿</span>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">BitGo</span>
          </div>

          {/* FENIGE */}
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8v8l-7 3.5L5 16V8l7-3.5z" />
            </svg>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">FENIGE</span>
              <p className="text-[9px] text-white/60">all about payments</p>
            </div>
          </div>

          {/* INTERCOM */}
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M7 8v8M10 6v12M13 8v8M17 6v12" />
            </svg>
            <span className="text-lg sm:text-xl font-bold tracking-wide">INTERCOM</span>
          </div>

          {/* PLAID */}
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
            <span className="text-lg sm:text-xl font-bold tracking-wide">PLAID</span>
          </div>

          {/* QUICKO */}
          <div className="flex items-center gap-1 text-white">
            <span className="text-lg sm:text-xl font-light">((</span>
            <span className="text-lg sm:text-xl font-bold tracking-widest">QUICKO</span>
          </div>

          {/* onfido */}
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 border-2 border-white/80 rounded-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white/80 rounded-full" />
            </div>
            <span className="text-lg sm:text-xl font-medium">onfido</span>
          </div>

          {/* Verestro */}
          <div className="text-white text-center">
            <span className="text-lg sm:text-xl font-light tracking-wider">Verestro</span>
            <span className="text-[9px] align-top">™</span>
            <p className="text-[9px] text-amber-400">Fintech as a service</p>
          </div>

          {/* YAPILY */}
          <div className="text-white">
            <span className="text-lg sm:text-xl font-black tracking-wider">YAPILY</span>
          </div>

          {/* BINARYX */}
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 12l9-9 9 9-9 9-9-9z" />
            </svg>
            <span className="text-lg sm:text-xl font-bold tracking-wider">BINARYX</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block relative z-10 w-full max-w-[1520px] mx-auto px-6 md:px-8">
        <h2 className="leo-reveal font-display text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-12 md:mb-14 lg:mb-20">
          <span className="text-white">{c.headingBefore}</span>
          <em className="not-italic text-cyan-300">{c.headingAccent}</em>
        </h2>

        {/* Partner Logos - Row 1 */}
        <div className="leo-reveal flex items-center justify-center gap-6 md:gap-8 lg:gap-16 mb-8 md:mb-10 lg:mb-12 flex-wrap" style={{ ['--d' as any]: '120ms' }}>
          {/* BitGo */}
          <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
            <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 border-2 border-white/60 rounded-full flex items-center justify-center">
              <span className="text-[9px] md:text-[10px] lg:text-xs font-bold">₿</span>
            </div>
            <span className="text-sm md:text-base lg:text-xl font-bold tracking-tight">BitGo</span>
          </div>

          {/* FENIGE */}
          <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
            <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8v8l-7 3.5L5 16V8l7-3.5z" />
            </svg>
            <div>
              <span className="text-sm md:text-base lg:text-xl font-bold tracking-tight">FENIGE</span>
              <p className="text-[7px] lg:text-[8px] text-white/50">all about payments</p>
            </div>
          </div>

          {/* INTERCOM */}
          <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
            <svg className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M7 8v8M10 6v12M13 8v8M17 6v12" />
            </svg>
            <span className="text-sm md:text-base lg:text-xl font-bold tracking-wide">INTERCOM</span>
          </div>

          {/* PLAID */}
          <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
            <svg className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
            <span className="text-sm md:text-base lg:text-xl font-bold tracking-wide">PLAID</span>
          </div>

          {/* QUICKO */}
          <div className="flex items-center gap-1 text-white/80">
            <span className="text-sm md:text-base lg:text-xl font-light">((</span>
            <span className="text-sm md:text-base lg:text-xl font-bold tracking-widest">QUICKO</span>
          </div>
        </div>

        {/* Partner Logos - Row 2 */}
        <div className="leo-reveal flex items-center justify-center gap-6 md:gap-8 lg:gap-16 mb-16 md:mb-20 lg:mb-32 flex-wrap" style={{ ['--d' as any]: '240ms' }}>
          {/* onfido */}
          <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
            <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border border-white/60 rounded flex items-center justify-center">
              <div className="w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 bg-white/60 rounded-full" />
            </div>
            <span className="text-sm md:text-base lg:text-xl font-medium">onfido</span>
          </div>

          {/* Verestro */}
          <div className="text-white/80">
            <span className="text-base md:text-lg lg:text-2xl font-light tracking-wider">Verestro</span>
            <span className="text-[7px] lg:text-[8px] align-top">™</span>
            <p className="text-[7px] lg:text-[8px] text-white/50 text-center">Fintech as a service</p>
          </div>

          {/* YAPILY */}
          <div className="text-white/80">
            <span className="text-base md:text-lg lg:text-2xl font-black tracking-wider">YAPILY</span>
          </div>

          {/* BINARYX */}
          <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
            <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 12l9-9 9 9-9 9-9-9z" />
            </svg>
            <span className="text-sm md:text-base lg:text-xl font-bold tracking-wider">BINARYX</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborationsSection;

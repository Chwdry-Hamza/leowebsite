import React from 'react';
import Link from 'next/link';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

type Props = { content?: HomeContent['navBar'] };

const NavBar: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.navBar;
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[linear-gradient(90deg,#051221_0%,#051221_50%,#0e1d38_75%,#123a5a_100%)]">
      <div className="h-[68px] flex items-center justify-between max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-[10px] font-display font-bold text-[18px] tracking-[-0.01em] text-fg-1 min-w-0"
        >
          <span data-cms-field="navBar.logoSrc" data-cms-type="image">
            <img
              src={c.logoSrc}
              alt={c.logoAlt}
              className="block w-auto h-[64px] sm:h-[80px] md:h-[90px] object-cover -my-[16px] sm:-my-[22px] md:-my-[26px] brightness-125 drop-shadow-[0_0_8px_rgba(111,227,255,0.45)]"
            />
          </span>
        </Link>

        <div className="flex items-center gap-4 shrink-0">
          <a
            href={c.ctaUrl}
            data-cms-href="navBar.ctaUrl"
            data-cms-href-below
            className="group inline-flex items-center gap-1.5 sm:gap-2 font-sans font-semibold text-xs sm:text-sm leading-none px-3 sm:px-[22px] py-2.5 sm:py-3 rounded-[10px] border border-transparent cursor-pointer bg-cyan-300 text-navy-950 transition-all duration-[180ms] ease-leo-out hover:bg-cyan-200 hover:-translate-y-px whitespace-nowrap"
          >
            <span data-cms-field="navBar.ctaLabel">{c.ctaLabel}</span>
            <span className="inline-block transition-transform duration-200 ease-leo-out group-hover:translate-x-[3px]">
              →
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

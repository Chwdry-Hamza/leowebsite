'use client';

import React, { useState, useEffect } from 'react';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

const SECTIONS = ['payment', 'transfer', 'crypto'];

type Props = { content?: HomeContent['bottomNav'] };

const BottomNav: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.bottomNav;
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-20% 0px -50% 0px' }
    );

    SECTIONS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav data-leo-bottom-nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[2147483647] flex w-[calc(100%-32px)] max-w-[300px] rounded-2xl border border-[rgba(111,227,255,0.18)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)] bg-[rgba(10,21,39,0.6)]">
        <div className="flex items-center justify-between px-3 py-2 w-full">
          <a href="#home" className="inline-flex items-center">
            <img
              src={c.logoSrc}
              alt="LEO"
              className="block w-auto h-12 object-cover brightness-125 drop-shadow-[0_0_8px_rgba(111,227,255,0.45)]"
            />
          </a>
          <a
            href={c.ctaUrl}
            className="group inline-flex items-center gap-1.5 font-sans font-semibold text-xs leading-none px-4 py-2.5 rounded-[10px] border border-transparent cursor-pointer bg-cyan-300 text-navy-950 transition-all duration-[180ms] ease-leo-out hover:bg-cyan-200 hover:-translate-y-px"
          >
            {c.ctaLabel}
            <span className="inline-block transition-transform duration-200 ease-leo-out group-hover:translate-x-[3px]">
              →
            </span>
          </a>
        </div>
      </nav>

      {/* Desktop Bottom Nav */}
      <div data-leo-bottom-nav className="hidden md:flex fixed bottom-5 lg:bottom-6 xl:bottom-8 left-0 right-0 items-center justify-center px-4 lg:px-6 z-50">
        <nav className="w-full max-w-[760px] lg:max-w-[980px] xl:max-w-[1180px] backdrop-blur-md rounded-2xl px-3 py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 flex items-center justify-between gap-2 lg:gap-4 border border-[rgba(111,227,255,0.18)] bg-[rgba(10,21,39,0.6)] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          {/* Logo */}
          <div className="shrink-0 -ml-[12px] lg:-ml-[24px]">
            <a href="#home" className="inline-flex items-center">
              <img
                src={c.logoSrc} data-cms-field-parent="bottomNav.logoSrc"
                alt="LEO"
                className="block h-10 lg:h-16 xl:h-20 w-auto object-cover brightness-125 drop-shadow-[0_0_8px_rgba(111,227,255,0.45)]"
              />
            </a>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-3 lg:gap-8 xl:gap-12">
            <NavItem icon={<CardIcon />} label="Cards" href="#payment" isActive={activeSection === 'payment'} />
            <NavItem icon={<SendIcon />} label="Transfer" href="#transfer" isActive={activeSection === 'transfer'} />
            <NavItem icon={<CryptoIcon />} label="Crypto" href="#crypto" isActive={activeSection === 'crypto'} />
          </div>

          {/* CTA Button — matches header NavBar style */}
          <a
            href={c.ctaUrl}
            className="group shrink-0 inline-flex items-center gap-1.5 lg:gap-2 font-sans font-semibold text-xs lg:text-sm leading-none px-3 py-2 lg:px-[22px] lg:py-3 rounded-[10px] border border-transparent cursor-pointer bg-cyan-300 text-navy-950 transition-all duration-[180ms] ease-leo-out hover:bg-cyan-200 hover:-translate-y-px whitespace-nowrap"
          >
            {c.ctaLabel}
            <span className="inline-block transition-transform duration-200 ease-leo-out group-hover:translate-x-[3px]">
              →
            </span>
          </a>
        </nav>
      </div>
    </>
  );
};

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
};

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, isActive }) => (
  <a
    href={href}
    className={`group flex flex-col items-center gap-1 transition-colors cursor-pointer ${
      isActive ? 'text-cyan-300' : 'text-fg-2 hover:text-white'
    }`}
  >
    <span
      className={`w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 transition-transform duration-200 ease-leo-out ${
        isActive ? 'scale-110' : 'group-hover:-translate-y-px'
      }`}
    >
      {icon}
    </span>
    <span
      className={`font-display text-[11px] lg:text-sm xl:text-base tracking-[0.04em] whitespace-nowrap ${
        isActive ? 'font-semibold' : 'font-medium'
      }`}
    >
      {label}
    </span>
  </a>
);

const CardIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-full h-full"
  >
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
    <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
    <rect x="5" y="13" width="3.5" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
    <line x1="14" y1="14.25" x2="19" y2="14.25" />
  </svg>
);

const SendIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-full h-full"
  >
    <path d="M21 3L3 10.5l7 2.5 2.5 7L21 3z" />
    <path d="M10 13L21 3" />
  </svg>
);

const CryptoIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-full h-full"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 7.5h4.25a2.25 2.25 0 010 4.5H9.5z" />
    <path d="M9.5 12h4.75a2.25 2.25 0 010 4.5H9.5z" />
    <line x1="11" y1="5.5" x2="11" y2="7.5" />
    <line x1="11" y1="16.5" x2="11" y2="18.5" />
    <line x1="13" y1="5.5" x2="13" y2="7.5" />
    <line x1="13" y1="16.5" x2="13" y2="18.5" />
  </svg>
);

export default BottomNav;

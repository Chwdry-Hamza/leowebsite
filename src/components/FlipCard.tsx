'use client';

import React, { useState } from 'react';

type FlipCardProps = {
  frontSrc?: string;
  backSrc?: string;
  frontAlt?: string;
  backAlt?: string;
  className?: string;
};

const cardClasses =
  'group relative w-full max-w-[860px] aspect-[1.5/1] [perspective:1200px] cursor-pointer outline-none transition-transform duration-700 [transition-timing-function:cubic-bezier(0.4,0.2,0.2,1)] [will-change:transform] hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-cyan-300 focus-visible:outline-offset-8 focus-visible:rounded-2xl motion-reduce:transition-none';

const innerClasses =
  'relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.4,0.2,0.2,1)] [will-change:transform] motion-reduce:transition-none';

const faceBase =
  'absolute inset-0 w-full h-full object-contain [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-[20px] [filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.55))_drop-shadow(0_0_24px_rgba(111,227,255,0.25))] group-hover:[filter:drop-shadow(0_40px_80px_rgba(0,0,0,0.6))_drop-shadow(0_0_34px_rgba(111,227,255,0.45))] transition-[filter] duration-700 [transition-timing-function:cubic-bezier(0.4,0.2,0.2,1)] select-none [-webkit-user-drag:none] motion-reduce:transition-none';

const FlipCard: React.FC<FlipCardProps> = ({
  frontSrc = '/leoFrontCard.png',
  backSrc = '/leoBackCard.png',
  frontAlt = 'Card front',
  backAlt = 'Card back',
  className = '',
}) => {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const showBack = flipped !== hovered;

  const toggle = () => setFlipped((v) => !v);

  return (
    <div
      className={`${cardClasses} ${className}`}
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={showBack}
      aria-label={showBack ? 'Show card front' : 'Show card back'}
    >
      <div
        className={innerClasses}
        style={{ transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <img
          src={frontSrc}
          alt={frontAlt}
          className={`${faceBase} [transform:rotateY(0deg)_scale(0.72)]`}
          draggable={false}
        />
        <img
          src={backSrc}
          alt={backAlt}
          className={`${faceBase} [transform:rotateY(180deg)_scale(0.9)]`}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default FlipCard;

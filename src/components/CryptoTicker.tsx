import React from 'react';
import { HOME_CONTENT_DEFAULTS, type HomeContent } from '@/lib/homeContent';

type Props = { content?: HomeContent['cryptoTicker'] };

const CryptoTicker: React.FC<Props> = ({ content }) => {
  const c = content ?? HOME_CONTENT_DEFAULTS.cryptoTicker;
  return (
    <section
      aria-label="Live crypto prices"
      className="group relative overflow-hidden border-y border-[rgba(111,227,255,0.08)] py-[60px] bg-[#0a1527]"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_900px_200px_at_30%_50%,rgba(78,203,255,0.10),transparent_60%),radial-gradient(ellipse_700px_180px_at_80%_50%,rgba(78,203,255,0.06),transparent_70%)]"
      />

      <div
        className="relative z-[1] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <div className="flex gap-[18px] w-max animate-[leo-marquee_60s_linear_infinite] [@media(hover:hover)]:group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...c.coins, ...c.coins].map((coin, i) => (
            <div
              key={`${coin.symbol}-${i}`}
              className="inline-flex items-center gap-2.5 whitespace-nowrap py-2 px-4 border border-[rgba(111,227,255,0.12)] rounded-full bg-cyan-300/[0.04] transition-[border-color,background] duration-[180ms] hover:border-[rgba(111,227,255,0.28)] hover:bg-cyan-300/[0.08]"
            >
              <span className="font-display font-bold text-[13px] tracking-[0.06em] text-cyan-300">
                {coin.symbol}
              </span>
              <span className="font-mono text-[13px] font-medium text-fg-1">
                {coin.price}
              </span>
              <span
                className={`font-mono text-xs font-semibold tracking-[0.02em] ${
                  coin.up ? 'text-success' : 'text-danger'
                }`}
              >
                {coin.up ? '▲' : '▼'} {coin.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CryptoTicker;

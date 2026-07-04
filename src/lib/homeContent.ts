/**
 * Homepage content model.
 *
 * The landing page is hand-coded React (layout + animation lives in the
 * components), but the editable bits — headings, subtitles, images, and CTAs —
 * live here so the CMS can override them via the home Page's `sections` field.
 *
 * Adding a new editable section:
 *   1. Add its slice to HomeContent below
 *   2. Add the defaults to HOME_CONTENT_DEFAULTS (matching the current copy)
 *   3. In the section component, accept `content: HomeContent['xxx']` as a prop
 *      and tag fields with `data-cms-field="xxx.fieldName"`
 *   4. Pass `content.xxx` to it from HomeSections
 */

export type CryptoTickerEntry = {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
};

export type HomeContent = {
  navBar: {
    logoSrc: string;
    logoAlt: string;
    ctaLabel: string;
    ctaUrl: string;
  };
  hero: {
    titleHighlight: string;
    titleSuffix: string;
    subtitle: string;
    ctaLabel: string;
    ctaUrl: string;
    heroImage: string;
    heroImageAlt: string;
  };
  control: {
    eyebrow: string;
    /** "OWN EVERY [accent] YOUR [accent2] MAKES" — split for the cyan emphasis. */
    titlePart1: string;
    titleAccent1: string;
    titlePart2: string;
    titleAccent2: string;
    titlePart3: string;
    cards: {
      title: string;
      desc: string;
      image: string;
      alt: string;
    }[];
  };
  payment: {
    eyebrow: string;
    titleWhite: string;
    titleAccent: string;
    subtitle: string;
    cardFrontSrc: string;
    cardFrontAlt: string;
    cardBackSrc: string;
    cardBackAlt: string;
  };
  cryptoTicker: {
    coins: CryptoTickerEntry[];
  };
  transfer: {
    eyebrow: string;
    titleLine1: string;
    titleAccent: string;
    titleLine3: string;
    subtitle: string;
    mockupImage: string;
    mockupAlt: string;
  };
  crypto: {
    eyebrow: string;
    titleLine1: string;
    titleAccent: string;
    titleLine3: string;
    subtitle: string;
    mockupImage: string;
    mockupAlt: string;
  };
  featuresGrid: {
    eyebrow: string;
    titleWhite: string;
    titleAccent: string;
  };
  joinUs: {
    eyebrow: string;
    titleWhite: string;
    titleAccent: string;
    subtitle: string;
    ctaLabel: string;
    ctaUrl: string;
  };
  collaborations: {
    headingBefore: string;
    headingAccent: string;
  };
  footer: {
    logoSrc: string;
    tagline: string;
    links: { label: string; href: string }[];
    appStoreUrl: string;
    playStoreUrl: string;
    copyright: string;
  };
  bottomNav: {
    logoSrc: string;
    ctaLabel: string;
    ctaUrl: string;
  };
};

export const HOME_CONTENT_DEFAULTS: HomeContent = {
  navBar: {
    logoSrc: '/leoLogoooo.png',
    logoAlt: 'LEO',
    ctaLabel: 'GET LEO APP',
    ctaUrl: '#get',
  },
  hero: {
    titleHighlight: 'MONEY,',
    titleSuffix: 'MADE SIMPLE.',
    subtitle:
      'Send, spend, split, and save — in one quietly beautiful app. Free to start, honest at every turn, and built to last.',
    ctaLabel: 'GET LEO APP',
    ctaUrl: '#get',
    heroImage: '/heroImagee.png',
    heroImageAlt: 'Leo app preview',
  },
  control: {
    eyebrow: 'Smart banking, reimagined',
    titlePart1: 'OWN EVERY ',
    titleAccent1: 'MOVE',
    titlePart2: ' YOUR ',
    titleAccent2: 'MONEY',
    titlePart3: ' MAKES',
    cards: [
      {
        title: 'PAYMENTS',
        desc: 'Track every rupee in real time — send, receive, and review, all with a single tap.',
        image: '/activity.jpeg',
        alt: 'Transactions activity',
      },
      {
        title: 'WALLET',
        desc: 'Hold, swap, and grow digital assets securely. Your portfolio, always at your fingertips.',
        image: '/wallet.png',
        alt: 'Wallet',
      },
      {
        title: 'ALERTS',
        desc: 'Stay informed with smart notifications for every login, card, and account update.',
        image: '/notify.jpeg',
        alt: 'Notifications',
      },
    ],
  },
  payment: {
    eyebrow: 'Dual-currency, zero friction',
    titleWhite: 'TWO WORLDS.',
    titleAccent: 'ONE CARD.',
    subtitle:
      'Flip between fiat and crypto with a single tap — anywhere in the world, any time of day.',
    cardFrontSrc: '/leoFrontCard.png',
    cardFrontAlt: 'LEO Card Front',
    cardBackSrc: '/leoBackCard.png',
    cardBackAlt: 'LEO Card Back',
  },
  cryptoTicker: {
    coins: [
      { symbol: 'BTC',  price: '$64,215.30', change: '1.42%', up: true  },
      { symbol: 'ETH',  price: '$3,182.75',  change: '0.96%', up: true  },
      { symbol: 'USDT', price: '$1.00',      change: '0.01%', up: true  },
      { symbol: 'XRP',  price: '$0.5214',    change: '0.63%', up: false },
      { symbol: 'BNB',  price: '$578.40',    change: '2.11%', up: true  },
      { symbol: 'USDC', price: '$1.00',      change: '0.00%', up: true  },
      { symbol: 'SOL',  price: '$148.92',    change: '3.87%', up: true  },
      { symbol: 'TRX',  price: '$0.1243',    change: '0.21%', up: false },
      { symbol: 'DOGE', price: '$0.1587',    change: '4.22%', up: true  },
      { symbol: 'HYPE', price: '$32.18',     change: '1.08%', up: false },
      { symbol: 'LEO',  price: '$8.94',      change: '0.57%', up: true  },
      { symbol: 'BCH',  price: '$412.65',    change: '1.03%', up: true  },
      { symbol: 'ADA',  price: '$0.4571',    change: '0.84%', up: false },
      { symbol: 'XMR',  price: '$168.32',    change: '0.72%', up: true  },
      { symbol: 'LINK', price: '$14.58',     change: '0.33%', up: false },
      { symbol: 'XLM',  price: '$0.1102',    change: '1.48%', up: true  },
      { symbol: 'M',    price: '$2.34',      change: '2.17%', up: false },
      { symbol: 'CC',   price: '$0.89',      change: '5.63%', up: true  },
      { symbol: 'ZEC',  price: '$24.17',     change: '0.98%', up: false },
      { symbol: 'DAI',  price: '$1.00',      change: '0.02%', up: true  },
    ],
  },
  transfer: {
    eyebrow: 'One app, every network',
    titleLine1: 'SEND MONEY ACROSS',
    titleAccent: 'INSTANTLY,',
    titleLine3: 'IN ANY CURRENCY.',
    subtitle:
      'Send to a Visa or Mastercard, a SEPA bank account, or a crypto wallet — every transfer clears in seconds, not days. Transparent fees, real-time rates, and bank-grade encryption on every move.',
    mockupImage: '/paymentMobilee.png',
    mockupAlt: 'Transfer preview',
  },
  crypto: {
    eyebrow: 'Your crypto, simplified',
    titleLine1: 'BUY, HOLD, SWAP,',
    titleAccent: 'GROW',
    titleLine3: 'YOUR ENTIRE PORTFOLIO',
    subtitle:
      'Purchase, sell, spend, and hold digital assets with institutional-grade security — all from the convenience of your pocket. Track live prices, swap between fiat and crypto in a single tap, and put your idle balance to work with effortless staking. One unified wallet for every move you make, on-chain or off.',
    mockupImage: '/mobilePaymentt.png',
    mockupAlt: 'Crypto preview',
  },
  featuresGrid: {
    eyebrow: 'One app, every asset',
    titleWhite: 'ONE ',
    titleAccent: 'WALLET',
  },
  joinUs: {
    eyebrow: 'JOIN THE MOVEMENT',
    titleWhite: 'BUILT FOR ',
    titleAccent: "WHAT'S NEXT.",
    subtitle:
      'The wait for finance that actually keeps up is over. Send, spend, stake, swap — one app, zero friction, always-on. Built for how you live now, ready for whatever comes next.',
    ctaLabel: 'GET LEO APP',
    ctaUrl: 'https://apps.apple.com/app/sicash',
  },
  collaborations: {
    headingBefore: 'OUR ',
    headingAccent: 'COLLABORATIONS',
  },
  footer: {
    logoSrc: '/leoLogoooo.png',
    tagline: 'THE MONEY APP',
    links: [
      { label: 'About LEO',             href: '/about' },
      { label: 'Privacy Policy',        href: '/privacy-policy' },
      { label: 'Card Terms',            href: '/card-terms' },
      { label: 'Prohibited Activities', href: '/prohibited-activities' },
    ],
    appStoreUrl: '#app-store',
    playStoreUrl: '#google-play',
    copyright: '© 2026 LEO. All rights reserved.',
  },
  bottomNav: {
    logoSrc: '/leoLogoooo.png',
    ctaLabel: 'GET LEO APP',
    ctaUrl: '#get',
  },
};

/**
 * Deep-merge CMS overrides onto the defaults.
 *
 * - Objects merge key-by-key.
 * - Arrays merge BY INDEX against the default array (so partial edits keep the
 *   other items' defaults) and never grow/shrink past the default length — the
 *   layout is fixed by design.
 * - `undefined`/`null` overrides fall back to the default (this is what lets
 *   newly-added schema fields pick up their default even on old saved data).
 *   An explicit empty string is respected as an intentional clear.
 */
function mergeValue<T>(def: T, raw: unknown): T {
  if (raw === undefined || raw === null) return def;
  if (Array.isArray(def)) {
    const rawArr = Array.isArray(raw) ? raw : [];
    return def.map((d, i) => mergeValue(d, rawArr[i])) as unknown as T;
  }
  if (def && typeof def === 'object') {
    if (typeof raw !== 'object' || Array.isArray(raw)) return def;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(def as Record<string, unknown>)) {
      out[k] = mergeValue((def as Record<string, unknown>)[k], (raw as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  return raw as T;
}

export function resolveHomeContent(raw: unknown): HomeContent {
  return mergeValue(HOME_CONTENT_DEFAULTS, raw);
}

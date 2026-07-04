/**
 * About page content model.
 *
 * The About layout stays in code; the CMS `sections` only override this text.
 * Keep the shape mirrored in leo-cms/src/lib/aboutContent.ts so the editor's
 * form schema lines up with what the website actually reads.
 */
export type AboutContent = {
  hero: { headingWhite: string; headingAccent: string; intro: string };
  mission: { heading: string; body: string };
  vision: { heading: string; body: string };
  collaborations: { headingBefore: string; headingHighlight: string; partners: string[] };
};

export const ABOUT_CONTENT_DEFAULTS: AboutContent = {
  hero: {
    headingWhite: 'ABOUT',
    headingAccent: 'LEO',
    intro:
      "LEO is the money app where fiat and crypto live side by side. Send, spend, split, and save — all from one quietly beautiful app. Free to start, honest at every turn, and built to last. We hold the highest standards of regulatory compliance and use bank-grade security to protect your funds.",
  },
  mission: {
    heading: 'MISSION',
    body:
      "Our mission is to make money feel weightless. With the LEO card, your USDT, USDC, ETH, and balance convert to fiat the moment you check out — tap at any store, swipe at a terminal, or pay online. No exchanges, no waiting, no friction between your crypto and the real world.",
  },
  vision: {
    heading: 'VISION',
    body:
      "A world where holding crypto doesn't mean choosing between saving and spending. We're building the bridge that lets your digital assets work like cash — accepted anywhere a card is, settled instantly, and always under your control.",
  },
  collaborations: {
    headingBefore: 'OUR ',
    headingHighlight: 'COLLABORATIONS',
    partners: ['BitGo', 'FENIGE', 'INTERCOM', 'PLAID', 'QUICKO', 'onfido', 'Verestro', 'YAPILY', 'BINARYX'],
  },
};

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

export function resolveAboutContent(raw: unknown): AboutContent {
  return mergeValue(ABOUT_CONTENT_DEFAULTS, raw);
}

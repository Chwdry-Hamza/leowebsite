/**
 * Support ("Get in touch") page content model.
 *
 * Card layout + icons stay in the page component; this defines the text /
 * email / phone / hours the CMS can edit. Mirrors the shape of
 * spay-cms/leo-cms/src/lib/supportContent.ts. KEEP SHAPES IN SYNC.
 */
export type SupportContent = {
  header: {
    eyebrow: string;
    /** Plain word in the H1 (rendered white) */
    white: string;
    /** Accent word in the H1 (rendered in brand color) */
    accent: string;
    intro: string;
  };
  channels: {
    cards: { label: string; value: string; desc: string }[];
  };
  general: {
    eyebrow: string;
    white: string;
    accent: string;
    body: string;
    email: string;
  };
};

export const SUPPORT_CONTENT_DEFAULTS: SupportContent = {
  header: {
    eyebrow: "We're here to help",
    white: 'GET IN ',
    accent: 'TOUCH',
    intro:
      "Have a question about your LEO account, a transaction, or anything else? Our team is ready to assist. Reach out through any of the channels below and we'll get back to you within one business day.",
  },
  channels: {
    cards: [
      {
        label: 'Email Support',
        value: 'support@leo.financial',
        desc: 'For account, card, and transaction issues. Replies within 24 hours on business days.',
      },
      {
        label: 'Phone Support',
        value: '+971 55 947 6972',
        desc: 'Speak to a live agent for urgent card or fraud issues. Available during support hours.',
      },
      {
        label: 'Support Hours',
        value: 'Mon – Fri',
        desc: '9:00 AM – 6:00 PM GST\nClosed on UAE public holidays',
      },
    ],
  },
  general: {
    eyebrow: 'Drop us a line',
    white: 'General ',
    accent: 'inquiries',
    body:
      "Press, partnerships, careers, or feedback — we read every message. For account-specific questions, please use the channels above so we can verify your identity faster.",
    email: 'press@leo.financial',
  },
};

/** Deep-merge CMS section overrides over the defaults. */
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

export function resolveSupportContent(raw: unknown): SupportContent {
  return mergeValue(SUPPORT_CONTENT_DEFAULTS, raw);
}

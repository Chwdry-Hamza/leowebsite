/**
 * Generic legal-page content model.
 *
 * The CMS stores overrides under the Page's `sections` field; this is the
 * canonical default shape every legal page consumes. Each legal page (e-sign,
 * prohibited, privacy, card-terms) exports its own DEFAULTS, but they all
 * share this `LegalContent` shape so one editor schema in the CMS can drive
 * all of them.
 *
 * `body.sections[]` is rendered in order. Section semantics:
 *   - heading: '' + body: '<paragraph>'          → standalone paragraph
 *   - heading: '<title>' + body: '<paragraph>'   → titled paragraph
 *   - heading: '<title>' + items: ['…','…']      → titled bullet list
 */
export type LegalSection = {
  heading: string;
  body?: string;
  items?: string[];
};

export type LegalContent = {
  header: {
    /** Plain word in the page H1 (rendered white) */
    white: string;
    /** Accent word in the page H1 (rendered in brand color) */
    accent: string;
    /** "Effective Date: …" sub-line below the H1 */
    effectiveDate: string;
  };
  body: {
    sections: LegalSection[];
  };
};

const DATE_LINE = 'Effective Date: May 15, 2026 · Last Updated: May 15, 2026';

/**
 * Default content for the new /e-sign-consent page. Kept brief and accurate —
 * admins can rewrite it from the CMS once that page is published.
 */
export const ESIGN_DEFAULTS: LegalContent = {
  header: {
    white: 'E-SIGN',
    accent: 'CONSENT',
    effectiveDate: DATE_LINE,
  },
  body: {
    sections: [
      {
        heading: '',
        body:
          'This E-Sign & Electronic Communications Notice ("Notice") describes how LEO and its partners deliver agreements, disclosures, and other communications to you electronically. By accepting this Notice — or by using a LEO product after we provide it to you — you consent to receive these communications in electronic form rather than on paper.',
      },
      {
        heading: '1. Scope of your consent',
        body:
          'Your consent applies to every agreement, statement, disclosure, regulatory notice, tax form, account update, and other communication between you and LEO (or any partner involved in providing your LEO product). It applies for as long as you maintain an account with us, and to any subsequent product you open with us.',
      },
      {
        heading: '2. How we deliver communications',
        items: [
          'In your LEO app or web account (inbox, settings, or document center).',
          'By email to the address you provide.',
          'By SMS or push notification to the phone number or device you register.',
          'Through a secure link directed to a page you can read or download.',
        ],
      },
      {
        heading: '3. Hardware and software you need',
        body:
          'To receive electronic communications you need: a device with internet access; a current version of a major web browser (Chrome, Safari, Firefox, Edge); the LEO app on a supported iOS or Android device; an email account capable of receiving HTML messages; software that can open PDF files; and enough storage to retain the documents we send. Most modern phones and laptops meet these requirements out of the box.',
      },
      {
        heading: '4. Updating your contact information',
        body:
          'You must keep your email address and phone number current. Update them from the Settings screen of the LEO app or by writing to support@leo.financial. We are not responsible for communications that fail to reach you because your contact information is out of date.',
      },
      {
        heading: '5. Requesting paper copies',
        body:
          'You may request a paper copy of any electronic record we have sent you by emailing support@leo.financial. We may charge a reasonable copying or mailing fee in line with applicable law.',
      },
      {
        heading: '6. Withdrawing consent',
        body:
          'You may withdraw your consent to receive future electronic communications at any time by writing to support@leo.financial with the subject line "Withdraw E-Sign Consent". Withdrawal of consent does not affect the legal effectiveness or enforceability of records or communications provided electronically before withdrawal. Depending on the product, withdrawing consent may require us to close your account, since paper delivery may not be operationally available.',
      },
      {
        heading: '7. Retention',
        body:
          'You should download and retain electronic records that are important to you. We may, but are not obligated to, retain copies of electronic communications indefinitely. Some records will be retained for the period required by applicable law and made available through your account.',
      },
      {
        heading: '8. Federal law',
        body:
          'Under the federal Electronic Signatures in Global and National Commerce Act (E-SIGN), agreements, disclosures, and other communications delivered electronically with your consent are legally equivalent to paper. Nothing in this Notice limits your rights under that Act or under state electronic-records laws of equivalent effect.',
      },
      {
        heading: 'Questions',
        body:
          'If you have questions about this Notice, contact us at support@leo.financial.',
      },
    ],
  },
};

/** Deep-merge CMS section overrides over a canonical defaults object. */
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

export function resolveEsignContent(raw: unknown): LegalContent {
  return mergeValue(ESIGN_DEFAULTS, raw);
}

/**
 * Generic resolver — pass the page-specific defaults and the CMS-saved
 * `sections` blob. Used by `LegalSections` so all 4 legal pages share the
 * same client wrapper.
 */
export function resolveLegalContent(defaults: LegalContent, raw: unknown): LegalContent {
  return mergeValue(defaults, raw);
}

// ─── Per-page defaults (compact — admins extend via CMS once live) ───

export const PROHIBITED_DEFAULTS: LegalContent = {
  header: { white: 'PROHIBITED', accent: 'ACTIVITIES', effectiveDate: DATE_LINE },
  body: {
    sections: [
      { heading: '', body:
        'By using your LEO Card, you agree not to engage in any of the activities listed below. This list is incorporated by reference into the [LEO Card Terms](/card-terms). Violation of this policy may result in suspension or termination of your Card privileges, and may expose you to civil or criminal liability under applicable law.' },
      { heading: '1. Illegal and Regulated Activities', items: [
        'Illegal drugs or controlled substances, including narcotics, synthetic drugs, and drug paraphernalia',
        'Cannabis and marijuana-related products, including dispensaries and cultivation suppliers, regardless of local legality',
        'Firearms, ammunition, and weapons, including gun parts, accessories, explosives, and related items',
        'Human trafficking, forced labor, or any activity that exploits individuals',
        'Counterfeit goods, including forged currency, fake identification documents, or pirated intellectual property',
      ] },
      { heading: '2. Financial Crimes and Fraud', items: [
        'Money laundering or transactions intended to conceal proceeds of illegal activity',
        'Terrorism financing or transactions involving sanctioned individuals or entities',
        'Fraudulent or deceptive practices, including phishing, identity theft, and account takeover schemes',
        'Pyramid schemes, Ponzi schemes, or multi-level marketing structures',
      ] },
      { heading: '3. Regulated Industries', items: [
        'Gambling, including online casinos, sports betting, and lottery tickets',
        'Adult entertainment, including pornography and escort services',
        'Tobacco products, including cigarettes, e-cigarettes, vaping products',
        'Unregistered money services',
      ] },
      { heading: 'Notice', body:
        'This list is not exhaustive. LEO reserves the right to deny, block, or reverse any transaction for any reason, including suspected fraud, non-compliance with applicable law, or indication of increased risk. Questions? Contact us at support@leo.financial.' },
    ],
  },
};

export const PRIVACY_DEFAULTS: LegalContent = {
  header: { white: 'PRIVACY', accent: 'POLICY', effectiveDate: DATE_LINE },
  body: {
    sections: [
      { heading: 'The short version', body:
        "We collect what we need to run LEO, keep it safe, and tell you the truth about what we do with it. We don't sell your data. We don't use your transactions to power ads. Where the law gives you rights — to see, correct, export, or delete your data — we honor them." },
      { heading: 'What we collect', items: [
        'Account data — your name, contact details, government ID, date of birth, and the verification documents required to comply with financial regulations.',
        'Transaction data — what you send, receive, spend, hold, stake, or convert through the LEO app and card.',
        'Device and usage data — the device, browser, IP address, and app interactions that help us keep your account secure and our service reliable.',
        'Support data — anything you share with us when you contact our team.',
      ] },
      { heading: 'Why we collect it', body:
        'To provide the service you signed up for. To verify your identity and prevent financial crime. To process payments, transfers, and conversions across our partner network. To detect fraud, secure your account, and recover from incidents. To meet our regulatory and legal obligations. To improve LEO over time.\n\nWe do not use your transaction or balance data to target advertising. Period.' },
      { heading: 'Your rights', body:
        'You have the right to access your data, correct it, export it in a portable format, and request deletion (subject to retention obligations under financial law). Email **support@leo.financial** to exercise any of these rights — we respond within the timeframes required by applicable law.' },
      { heading: 'Contact', body:
        'Questions about this Policy? Email support@leo.financial.' },
    ],
  },
};

export const CARD_TERMS_DEFAULTS: LegalContent = {
  header: { white: 'CARD', accent: 'TERMS', effectiveDate: DATE_LINE },
  body: {
    sections: [
      { heading: '', body:
        'These Card Terms govern your use of the LEO Card and supplement the LEO User Agreement. By activating or using your Card you agree to these Terms.' },
      { heading: '1. The Card', body:
        'The LEO Card is a prepaid payment card linked to your LEO account. It can be used wherever the card network is accepted. The Card is not a credit card — funds must be available in your linked balance for the transaction to authorize.' },
      { heading: '2. Fees', body:
        'There are no monthly fees, no inactivity fees, and no foreign-transaction fees. Network exchange rates apply on cross-currency transactions. The current fee schedule is always visible in your LEO app.' },
      { heading: '3. Prohibited use', body:
        'You agree not to use the Card for any of the activities listed in our [Prohibited Activities](/prohibited-activities) policy.' },
      { heading: '4. Lost or stolen card', body:
        'Freeze your Card instantly from the LEO app. If you suspect unauthorized use, report it within the LEO app or by email to support@leo.financial.' },
      { heading: '5. Dispute resolution', body:
        'For Card-related disputes you may have with us, please contact support@leo.financial to attempt resolution informally first. Any Dispute we cannot resolve will be handled per the binding arbitration provisions in the LEO User Agreement.' },
      { heading: '6. Changes', body:
        'We may amend these Terms from time to time. We will notify you in-app and by email when material changes take effect. Continued use of the Card after a change constitutes acceptance of the amended Terms.' },
    ],
  },
};

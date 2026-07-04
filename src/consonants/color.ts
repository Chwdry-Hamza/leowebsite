export const colors = {
  cyan50: '#E6FAFF',
  cyan100: '#C5F1FF',
  cyan200: '#9BE6FF',
  cyan300: '#6FE3FF',
  cyan400: '#4ECBFF',
  cyan500: '#1FA6E0',
  cyan600: '#1585B8',
  cyan700: '#0E5F84',

  navy950: '#04070F',
  navy900: '#070C1A',
  navy850: '#0A1222',
  navy800: '#0E1830',
  navy700: '#152242',
  navy600: '#1E3058',
  navy500: '#2B4375',
  navy400: '#415E9A',
  navy300: '#6A84B5',
  navy200: '#9FB3D4',
  navy100: '#D4DDEF',

  fg1: '#EAF4FF',
  fg2: '#B8C8E2',
  fg3: '#7A8AAB',
  fg4: '#4A5875',

  info: '#4ECBFF',
  success: '#3AE6B0',
  warning: '#FFCE5C',
  danger: '#FF5E87',
  magenta: '#C66BFF',

  '2b71b4': '#2b71b4',
  '4e99d8': '#4e99d8',
  'e0fbfc': '#e0fbfc',
  '70cbef': '#70cbef',
  '95f3fb': '#95f3fb',
  '5397b6': '#5397b6',
  'bcf6fc': '#bcf6fc',
  '5da7d6': '#5da7d6',
  '86e1f8': '#86e1f8',
} as const;

export type ColorName = keyof typeof colors;

export const fonts = {
  display: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  sans: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const shadows = {
  s1: '0 1px 2px rgba(0,0,0,0.5), 0 0 0 1px rgba(111,227,255,0.14)',
  s2: '0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(111,227,255,0.14)',
  s3: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(111,227,255,0.28)',
  glowSm: '0 0 8px rgba(78,203,255,0.35)',
  glowMd: '0 0 16px rgba(78,203,255,0.45), 0 0 2px rgba(111,227,255,0.6)',
  glowLg: '0 0 32px rgba(78,203,255,0.55), 0 0 4px rgba(111,227,255,0.8)',
} as const;

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 24,
  s6: 32,
  s7: 48,
  s8: 64,
  s9: 96,
} as const;

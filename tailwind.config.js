/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          50:  '#E6FAFF',
          100: '#C5F1FF',
          200: '#9BE6FF',
          300: '#6FE3FF',
          400: '#4ECBFF',
          500: '#1FA6E0',
          600: '#1585B8',
          700: '#0E5F84',
        },
        navy: {
          500: '#2B4375',
          600: '#1E3058',
          700: '#152242',
          800: '#0E1830',
          850: '#0A1222',
          900: '#070C1A',
          950: '#04070F',
        },
        fg: {
          1: '#EAF4FF',
          2: '#B8C8E2',
          3: '#7A8AAB',
          4: '#4A5875',
        },
        info:    '#4ECBFF',
        success: '#3AE6B0',
        warning: '#FFCE5C',
        danger:  '#FF5E87',
        magenta: '#C66BFF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'leo-xs':   '4px',
        'leo-sm':   '6px',
        'leo-md':   '10px',
        'leo-lg':   '16px',
        'leo-xl':   '24px',
        'leo-pill': '999px',
      },
      boxShadow: {
        'leo-1':     '0 1px 2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(111, 227, 255, 0.14)',
        'leo-2':     '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(111, 227, 255, 0.14)',
        'leo-3':     '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(111, 227, 255, 0.28)',
        'glow-sm':   '0 0 8px rgba(78, 203, 255, 0.35)',
        'glow-md':   '0 0 16px rgba(78, 203, 255, 0.45), 0 0 2px rgba(111, 227, 255, 0.6)',
        'glow-lg':   '0 0 32px rgba(78, 203, 255, 0.55), 0 0 4px rgba(111, 227, 255, 0.8)',
      },
      transitionTimingFunction: {
        'leo-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'leo-hero-glow': {
          '0%':   { opacity: '0.85', transform: 'scale(1)' },
          '100%': { opacity: '1',    transform: 'scale(1.05)' },
        },
        'leo-marquee': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'leo-hero-glow': 'leo-hero-glow 6s ease-in-out infinite alternate',
        'leo-marquee':   'leo-marquee 30s linear infinite',
      },
      screens: {
        desktop: '901px',
      },
    },
  },
  plugins: [],
};

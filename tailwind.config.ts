import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#E794EF',
          100: '#E27FEB',
          200: '#DD69E8',
          300: '#D954E5',
          400: '#D43EE1',
          500: '#CF29DE',
          600: '#BA25C8',
          700: '#A621B2',
          800: '#911D9B',
          900: '#7C1985',
          950: '#681470', // Added darker shade
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

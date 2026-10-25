import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF6EE',
        ink: '#1E2A25',
        brand: {
          50: '#EEF6F3',
          100: '#D6EAE3',
          200: '#AED4C7',
          300: '#7FB8A6',
          400: '#4F9783',
          500: '#2F7B67',
          600: '#1F5D50',
          700: '#194B41',
          800: '#143B34',
          900: '#0E2A25',
        },
        gold: { 400: '#D2A653', 500: '#B8893B', 600: '#9A7030' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        naskh: ['"Noto Naskh Arabic"', 'Amiri', '"Segoe UI"', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;

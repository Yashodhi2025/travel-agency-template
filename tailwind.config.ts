import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@deneb-ui/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-color, #FF783D)',
          secondary: 'var(--brand-secondary, #202B33)',
          accent: 'var(--brand-accent, #FF783D)',
          midnight: '#101820',
          charcoal: '#202B33',
          sunset: '#FF783D',
          mist: '#A3B0BA',
          softwhite: '#F5F5F5',
        },
      },
      fontFamily: {
        display: ['var(--heading-font)', 'Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        editorial: ['var(--heading-font)', 'Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--body-font)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

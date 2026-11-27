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
          primary: 'var(--brand-color, #101820)',
          secondary: 'var(--brand-secondary, #154C42)',
          accent: 'var(--brand-accent, #FF783D)',
          midnight: '#101820',
          charcoal: '#1B252E',
          tropical: '#154C42',
          sunset: '#FF783D',
          ivory: '#FAF8F3',
          gold: '#C5A46D',
          ocean: '#167D91',
          mist: '#9AA7B2',
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

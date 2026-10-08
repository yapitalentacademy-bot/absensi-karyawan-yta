import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F9',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
          950: '#0B1D3A',
        },
        gold: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
        },
        limeaccent: {
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
        }
      },
    },
  },
  plugins: [],
};
export default config;

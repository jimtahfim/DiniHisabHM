/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // emerald-500
          600: '#059669', // emerald-600
          700: '#047857', // emerald-700
          800: '#065f46', // emerald-800
          900: '#064e3b', // deep green
          950: '#022c22', // extra deep green
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // gold highlight
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        darkBg: {
          light: '#1f2937',
          dark: '#111827',
          darkest: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Bengali"', '"Hind Siliguri"', 'sans-serif'],
        bengali: ['"Noto Sans Bengali"', 'sans-serif'],
        siliguri: ['"Hind Siliguri"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B1E',
          900: '#0B132B',
          850: '#111B3B',
          800: '#1C2A4E',
          700: '#2A3C66',
          600: '#3D5285',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        gold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      fontFamily: {
        heading: ['Impact', '"Helvetica Neue"', '"Arial Narrow"', 'sans-serif'],
        impact: ['Impact', '"Helvetica Neue"', '"Arial Narrow"', 'sans-serif'],
        sans: ['"Google Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

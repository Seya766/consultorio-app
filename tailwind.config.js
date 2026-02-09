/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F9F8F4',
        'cream-dark': '#F2F2F0',
        'cream-border': '#E5E5E0',
        'border-soft': '#D1D1CB',
        'uni-blue': '#003366',
        'uni-blue-dark': '#002244',
        dark: '#1C1C1E',
        'dark-light': '#27272A',
        'dark-border': '#3F3F46',
        muted: '#6e6e73',
        'muted-dark': '#52525B',
        'muted-light': '#A1A1AA',
        'muted-lighter': '#71717A',
      },
    },
  },
  plugins: [],
};

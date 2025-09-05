/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use class strategy so toggling `document.documentElement.classList` to 'dark'
  // enables Tailwind's `dark:` utilities.
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },

  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        nord: {
          primary: '#5E81AC',
          'primary-content': '#ECEFF4',
          secondary: '#81A1C1',
          accent: '#88C0D0',
          neutral: '#3B4252',
          'base-100': '#ECEFF4',
          'base-200': '#E5E9F0',
          'base-300': '#D8E6F0',
          info: '#8FBCBB',
          success: '#A3BE8C',
          warning: '#EBCB8B',
          error: '#BF616A',
        },
      },
      'cupcake',
    ],
  },
};

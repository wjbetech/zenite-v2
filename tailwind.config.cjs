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
};

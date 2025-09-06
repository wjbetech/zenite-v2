/* eslint-disable */
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
  // Enable DaisyUI plugin so its theme tokens (primary, secondary, accent, etc.)
  // are registered and available as Tailwind utility classes like `bg-secondary`.
  plugins: [require('daisyui')],

  // DaisyUI-specific config — enable a small set of default themes and pick a
  // sensible dark theme. You can add/remove themes here or let users pick
  // themes at runtime via the `data-theme` attribute (we already persist that).
  daisyui: {
    // enable all built-in themes so any theme name used at runtime is available
    // (this will include 'nord', 'dim', and many others)
    themes: true,
  },
};

/** @type {import('tailwindcss').Config} */

module.exports = {
  // Disable Tailwind dark class handling; DaisyUI themes drive appearance
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  // Using Tailwind v4 CSS plugin registration via `@plugin 'daisyui';` in globals.css
};

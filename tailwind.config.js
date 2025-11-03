/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_layouts/**/*.html',
    './_posts/**/*.md',
    './*.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
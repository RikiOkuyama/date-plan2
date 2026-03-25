/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#fff1f0',
          100: '#ffe0dc',
          200: '#ffc5be',
          300: '#ff9d93',
          400: '#ff6b5e',
          500: '#ff4433',
          600: '#ed2510',
          700: '#c81a0b',
          800: '#a51a10',
          900: '#881c14',
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

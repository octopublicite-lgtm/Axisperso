/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#F7F7F9',
        surface: '#FFFFFF',
        border: '#EEEEEE',
        primary: '#1A1A2E',
        secondary: '#666666',
        muted: '#AAAAAA',
        accent: '#FF6B35',
      },
    },
  },
  plugins: [],
}

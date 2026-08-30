/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#162922',
        mint: '#e4ffef',
        leaf: '#147a55',
        lime: '#b9f46e',
        coral: '#ff806d',
        butter: '#ffde69',
        sky: '#91d7ff',
        lilac: '#c6b6ff',
      },
      boxShadow: {
        soft: '0 12px 36px rgba(22, 41, 34, 0.08)',
        lift: '0 18px 46px rgba(22, 41, 34, 0.13)',
      },
    },
  },
  plugins: [],
}

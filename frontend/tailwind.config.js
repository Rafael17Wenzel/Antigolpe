/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bradesco: {
          red: '#CC0000',
          darkRed: '#990000',
          lightRed: '#FFECEC',
          grayBg: '#F4F5F7',
          darkText: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

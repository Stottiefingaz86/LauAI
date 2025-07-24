/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        mint: '#5BF5CE',
        'mint-dark': '#4BE5BE',
        'glass': 'rgba(255, 255, 255, 0.2)',
        'glass-dark': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
} 
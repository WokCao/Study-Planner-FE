/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '50%': { opacity: '0.3', transform: 'translateX(-25px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-out': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '50%': { opacity: '0.3', transform: 'translateX(-25px)' },
          '100%': { opacity: '0', display: 'none', transform: 'translateX(-50px)' }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'slide-out': 'slide-out 0.3s ease-out forwards'
      }
    },
    screens: {
      'mobile': '300px',
      'tablet': '640px',
      'laptopSm': '950px',
      'laptop': '1200px',
      'desktop': '1680px',
    }
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#e5a23c',
          light: '#f2c879',
          amber: '#e7a33d',
          dark: '#b87920',
        },
        dark: {
          950: '#050505',
          900: '#080808',
          850: '#0b0e14',
          800: '#0d0d0d',
          750: '#101010',
          700: '#181818',
          600: '#222222',
          500: '#2a2a2a',
          line: '#252b3a',
        },
        textMuted: '#8b93a7',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}

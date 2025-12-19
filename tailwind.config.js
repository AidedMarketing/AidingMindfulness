/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4ECDC4',
          dark: '#3BA39C',
        },
        emotions: {
          anxious: '#FF6B6B',
          stressed: '#FFA500',
          sad: '#6B8EFF',
          restless: '#FFD700',
          tired: '#9B9B9B',
          calm: '#4ECDC4',
        },
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe-in': 'expand 4s ease-in-out',
        'breathe-out': 'contract 4s ease-in-out',
      },
      keyframes: {
        expand: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(2.4)' },
        },
        contract: {
          '0%': { transform: 'scale(2.4)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

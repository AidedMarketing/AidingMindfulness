/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode - Warm & Earthy
        cream: '#FFF8E7',
        'dark-brown': '#3A3532',
        ember: '#E17055',
        sage: '#81C784',
        'muted-text': '#8B8680',

        // Dark mode - Warm Charcoal
        charcoal: '#252220',
        'warm-white': '#F5F1E8',
        'soft-ember': '#FF8A65',
        'muted-sage': '#6B9B73',
        'muted-dark': '#9E958E',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'burn-curl': 'curl 3.5s ease-out forwards',
        'burn-ignite': 'ignite 2.5s ease-out forwards',
        'burn-ash': 'ash 2s ease-out forwards',
        'fade-out': 'fade-out 1s ease-out forwards',
        'bloom': 'bloom 0.5s ease-out forwards',
        'pulse-gentle': 'pulse-gentle 1.5s ease-in-out infinite',
      },
      keyframes: {
        curl: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '100%': { transform: 'rotate(2deg) scale(0.98)', filter: 'sepia(0.3)' },
        },
        ignite: {
          '0%': { opacity: '0', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.4) saturate(1.5)' },
          '100%': { opacity: '0.8', filter: 'brightness(1.2) saturate(1.3)' },
        },
        ash: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(0.5)' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        bloom: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '60%': { transform: 'scale(1.1) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

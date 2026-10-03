/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F2EEFF',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#FAF9FF',
          elevated: '#FFFFFF',
        },
        brand: {
          deep: '#4B1FA8',
          primary: '#6736C7',
          soft: '#9A78E8',
          lavender: '#D9CCFF',
          glow: 'rgba(103, 54, 199, 0.15)',
        },
        financial: {
          up: '#10B981',
          upBg: 'rgba(16, 185, 129, 0.1)',
          down: '#EF4444',
          downBg: 'rgba(239, 68, 68, 0.1)',
          neutral: '#6B7280',
          bullish: '#10B981',
          bearish: '#EF4444',
          warning: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(103, 54, 199, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 12px 32px -4px rgba(103, 54, 199, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 25px rgba(103, 54, 199, 0.25)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.75 },
        }
      }
    },
  },
  plugins: [],
}

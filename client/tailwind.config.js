/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#FAF9F6',
          elev: '#FFFFFF',
          sunken: '#F3F1EB',
        },
        ink: {
          DEFAULT: '#1F1D1A',
          soft: '#3B3833',
        },
        muted: {
          DEFAULT: '#6E6A62',
          2: '#9A958A',
        },
        faint: '#BFB9AE',
        line: {
          DEFAULT: '#E8E4DC',
          2: '#D9D3C5',
        },
        live: {
          DEFAULT: '#C8372D',
          soft: '#FBE9E5',
          line: '#F2B8AE',
        },
        win: {
          DEFAULT: '#2F7D4E',
          soft: '#E4EEE7',
        },
        loss: '#B14A3F',
        amber: {
          DEFAULT: '#B07B1F',
          soft: '#F6EDD6',
        },
        olive: '#8A8A5C',
        sand: '#C9B98E',
      },
      borderColor: {
        DEFAULT: '#E8E4DC',
      },
      animation: {
        'pulse-live': 'livepulse 1.8s ease-in-out infinite',
        'fade-in': 'fadein 0.25s ease-out',
        'slide-in': 'slidein 0.2s ease-out',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'ticker': 'tickermove 36s linear infinite',
        'flash': 'flash 0.7s ease-out',
      },
      keyframes: {
        livepulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(200,55,45,0.4)' },
          '50%': { opacity: '0.75', boxShadow: '0 0 0 4px rgba(200,55,45,0)' },
        },
        fadein: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        slidein: {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.96)' },
          to: { opacity: '1', transform: 'none' },
        },
        tickermove: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        flash: {
          '0%': { backgroundColor: '#F6EDD6' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(31,29,26,0.06), 0 1px 1px rgba(31,29,26,0.04)',
        'card-hover': '0 4px 12px rgba(31,29,26,0.1), 0 1px 3px rgba(31,29,26,0.06)',
        'card-live': '0 0 0 1px #F2B8AE, inset 0 0 16px #FBE9E5',
        'toast': '0 8px 30px rgba(31,29,26,0.12), 0 2px 8px rgba(31,29,26,0.08)',
      },
    },
  },
  plugins: [],
}

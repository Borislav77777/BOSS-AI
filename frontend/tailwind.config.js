/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основные цвета - используются CSS переменные
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        // Системные цвета
        warning: '#e74c3c',
        success: '#10b981',
        error: '#ef4444',
        info: 'var(--accent, var(--primary))'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-subtle': 'bounceSubtle 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'rotate-in': 'rotateIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 6s linear infinite',
        // Анимации загрузочного экрана
        'orbit': 'orbit 8s linear infinite',
        'brand-glow': 'brandGlow 3s ease-in-out infinite',
        'brand-pulse': 'brandPulse 2s ease-in-out infinite',
        'brand-shimmer': 'brandShimmer 3s linear infinite',
        'brand-float': 'brandFloat 8s ease-in-out infinite',
        'brand-rotate': 'brandRotate 10s linear infinite',
      },
      animationDelay: {
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s',
        '400': '0.4s',
        '500': '0.5s',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(160, 160, 160, 0.5)' },
          'to': { boxShadow: '0 0 30px rgba(160, 160, 160, 0.8), 0 0 40px rgba(160, 160, 160, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.8)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        rotateIn: {
          'from': { opacity: '0', transform: 'rotate(-180deg) scale(0.5)' },
          'to': { opacity: '1', transform: 'rotate(0deg) scale(1)' },
        },
        // Новые keyframes для загрузочного экрана
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        brandGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(136, 213, 94, 0.3), 0 0 40px rgba(155, 89, 182, 0.2), 0 0 60px rgba(243, 153, 18, 0.1)'
          },
          '50%': {
            boxShadow: '0 0 30px rgba(136, 213, 94, 0.5), 0 0 60px rgba(155, 89, 182, 0.3), 0 0 90px rgba(243, 153, 18, 0.2)'
          },
        },
        brandPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        brandShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        brandFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)' },
          '66%': { transform: 'translateY(-10px) rotate(240deg)' },
        },
        brandRotate: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

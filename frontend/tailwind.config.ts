import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Lora', 'serif'],
        body: ['Courier Prime', 'monospace'],
        'faction-analog': ['Special Elite', 'serif'],
        'faction-singularity': ['Share Tech Mono', 'monospace'],
        accent: ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        paper: 'var(--color-bg-page)',
        ink: 'var(--color-text-primary)',
        muted: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        surface: 'var(--color-bg-surface)',
        'surface-alt': 'var(--color-bg-surface-alt)',
        accent: 'var(--color-accent-primary)',
        // Faction palette (light mode values — dark mode handled via CSS vars in Phase 2)
        ua: { DEFAULT: '#6b6a7a', accent: '#a78bfa' },
        analog: { DEFAULT: '#15803d', accent: '#15803d' },
        gestalt: { DEFAULT: '#14532d', accent: '#4ade80' },
        snide: { DEFAULT: '#8a6a20', accent: '#c49a3a' },
        journeymen: { DEFAULT: '#c49a3a', accent: '#c49a3a' },
        singularity: { DEFAULT: '#7c3aed', accent: '#4ade80' },
        'ua-masters': { DEFAULT: '#555555', accent: '#c49a3a' },
      },
      fontSize: {
        'wz-xs': '8px',
        'wz-sm': '9px',
        'wz-base': '10px',
        'wz-md': '11px',
        'wz-lg': '12px',
        'wz-xl': '14px',
        'wz-2xl': '18px',
        'wz-3xl': '28px',
        'wz-4xl': '34px',
      },
    },
  },
  plugins: [],
} satisfies Config

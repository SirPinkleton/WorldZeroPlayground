import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Caveat', 'cursive'],
        body: ['Kalam', 'cursive'],
      },
      colors: {
        paper: '#faf9f6',
        ink: '#1c1917',
        muted: '#78716c',
        border: '#3d3734',
        card: '#fffef9',
        // Faction palette
        ua: { DEFAULT: '#6d28d9', accent: '#fbbf24' },
        journeymen: { DEFAULT: '#1d4ed8', accent: '#d97706' },
        gestalt: { DEFAULT: '#7c3aed', accent: '#c4b5fd' },
        geo: { DEFAULT: '#92400e', accent: '#d97706' },
        snide: { DEFAULT: '#166534', accent: '#4ade80' },
        cm: { DEFAULT: '#b45309', accent: '#fde68a' },
      },
      boxShadow: {
        sketch: '3px 3px 0 #3d3734',
        'sketch-sm': '2px 2px 0 #3d3734',
        'sketch-lg': '5px 5px 0 #3d3734',
      },
      backgroundImage: {
        'graph-paper': `
          linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
          linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'graph-paper': '80px 80px, 80px 80px, 16px 16px, 16px 16px',
      },
    },
  },
  plugins: [],
} satisfies Config

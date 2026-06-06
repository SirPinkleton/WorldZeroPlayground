import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ["Lora", "serif"],
        body: ["Courier Prime", "monospace"],
        accent: ["Bebas Neue", "sans-serif"],
        // Per-faction headline fonts
        "faction-ua": ["IM Fell English", "serif"],
        "faction-analog": ["Special Elite", "serif"],
        "faction-gestalt": ["Caveat", "cursive"],
        "faction-snide": ["Permanent Marker", "cursive"],
        "faction-journeymen": ["Cutive Mono", "monospace"],
        "faction-singularity": ["Share Tech Mono", "monospace"],
        "faction-ua-masters": ["UnifrakturCook", "serif"],
        // Style-named aliases (handoff naming)
        "faction-marker": ["Permanent Marker", "cursive"],
        "faction-mono": ["Cutive Mono", "monospace"],
        "faction-blackletter": ["UnifrakturCook", "serif"],
        "faction-script": ["Caveat", "cursive"],
        "faction-old": ["IM Fell English", "serif"],
      },
      colors: {
        paper: "var(--color-bg-page)",
        ink: "var(--color-text-primary)",
        muted: "var(--color-text-secondary)",
        tertiary: "var(--color-text-tertiary)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        surface: "var(--color-bg-surface)",
        "surface-alt": "var(--color-bg-surface-alt)",
        accent: "var(--color-accent-primary)",
        // Faction palette — rainbow primaries (light mode; dark mode via CSS vars)
        ua: { DEFAULT: "#7c3aed", accent: "#a78bfa" },
        analog: { DEFAULT: "#ca8a04", accent: "#fbbf24" },
        gestalt: { DEFAULT: "#be185d", accent: "#f472b6" },
        snide: { DEFAULT: "#6fae00", accent: "#b6ff2e" },
        journeymen: { DEFAULT: "#0e7490", accent: "#22d3ee" },
        singularity: { DEFAULT: "#2563eb", accent: "#60a5fa" },
        "ua-masters": { DEFAULT: "#c2410c", accent: "#fb923c" },
      },
      fontSize: {
        "wz-xs": "8px",
        "wz-sm": "9px",
        "wz-base": "10px",
        "wz-md": "11px",
        "wz-lg": "12px",
        "wz-xl": "14px",
        "wz-2xl": "18px",
        "wz-3xl": "28px",
        "wz-4xl": "34px",
      },
    },
  },
  plugins: [],
} satisfies Config;

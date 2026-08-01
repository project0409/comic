import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--sf-bg)",
        surface: "var(--sf-surface)",
        card: "var(--sf-card)",
        elevated: "var(--sf-elevated)",
        primary: "var(--sf-primary)",
        gold: "var(--sf-gold)",
        highlight: "var(--sf-highlight)",
        danger: "var(--sf-danger)",
        text: "var(--sf-text)",
        muted: "var(--sf-muted)"
      },
      fontFamily: {
        display: ["var(--sf-font-display)", "system-ui", "sans-serif"],
        ui: ["var(--sf-font-ui)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px color-mix(in srgb, var(--sf-primary) 38%, transparent), 0 0 34px color-mix(in srgb, var(--sf-primary) 24%, transparent), 0 0 22px color-mix(in srgb, var(--sf-highlight) 12%, transparent)"
      }
    }
  },
  plugins: []
} satisfies Config;

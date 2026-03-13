import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-alt": "rgb(var(--surface-alt) / <alpha-value>)",
        "surface-raised": "rgb(var(--surface-raised) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        panel:
          "0 24px 60px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(248, 250, 252, 0.03)",
        glow: "0 0 0 1px rgba(59, 130, 246, 0.22), 0 18px 40px rgba(59, 130, 246, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      maxWidth: {
        "8xl": "88rem"
      },
      letterSpacing: {
        tightest: "-0.045em"
      },
      backgroundImage: {
        "panel-grid":
          "linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#07050c",
          1: "#0a0810",
          2: "#05030a",
          card: "rgba(6, 4, 10, 0.98)",
        },
        gold: {
          DEFAULT: "#c8942a",
          bright: "#f0d070",
          deep: "#7a5c1a",
        },
        tx: {
          gold: "rgba(240, 208, 112, 0.88)",
          dim: "rgba(200, 175, 120, 0.55)",
          muted: "rgba(180, 155, 100, 0.38)",
          body: "rgba(210, 195, 165, 0.82)",
        },
        lu:   "#50C882",
        quan: "#64A0F8",
        ke:   "#F0C850",
        ji:   "#F05A5A",
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.5)",
        sm: "0 2px 8px rgba(0,0,0,0.5)",
        md: "0 4px 16px rgba(0,0,0,0.6)",
        lg: "0 8px 32px rgba(0,0,0,0.7)",
      },
      borderRadius: {
        sharp: "1px",
        sm: "2px",
        md: "3px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseDot: {
          "0%, 60%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "30%": { opacity: "0.9", transform: "scale(1.15)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

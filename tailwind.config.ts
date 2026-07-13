import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
        serif: ["var(--font-cormorant)", "serif"],
      },
      colors: {
        brand: {
          pink: "#C1121F",      // Luxury Satin Ruby Red
          pinkLight: "#FFF7F6", // Soft Pearl Blush Cream
          lavender: "#D4AF37",  // Champagne Gold
          lavenderLight: "#FAF6F0", // Soft Silk Cream
          gold: "#DFBA6B",      // Soft Muted Gold
          charcoal: "#121212",  // Deep Luxury Onyx
          charcoalLight: "#1C1C1C",
          gray: "#8A8A8A",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(193, 18, 31, 0.04)",
        glassAccent: "0 8px 32px 0 rgba(212, 175, 55, 0.08)",
      },
      animation: {
        "float-slow": "float 4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.95" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

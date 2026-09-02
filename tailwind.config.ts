import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main website colors
        primary: "#BE5103",
        "primary-hover": "#B7410E",
        secondary: "#069494",
        "secondary-hover": "#057A7A",
        yellow: "#FFCE1B",
        "yellow-hover": "#E6B800",
        dark: "#1A1A1A",
        "dark-hover": "#262626",
        black: "#010401",
        paper: "#FEFAF3",
        "paper-soft": "#FBF1E1",
        "paper-tint": "#F4E2C4",
        line: "#ECDFC7",
        "line-strong": "#DCC9A0",
        muted: "#9A9285",
        subtle: "#6B6255",
        // User section colors
        brand: {
          50: "#fdf1e4",
          100: "#f8dec0",
          200: "#f0bd88",
          300: "#e19a5c",
          400: "#d9834a",
          500: "#be5103",
          600: "#b7410e",
          700: "#8f3502",
        },
        candy: {
          pink: "#069494",
          orange: "#be5103",
          cyan: "#22b8b0",
          lime: "#c9a227",
          yellow: "#ffce1b",
        },
        // Aliases
        ink: "#0b2e2b",
        coal: "#0B2E2B",
        mist: "#fbf1e1",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        "4xl": "28px",
        "5xl": "36px",
        "6xl": "44px",
      },
      boxShadow: {
        // Main website shadows
        "soft-sm": "0 2px 12px rgba(0,0,0,.06)",
        "soft-lg": "0 20px 60px rgba(0,0,0,.12)",
        lift: "0 16px 40px rgba(30,35,48,.14)",
        // User section shadows
        soft: "0 10px 40px -12px rgba(190,81,3,0.2)",
        glow: "0 20px 70px -20px rgba(6,148,148,0.4)",
        card: "0 30px 60px -25px rgba(11,46,43,0.35)",
        float: "0 40px 80px -30px rgba(11,46,43,0.45)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(120deg,#be5103 0%,#ffce1b 50%,#069494 100%)",
        mesh:
          "radial-gradient(at 12% 18%, rgba(190,81,3,0.18) 0px, transparent 50%), radial-gradient(at 85% 12%, rgba(6,148,148,0.18) 0px, transparent 50%), radial-gradient(at 78% 88%, rgba(255,206,27,0.18) 0px, transparent 50%), radial-gradient(at 18% 85%, rgba(183,65,14,0.16) 0px, transparent 50%)",
      },
      keyframes: {
        // Main website keyframes
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        bounce_gentle: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        // User section keyframes
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-26px) rotate(2deg)" },
        },
        spin_slow: {
          to: { transform: "rotate(360deg)" },
        },
        spinSlow: {
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        // Main website animations
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        bounce_gentle: "bounce_gentle 3s ease-in-out infinite",
        spin_slow: "spin_slow 20s linear infinite",
        // User section animations
        floatSlow: "floatSlow 9s ease-in-out infinite",
        spinSlow: "spinSlow 28s linear infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;

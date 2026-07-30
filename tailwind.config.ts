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
        primary: "#BE5103",
        "primary-hover": "#B7410E",
        secondary: "#069494",
        "secondary-hover": "#057A7A",
        yellow: "#FFCE1B",
        "yellow-hover": "#E6B800",
        dark: "#0B2E2B",
        "dark-hover": "#12403C",
        black: "#010401",
        paper: "#FEFAF3",
        "paper-soft": "#FBF1E1",
        "paper-tint": "#F4E2C4",
        line: "#ECDFC7",
        "line-strong": "#DCC9A0",
        muted: "#9A9285",
        subtle: "#6B6255",
        // aliases so any leftover markup keeps compiling
        ink: "#0B2E2B",
        coal: "#0B2E2B",
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
        soft: "0 8px 30px rgba(0,0,0,.08)",
        "soft-sm": "0 2px 12px rgba(0,0,0,.06)",
        "soft-lg": "0 20px 60px rgba(0,0,0,.12)",
        lift: "0 16px 40px rgba(30,35,48,.14)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        bounce_gentle: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        spin_slow: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        bounce_gentle: "bounce_gentle 3s ease-in-out infinite",
        spin_slow: "spin_slow 20s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;

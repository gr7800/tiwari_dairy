import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--color-accent)",
        "accent-dark": "var(--color-accent-dark)",
        "accent-light": "var(--color-accent-light)",
        paid: "var(--color-success)",
        partial: "var(--color-warning)",
        unpaid: "var(--color-danger)",
        advance: "var(--color-info)",
        gold: "var(--color-gold)",
        "gold-light": "var(--color-gold-light)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

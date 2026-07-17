import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#10b981",
          dark: "#059669",
          light: "#d1fae5",
        },
        ink: "#0c3529",
        paper: "#f2faf5",
        mint: "#cdeadb",
        sun: "#ffc94d",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
        display: ["var(--font-baloo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brick: "0 4px 0 0 #0c3529",
        "brick-sm": "0 3px 0 0 #0c3529",
        "brick-lg": "0 6px 0 0 #0c3529",
      },
    },
  },
  plugins: [],
};

export default config;

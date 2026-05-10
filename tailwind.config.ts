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
        abyss: "#05060a",
        surface: "#0c0f18",
        accent: {
          cyan: "#5eead4",
          violet: "#a78bfa",
          fuchsia: "#e879f9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(94,234,212,0.18), transparent 55%), radial-gradient(circle at 80% 20%, rgba(167,139,250,0.18), transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(94, 234, 212, 0.25), 0 0 120px rgba(129, 140, 248, 0.2)",
        card: "0 20px 80px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;

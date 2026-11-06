import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        surface: "#11131A",
        surfaceHover: "#181B24",
        surfaceActive: "#202430",
        border: "#202433",
        borderSubtle: "#181B26",
        brandGreen: {
          DEFAULT: "#00E599",
          hover: "#10F0A3",
          dim: "rgba(0, 229, 153, 0.12)",
          glow: "rgba(0, 229, 153, 0.25)",
        },
        brandPurple: {
          DEFAULT: "#8B5CF6",
          hover: "#A78BFA",
          dim: "rgba(139, 92, 246, 0.12)",
          glow: "rgba(139, 92, 246, 0.25)",
        },
        brandRed: {
          DEFAULT: "#FF0033",
          hover: "#FF2E54",
          dim: "rgba(255, 0, 51, 0.12)",
          glow: "rgba(255, 0, 51, 0.25)",
        },
        textMuted: "#8E95A5",
        textSubtle: "#5A6172",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

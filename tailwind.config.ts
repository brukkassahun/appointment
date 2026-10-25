import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF9F6",
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#1F1F1F",
        },
        charcoal: "#141414",
        muted: {
          DEFAULT: "#6B6B6B",
          foreground: "#6B6B6B",
        },
        card: {
          DEFAULT: "#F7F5F0",
          foreground: "#171814",
        },
        border: "#E8E6E1",
        faint: "#A0A0A0",
        line: "#E8E6E1",
        lineDark: "#2A2A2A",
        accent: {
          DEFAULT: "#0E7A3D",
          strong: "#0A5C2E",
          dim: "#E8F5E9",
        },
        navy: {
          DEFAULT: "#1A2744",
          light: "#2A3E60",
        },
        flare: {
          DEFAULT: "#E0571F",
          strong: "#C94A14",
          dim: "#FBE6DA",
        },
        success: "#0E7A3D",
        warning: "#E0571F",
        danger: "#DC2626",
      },
      fontFamily: {
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0F1024",
          card: "#1A1B36",
          card2: "#22244A",
          hover: "#2A2C5A",
        },
        accent: {
          purple: "#8B5CF6",
          purple2: "#A78BFA",
          pink: "#EC4899",
          green: "#34D399",
          red: "#EF4444",
          yellow: "#FBBF24",
          blue: "#3B82F6",
        },
        text: {
          DEFAULT: "#E5E7EB",
          muted: "#9CA3AF",
          dim: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(139, 92, 246, 0.35)",
      },
    },
  },
  plugins: [],
};

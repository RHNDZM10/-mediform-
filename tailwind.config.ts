import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        med: {
          50: "#eff7ff",
          100: "#dcedff",
          200: "#b7dcff",
          300: "#7fc1ff",
          400: "#3fa0ff",
          500: "#147ee8",
          600: "#075fc3",
          700: "#0757b8",
          800: "#084486",
          900: "#0b3b70"
        },
        mint: "#8df67a"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(7, 87, 184, 0.14)",
        glass: "0 20px 70px rgba(10, 45, 90, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;

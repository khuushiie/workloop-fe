/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        xl3: "1280px",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary-600)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary-600)",
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
          950: "var(--color-secondary-950)",
        },
        surface: {
          DEFAULT: "var(--color-bg-base)",
          muted: "var(--color-bg-muted)",
        },
        accent: {
          DEFAULT: "var(--color-success)",
          50: "var(--color-success-light)",
          500: "var(--color-success)",
          600: "#059669",
        },
        // Semantic color shortcuts for Tailwind classes
        success: {
          DEFAULT: "var(--color-success)",
          light: "var(--color-success-light)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "var(--color-warning-light)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          light: "var(--color-error-light)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          light: "var(--color-info-light)",
        },
        textColor: {
        primary: {
          DEFAULT: "var(--color-text-primary)", // This instantly fixes all 369 instances!
        },
        secondary: {
          DEFAULT: "var(--color-text-secondary)", // Fixes text-secondary
        },
        tertiary: {
          DEFAULT: "var(--color-text-tertiary)", // Fixes text-tertiary
        }
      },
        layout: {
          base: "var(--color-bg-layout)",           // Generates: bg-layout-base
          muted: "var(--color-bg-muted)",           // Generates: bg-layout-muted
          subtle: "var(--color-bg-subtle)",         // Generates: bg-layout-subtle
        },

        "border-primary": "var(--color-border-primary)",
        "border-secondary": "var(--color-border-secondary)",
      },
      boxShadow: {
        soft: "var(--shadow-brand)",
        "soft-hover": "var(--shadow-brand-hover)",
        "brand-button": "var(--shadow-brand-button)",
        glow: "var(--shadow-brand-glow)",
      },
      borderRadius: {
        inherit: "inherit",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        "soft-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s infinite linear",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "blob-drift": "blob-drift 8s ease-in-out infinite",
        "soft-bounce": "soft-bounce 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

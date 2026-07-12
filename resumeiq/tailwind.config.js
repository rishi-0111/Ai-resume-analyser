/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        surface: "#111827",
        card: "#161F33",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#F8FAFC",
        },
        accent: {
          DEFAULT: "#3B82F6",
          foreground: "#F8FAFC",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        border: "#1F2937",
        "primary-text": "#F8FAFC",
        "secondary-text": "#94A3B8",
        muted: {
          DEFAULT: "#64748B",
          foreground: "#94A3B8",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#F8FAFC",
        },
        popover: {
          DEFAULT: "#161F33",
          foreground: "#F8FAFC",
        },
        secondary: {
          DEFAULT: "#1F2937",
          foreground: "#94A3B8",
        },
        input: "#1F2937",
        ring: "#2563EB",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "20px",
        md: "14px",
        sm: "12px",
        button: "12px",
        card: "20px",
        input: "14px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #0B1120 100%)",
        "card-gradient":
          "linear-gradient(145deg, #161F33 0%, #111827 100%)",
        "blue-gradient":
          "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
        "glow-gradient":
          "radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        glow: "0 0 40px rgba(37, 99, 235, 0.3)",
        "glow-sm": "0 0 20px rgba(37, 99, 235, 0.2)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.05)",
        premium:
          "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(37,99,235,0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        marquee: "marquee 25s linear infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

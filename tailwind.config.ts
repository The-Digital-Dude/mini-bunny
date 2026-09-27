import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem", // 20px on mobile
        sm: "2rem",         // 32px
        md: "3rem",         // 48px
        lg: "5rem",         // 80px
        xl: "6rem",         // 96px
        "2xl": "8rem",      // 128px
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Mini Bunny core brand tokens
        "bunny-blue": {
          DEFAULT: "#4A8DB7",
          50: "#F0F7FB",
          100: "#E1EFF7",
          200: "#C3DFEF",
          300: "#96C5E3",
          400: "#6AA9D4",
          500: "#4A8DB7",
          600: "#367299",
          700: "#2B5A7A",
          800: "#244962",
          900: "#1E3E5B",
        },
        "bunny-pink": {
          DEFAULT: "#FF758F",
          50: "#FFF0F3",
          100: "#FFE3E8",
          200: "#FFCCD5",
          300: "#FFA3B5",
          400: "#FF758F",
          500: "#F45D7B",
          600: "#DB3859",
          700: "#B82341",
        },
        "bunny-cream": {
          DEFAULT: "#FFF9F0",
          50: "#FFFDF9",
          100: "#FFF9F0",
          200: "#FEF2E0",
          300: "#FCE5C2",
          400: "#F7D299",
          500: "#EDB86E",
        },
        // Legacy variable map preserved for template compatibility with baby boutique palette
        "bunny-navy": "#1E3E5B",      // Deep Bunny Navy Blue (high contrast, warm, friendly)
        "bunny-coral": "#FF758F",     // Pastel Pink / Coral Accent (hero buttons, highlights)
        "bunny-bg": "#FAF9F5",         // Soft Warm White / Alabaster background
        "bunny-surface": "#FFFFFF",    // Crisp Pure White card surface
        "bunny-muted": "#F4F2EC",      // Warm Cream Muted container
        "bunny-border": "#EDE8DF",     // Soft Alabaster Border
        "bunny-text": "#24303E",       // Soft Charcoal for friendly legibility
        "bunny-text-muted": "#6C7A89", // Gentle Slate
        "bunny-success": "#38A169",    // Soft Sage Green
        "bunny-error": "#E53E3E",      // Soft Coral Red
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        full: "9999px",
      },
      boxShadow: {
        "minibunny": "0 4px 20px rgba(74, 141, 183, 0.08)",
        "bunny": "0 6px 24px rgba(74, 141, 183, 0.10)",
        "bunny-soft": "0 2px 12px rgba(30, 62, 91, 0.04)",
        "bunny-pink": "0 4px 20px rgba(255, 117, 143, 0.20)",
      }
    },
  },
  plugins: [],
};
export default config;

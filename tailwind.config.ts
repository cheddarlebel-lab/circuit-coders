import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        circuit: {
          50: "#e6fff5",
          100: "#b3ffe0",
          200: "#80ffcc",
          300: "#4dffb8",
          400: "#1affa3",
          500: "#00e68a",
          600: "#00b36b",
          700: "#00804d",
          800: "#004d2e",
          900: "#001a10",
        },
        carbon: {
          50: "#1a1a2e",
          100: "#16162a",
          200: "#121226",
          300: "#0e0e22",
          400: "#0a0a1e",
          500: "#06061a",
          600: "#040416",
          700: "#020212",
          800: "#01010e",
          900: "#00000a",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "trace-path": "trace-path 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "grid-fade": "grid-fade 4s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "marquee-slow": "marquee 45s linear infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        "counter-pulse": "counter-pulse 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", filter: "blur(20px)" },
          "50%": { opacity: "0.8", filter: "blur(30px)" },
        },
        "trace-path": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(5px) rotate(-1deg)" },
        },
        "grid-fade": {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.08" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,230,138,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,138,0.03) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(ellipse at center, rgba(0,230,138,0.15) 0%, transparent 70%)",
        "hero-gradient": "linear-gradient(135deg, rgba(0,230,138,0.1) 0%, transparent 50%, rgba(0,230,138,0.05) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

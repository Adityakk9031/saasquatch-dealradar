import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sq: {
          bg: "#0a0f1c",
          panel: "#121826",
          card: "#1a2236",
          border: "#2a3550",
          teal: "#14b8a6",
          blue: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};
export default config;

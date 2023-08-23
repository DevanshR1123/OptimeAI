/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { ...colors.neutral, DEFAULT: "#404040" },
      },
      gridTemplateRows: {
        12: "repeat(12, minmax(0, 1fr))",
        48: "repeat(48, minmax(0, 1fr))",
        96: "repeat(96, minmax(0, 1fr))",
        sandwich: "auto 1fr auto",
      },
      borderWidth: {
        1: "1px",
      },
    },
    fontFamily: {
      sans: ["Inter", "Arial", "sans-serif"],
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};

/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { ...colors.neutral, DEFAULT: "#404040" },
      },
    },
    fontFamily: {
      sans: ["Inter", "Arial", "sans-serif"],
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};

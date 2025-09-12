/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
        signature: ['"Great Vibes"', "cursive"],
      },
      colors: {
        primary: "#fea928",
        secondary: "#ed8900",
        golden: "#FFD700",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "0.075rem",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};

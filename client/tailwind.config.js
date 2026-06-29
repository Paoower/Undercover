/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aubergine: {
          100: "#ede4fb",
          200: "#d8c6f5",
          950: "#190a26",
          900: "#22103a",
          800: "#2d1650",
          700: "#3b1d66",
          600: "#4d2a85",
          500: "#6b3fb0",
          400: "#8b5cd6",
          300: "#b18cf0",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

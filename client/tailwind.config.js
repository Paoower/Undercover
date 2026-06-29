/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Monochrome ramp. Kept under the "aubergine" name so existing
        // utility classes (text-aubergine-200, ring-aubergine-400, …) map to
        // the black & white theme without touching every component.
        aubergine: {
          100: "#fafafa",
          200: "#e5e5e5",
          300: "#a3a3a3",
          400: "#ededed",
          500: "#737373",
          600: "#3a3a3a",
          700: "#262626",
          800: "#171717",
          900: "#101010",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

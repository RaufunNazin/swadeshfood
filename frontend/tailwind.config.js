/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#00ADEF",
        xgray: "#555555",
        xlightgray: "#A1A1A1",
        xdark: "#151515",
        xlightergray: "#F0F0F0",
        xlightestgray: "#FAFAFA",
        xred: "#ff5733",
        xyellow: "#EED36E",
      },
    },
  },
  plugins: [],
}
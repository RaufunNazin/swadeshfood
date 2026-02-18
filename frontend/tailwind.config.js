export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // <--- ADD THIS LINE
  theme: {
    extend: {
      colors: {
        brand: "#16a34a", // green-600
      },
    },
  },
  plugins: [],
};

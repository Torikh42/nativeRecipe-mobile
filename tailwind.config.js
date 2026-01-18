/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,tsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B6B", // Vibrant Coral/Orange
        secondary: "#2D3436", // Dark Charcoal
        background: "#F8F9FA", // Soft White/Gray
        surface: "#FFFFFF",
        accent: "#FFE3E3", // Soft highlight
      },
    },
  },
  plugins: [],
}
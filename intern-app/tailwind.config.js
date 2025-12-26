/** @type {import('tailwindcss').Config} */
module.exports = {
  // Quan trọng: Trỏ đúng các file code của bạn
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")], // Dòng này bắt buộc cho v4
  theme: {
    extend: {},
  },
  plugins: [],
}
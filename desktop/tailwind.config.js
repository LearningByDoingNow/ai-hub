/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./chat.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: { extend: {} },
  plugins: [require("@tailwindcss/typography")],
};

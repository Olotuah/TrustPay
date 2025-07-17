/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: '#6366F1',       // Indigo-500
        secondary: '#8B5CF6',     // Purple-500
        accent: '#F472B6',        // Pink-400
        background: '#F3F4F6',    // Gray-100
      },
    },
  },
  plugins: [],
}

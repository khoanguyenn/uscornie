/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          pink: '#f472b6',
          dark: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}

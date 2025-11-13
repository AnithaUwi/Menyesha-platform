/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        menyesha: {
          blue: '#1e40af',
          green: '#065f46', 
          gold: '#d97706',
          submitted: '#f59e0b',
          received: '#3b82f6',
          inprogress: '#7c3aed',
          solved: '#059669',
        }
      }
    },
  },
  plugins: [],
}
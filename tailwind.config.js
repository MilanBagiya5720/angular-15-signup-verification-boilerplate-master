/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Adjust the paths to match your project structure
  ],
  theme: {
    extend: {
      width: {
        '300-px': '300px',
      }
    }
  },
  plugins: [],
}

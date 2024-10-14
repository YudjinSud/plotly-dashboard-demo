/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add the following line to include Plotly components
    "./node_modules/react-plotly.js/dist/create-plotly-component.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
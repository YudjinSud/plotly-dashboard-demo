import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: 'https://yudjinsud.github.io/plotly-dashboard-demo/',
  define: {
    global: {},
  },
  build: {
    rollupOptions: {
      external: ['plotly.js/dist/plotly', 'react-chart-editor'],
    },
  },
})

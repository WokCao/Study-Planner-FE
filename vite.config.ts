import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Study-Planner-FE/',
  appType: 'spa',
  optimizeDeps: {
    exclude: ['sweetalert2']
  }
})

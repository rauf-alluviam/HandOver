// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://staging.odexglobal.com',
        changeOrigin: true,
      },
    },
    allowedHosts: ['8c749e4308c4.ngrok-free.app'], // ✅ Correct syntax
  },
  define: {
    'process.env': {},
  },
})

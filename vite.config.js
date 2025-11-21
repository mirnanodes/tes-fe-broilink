// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Port untuk Frontend Anda (tempat React berjalan)
    port: 5173, 
    // host: true, // Tidak wajib, tapi tidak masalah
    
    // --- Bagian PENTING untuk menghubungkan ke Backend (BE) ---
    proxy: {
      // Proxy untuk API endpoints
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy untuk Sanctum CSRF cookie
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    // -----------------------------------------------------------
  },
})
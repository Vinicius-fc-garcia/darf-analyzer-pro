import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/darf-analyzer-pro/',
  build: {
    target: 'esnext', // Otimiza para navegadores modernos e evita problemas com top-level await se existirem
  }
})

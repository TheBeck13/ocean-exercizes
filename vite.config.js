import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ocean-exercizes/',
  plugins: [react()],
  build: {
    // Single chunk for small apps — avoids extra round trips
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Target modern browsers only
    target: 'es2020',
    // Inline small assets
    assetsInlineLimit: 8192,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})

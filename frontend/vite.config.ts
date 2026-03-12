import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
console.log('[Kovrr] Frontend dev server starting...')

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'kovrr-log',
      configureServer() {
        return () => {
          console.log('[Kovrr] Frontend ready at http://localhost:5173')
        }
      },
    },
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})

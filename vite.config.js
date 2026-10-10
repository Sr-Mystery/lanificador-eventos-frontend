import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const shouldProxyToBackend = process.env.VITE_USE_BACKEND_PROXY === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: shouldProxyToBackend
    ? {
        proxy: {
          '/api': 'http://127.0.0.1:8000',
          '/eventos': 'http://127.0.0.1:8000',
        },
      }
    : undefined,
})

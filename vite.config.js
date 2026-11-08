import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep Vite's cache in the standard ignored directory to avoid stale
  // generated cache folders preventing the dev server from restarting.
  cacheDir: "node_modules/.vite/tourdss",
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
})

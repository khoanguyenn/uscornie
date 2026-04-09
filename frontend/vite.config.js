import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/auth': 'http://backend:8000',
      '/spaces': 'http://backend:8000',
      '/invites': 'http://backend:8000'
    }
  }
})

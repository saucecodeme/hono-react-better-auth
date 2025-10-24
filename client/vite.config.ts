import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // That tells both the dev optimizer and the production build (Rollup)
  // to treat the module as external instead of rolling it into the bundle.
  optimizeDeps: {
    exclude: ['better-auth/react'],
  },
  build: {
    rollupOptions: {
      external: ['better-auth/react'],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})

/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_URL || 'http://localhost:3000';

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true
        },
        '/socket.io': {
          target: proxyTarget.replace('http', 'ws'),
          ws: true
        }
      }
    },
    test: {
      environment: 'jsdom',
      globals: true
    }
  }
})

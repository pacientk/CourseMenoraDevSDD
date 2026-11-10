import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { mockApiPlugin } from './mocks/mockApiPlugin.ts'

// Offline mode (`npm run dev:offline`) serves a local copy of the API under /mock-api —
// for when the corporate network blocks https://dummyjson.com.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'offline' ? [mockApiPlugin()] : [])],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
    unstubGlobals: true,
  },
}))

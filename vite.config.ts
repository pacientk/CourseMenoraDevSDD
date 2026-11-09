import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { mockApiPlugin } from './mocks/mockApiPlugin.ts'

// Офлайн-режим (`npm run dev:offline`) поднимает локальную копию API под /mock-api —
// на случай, когда корпоративная сеть не пускает к https://dummyjson.com.
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

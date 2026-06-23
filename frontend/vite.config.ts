/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // renderToStaticMarkup needs no DOM, so the default 'node' environment is fine.
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})

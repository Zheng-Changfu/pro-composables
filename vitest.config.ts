import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    dedupe: [
      'vue',
    ],
  },
  test: {
    environment: 'jsdom',
    reporters: 'dot',
  },
})

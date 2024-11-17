import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    dedupe: [
      'vue',
    ],
  },
  define: {
    __DEV__: true,
  },
  test: {
    environment: 'jsdom',
    reporters: 'dot',
  },
})

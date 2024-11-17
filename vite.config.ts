import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          format: 'es',
          dir: './dist',
        },
        {
          format: 'cjs',
          dir: './dist',
        },
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      bundledPackages: [
        '@vueuse/core',
        '@vueuse/shared',
        // 'type-fest',
      ],
    }),
  ],
})

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { dependencies, peerDependencies } from './package.json'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: Object.keys({
        ...dependencies,
        ...peerDependencies,
      }),
      output: {
        dir: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [
    dts({
      outDir: 'es',
      tsconfigPath: './tsconfig.esm.json',
    }),
  ],
})

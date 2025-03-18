import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { dependencies, peerDependencies } from './package.json'

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: Object.keys({
        ...dependencies,
        ...peerDependencies,
      }),
      output: {
        dir: 'lib',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        exports: 'named',
      },
    },
  },
  plugins: [
    dts({
      outDir: 'lib',
      tsconfigPath: './tsconfig.cjs.json',
    }),
  ],
})

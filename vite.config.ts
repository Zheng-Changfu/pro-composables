import { defineConfig } from 'vite'
// import path from 'path'

export default defineConfig({
  resolve: {
    alias: [
      // {
      //   find: "@vue-ast/types",
      //   replacement: path.resolve(__dirname, './packages/ast-types/src')
      // },
    ],
  },
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
})

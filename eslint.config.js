import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  markdown: false,
  gitignore: false,
  rules: {
    'no-console': 'off',
    'no-cond-assign': 'off',
    'ts/ban-ts-comment': 'off',
    'unicorn/no-new-array': 'off',
    'ts/no-unused-expressions': 'off',
    'node/prefer-global/process': 'off',
    'ts/explicit-function-return-type': 'off',
  },
  ignores: [
    'es',
    'lib',
    'node_modules',
  ],
})

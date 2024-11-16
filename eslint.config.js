import antfu from '@antfu/eslint-config'

export default antfu({
  markdown: false,
  gitignore: false,
  rules: {
    'no-console': 'off',
    'no-cond-assign': 'off',
    'node/prefer-global/process': 'off',
  },
})

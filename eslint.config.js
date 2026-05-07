const next = require('eslint-config-next')
const prettier = require('eslint-config-prettier')

module.exports = [
  ...next,
  prettier,
  {
    ignores: ['out/**', '.next/**', 'node_modules/**']
  }
]

// eslint.config.js
import vue from 'eslint-plugin-vue'
import prettier from '@vue/eslint-config-prettier'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default [
  // Vue SFC files
  {
    files: ['**/*.vue'],
    languageOptions: {
      // Use Vue parser so ESLint understands <template>
      parser: vueParser,
      parserOptions: {
        // Use TS parser for the <script lang="ts">
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      vue,
    },
    rules: {
      // Example: align template tags
      'vue/html-indent': ['error', 2],
      'vue/script-indent': ['off'], // let Prettier handle script indentation
    },
  },

  // Plain JS/TS files
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },

  // Disable rules that conflict with Prettier
  prettier,
]

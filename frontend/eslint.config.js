// Lint guard for the i18n sweep (issue #440 / ADR-0032): flag user-facing
// literal strings in JSX as warnings while the per-area extraction sweeps are
// in progress. Flipped to 'error' by the final cleanup issue (#450).
import tsParser from '@typescript-eslint/parser'
import i18next from 'eslint-plugin-i18next'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          // JSX text + attributes only — plain TS code (constants, enums,
          // API params) is not user-facing copy.
          mode: 'jsx-only',
          'jsx-attributes': {
            // Non-copy attributes. Deliberately NOT excluded: aria-label,
            // alt, title, placeholder — a11y strings are user-facing copy
            // and must be extracted (ADR-0032).
            exclude: [
              'className',
              'style',
              'styleName',
              'key',
              'id',
              'name',
              'type',
              'rel',
              'target',
              'src',
              'href',
              'to',
              'path',
              'method',
              'action',
              'autoComplete',
              'loading',
              'role',
              'data-\\w[\\w-]*',
            ],
          },
          callees: {
            // Console output is developer-facing, never localized.
            exclude: [
              'console\\.(log|warn|error|info|debug)',
            ],
          },
          words: {
            // URLs and route paths are not copy.
            exclude: [
              '^/[\\w\\-./:?=&]*$',
              '^https?://.*$',
            ],
          },
        },
      ],
    },
  },
  {
    // Test files assert on literal strings by design.
    files: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__tests__/**',
      'e2e/**',
    ],
    rules: {
      'i18next/no-literal-string': 'off',
    },
  },
]

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'promise', 'jsx-a11y', 'sonarjs'],
  extends: [
    'next/core-web-vitals',
    'plugin:sonarjs/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:node/recommended',
    'plugin:promise/recommended',
    'prettier',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    project: ['./tsconfig.json'],
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'node/no-process-exit': 'off',
    'no-process-exit': 'off',
    'promise/param-names': 'off',
    'node/no-extraneous-import': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    'no-async-promise-executor': 'off',
    'node/no-missing-import': 'off',
    'node/no-unpublished-import': 'off',
    'node/exports-style': ['error', 'module.exports'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/url-search-params': ['error', 'always'],
    'node/prefer-global/url': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] },
    ],
    'no-case-declarations': 'off',
    'promise/always-return': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'sonarjs/no-nested-template-literals': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
  },
  ignorePatterns: ['**/dist/**/*', '**/out/**/*'],

  env: {
    'jest/globals': true,
  },
  overrides: [
    {
      // Overrides for all tests - we can be slightly less strict there
      files: ['**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        'node/no-missing-require': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'sonarjs/no-duplicate-string': 'off',
      },
    },
    {
      files: ['**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        'sonarjs/cognitive-complexity': 'off',
      },
    },
    // API functions
    {
      files: ['**/api/**/*.ts'],
      rules: {
        'sonarjs/cognitive-complexity': 'off',
      },
    },
    {
      // js files are usually configs where require is sometimes preferable
      files: ['**/*.js'],
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'node/no-unpublished-require': 'off',
      },
    },
  ],
};

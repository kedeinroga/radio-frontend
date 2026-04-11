module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // Downgraded to warnings — large amount of pre-existing occurrences.
    // Fix gradually; don't block PRs on existing technical debt.
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    'no-useless-catch': 'warn',
    'no-empty': 'warn',

    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

  },
  overrides: [
    {
      // Barrel export — allowed to re-export from all layers
      files: ['index.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      // Domain layer: hard error — must never import infrastructure or presentation
      files: ['domain/**/*.ts', 'domain/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: ['**/infrastructure/*'], message: 'Domain layer cannot import infrastructure' },
              { group: ['**/presentation/*'], message: 'Domain layer cannot import presentation' },
            ],
          },
        ],
      },
    },
    {
      // Application layer: warn for now — pre-existing violations, fix via DI refactor
      files: ['application/**/*.ts', 'application/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              { group: ['**/infrastructure/*'], message: 'Application layer should not import infrastructure directly — inject via interface' },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', '.turbo/', 'coverage/'],
}

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['prettier', 'next/core-web-vitals', 'plugin:react/recommended', 'airbnb'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'sonarjs'],
  globals: {
    React: true,
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  rules: {
    complexity: ['error', 15],
    'max-depth': ['error', 5],
    'max-lines': [
      'error',
      {
        max: 300,
        skipComments: true,
        skipBlankLines: true,
      },
    ],
    'max-nested-callbacks': ['error', 4],
    'max-params': ['error', 5],
    'max-len': ['error', 200],
    '@typescript-eslint/no-unused-vars': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'object-curly-newline': 'off', // Allow flexible object destructuring formatting
    'comma-dangle': 'off', // Allow flexible trailing comma usage
    'react/jsx-one-expression-per-line': 'off', // Allow multiple expressions per line
    'implicit-arrow-linebreak': 'off', // Allow flexible arrow function formatting
    'operator-linebreak': 'off', // Allow flexible operator line breaks
    'function-paren-newline': 'off', // Allow flexible function parameter formatting
    'react/jsx-curly-newline': 'off', // Allow flexible JSX curly brace formatting
    'no-confusing-arrow': 'off', // Allow arrow functions with conditional expressions
    'newline-per-chained-call': 'off', // Allow flexible method chaining
    indent: 'off', // Disable indent rule (Prettier handles this)
    'react/jsx-wrap-multilines': 'off', // Allow flexible JSX multiline wrapping
    'consistent-return': 'off', // Disabled for Next.js API routes with Promise<void>
    'react/no-array-index-key': 'off', // Allow index as key when items don't have unique IDs
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/order': [
      'off',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
      },
    ],
    'react/jsx-props-no-spreading': 0,
    'react/jsx-key': ['error', { warnOnDuplicates: true }],
    'react/react-in-jsx-scope': 0,
    'react/require-default-props': ['error', { functions: 'defaultArguments' }],
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        caseSensitive: true,
        commonjs: true,
      },
    ],
    'import/no-cycle': 'error',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    // sonar
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-empty-collection': 'error',
    'sonarjs/no-extra-arguments': 'error',
    'sonarjs/no-gratuitous-expressions': 'error',
    'sonarjs/no-identical-conditions': 'error',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-ignored-return': 'error',
    'sonarjs/no-inverted-boolean-check': 'error',
    'sonarjs/no-nested-switch': 'error',
    'sonarjs/no-nested-template-literals': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-same-line-conditional': 'error',
    'sonarjs/no-small-switch': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/no-use-of-empty-return-value': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/non-existent-operator': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/prefer-object-literal': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',
  },
};

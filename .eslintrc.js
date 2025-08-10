module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended'
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    // TypeScript 관련 규칙들
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-empty-function': 'warn',
    
    // JavaScript 기본 규칙들 비활성화 (TypeScript에서 처리)
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-console': 'off',
    'prefer-const': 'error'
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    'webpack.config.js',
    'jest.config.js'
  ]
};
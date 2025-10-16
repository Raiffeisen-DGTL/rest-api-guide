const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.js', '**/*.ts'],
    ignores: ['node_modules', 'dist', 'build','rules'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      quotes: [0, 'single'],
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
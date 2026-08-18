import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**']
  },
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 'varsIgnorePattern': '^React$' }],
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error'
    },
  }
);

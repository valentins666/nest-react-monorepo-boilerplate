import nx from '@nx/eslint-plugin';
import eslintPrettierRecommended from 'eslint-plugin-prettier/recommended';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  eslintPrettierRecommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];

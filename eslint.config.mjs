import nx from '@nx/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  eslintPrettierRecommended,
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: ['tsconfig.base.json'],
      },
    },
    // Override or add rules here
    rules: {
      'prettier/prettier': 'error',
      'eslint-disable-next-line': 'off',
      'array-callback-return': 'off',

      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];

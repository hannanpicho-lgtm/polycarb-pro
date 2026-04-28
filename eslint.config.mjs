import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import vitest from 'eslint-plugin-vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/.open-next/**',
      '**/open-next/**',
      '**/.wrangler/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    /** Large static B2B copy uses apostrophes and quotes; escaping hurts readability. */
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    ...vitest.configs.recommended,
    languageOptions: {
      ...vitest.configs.env.languageOptions,
    },
  },
  /** Must be last: disables ESLint rules that conflict with Prettier. */
  eslintConfigPrettier,
];

export default eslintConfig;

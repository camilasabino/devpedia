import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', '.astro/**', '.wrangler/**', 'src/content/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
  {
    rules: {
      // Re-enabled after eslint-config-prettier, which turns curly off.
      curly: ['error', 'all'],
    },
  },
];

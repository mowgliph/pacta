import globals from 'globals';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import { FlatCompat } from '@eslint/eslintrc';

// Crear un adaptador para la configuración antigua
const compat = new FlatCompat();

export default [
  // Configuración general
  js.configs.recommended,

  // Configuración de globals
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // Adaptación de configuración antigua
  ...compat.extends('plugin:prettier/recommended'),

  // Configuración del plugin prettier
  {
    plugins: {
      prettier: prettierPlugin,
    },
  },

  // Reglas personalizadas
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'comma-dangle': ['error', 'always-multiline'],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'max-len': [
        'error',
        {
          code: 100,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'object-curly-spacing': ['error', 'always'],
      'arrow-parens': ['error', 'as-needed'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'space-infix-ops': 'error',
      'keyword-spacing': ['error', { before: true, after: true }],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 100,
          tabWidth: 2,
          semi: true,
          bracketSpacing: true,
          arrowParens: 'avoid',
          bracketSameLine: false,
          quoteProps: 'as-needed',
        },
      ],
    },
  },
];

export default {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  rules: {
    // Regla que detecta variables declaradas pero no utilizadas
    '@typescript-eslint/no-unused-vars': ['error', { 
      // Nombrar con prefijo _ las variables que se pueden ignorar
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      // Variables atrapadas en bloques catch
      caughtErrorsIgnorePattern: '^_',
      // Permitir desestructuración con elementos no utilizados
      ignoreRestSiblings: true
    }],
    // Otras reglas comunes
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 
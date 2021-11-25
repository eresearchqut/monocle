module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        'max-len': 'off',
        'react/display-name': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};

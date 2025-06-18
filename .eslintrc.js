module.exports = {
  'root': true,
  'env': {
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:vue/essential'
  ],
  rules: {
    'array-bracket-spacing': ['error', 'never'],
    'brace-style': ['error', 'stroustrup'],
    'camelcase': ['error', {allow: ['$_veeValidate']}],
    'curly': ['error', 'all'],
    'eqeqeq': ['error', 'always'],
    'indent': ['error', 2, {'SwitchCase': 1, 'ignoredNodes': ['TemplateLiteral']}],
    'no-console': ['off'],
    'quotes': ['error', 'single', {'avoidEscape': true}],
    'semi': ['error', 'always'],
  },
  'parserOptions': {
    'parser': 'babel-eslint'
  }
};

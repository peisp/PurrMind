module.exports = {
  extends: ['standard'],
  plugins: ['react'],
  rules: {
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
    'jsx-quotes': ['error', 'prefer-single'], // 要求在 JSX 中使用单引号
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }], // 精确控制不同类型函数的空格
    'no-unused-vars': 'warn' // 将未使用变量从错误降级为警告
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
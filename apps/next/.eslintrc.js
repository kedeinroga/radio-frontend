module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // Pre-existing violations — downgraded to warnings, fix gradually
    'no-empty': 'warn',
    'react/no-unescaped-entities': 'warn',
    'no-useless-catch': 'warn',
    '@next/next/no-img-element': 'warn',
    '@next/next/no-html-link-for-pages': 'warn',
    '@next/next/no-sync-scripts': 'warn',
  },
}

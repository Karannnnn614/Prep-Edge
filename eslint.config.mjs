// Using direct export pattern for ESLint Flat Config with Next.js

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    extends: [
      'next/core-web-vitals'
    ]
  }
];

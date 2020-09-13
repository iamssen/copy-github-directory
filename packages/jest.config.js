const jestPresets = require('rocket-punch/jest-preset');

module.exports = {
  ...jestPresets,

  collectCoverageFrom: [
    'src/**/*.ts?(x)',
    '!**/*.d.ts?(x)',
    '!**/__*__/**',
    '!**/bin/**',
    '!**/bin.ts?(x)',
  ],
};

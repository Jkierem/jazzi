/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [ "./tests/setupTests.ts" ],
  globals: {
    "ts-jest": {
      tsconfig: "./tests/tsconfig.json"
    }
  }
};
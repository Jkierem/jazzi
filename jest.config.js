/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
/** @type {import('./jest-typings.d.ts')} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [ "./setupTests.ts" ],
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
      }
    }
  }
};
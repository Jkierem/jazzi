/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: [ "./tests/setupTests.ts" ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: "./tests/tsconfig.json"
    }]
  }
};
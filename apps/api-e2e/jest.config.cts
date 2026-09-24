export default {
  displayName: 'api-e2e',
  preset: '../../jest.preset.js',
  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/src/support/test-setup.ts'],
  testEnvironment: 'node',
  // The e2e suite talks to a shared MySQL schema, so files must run serially.
  maxWorkers: 1,
  testTimeout: 45000,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/api-e2e',
};
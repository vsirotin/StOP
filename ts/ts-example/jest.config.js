module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    '^@vsirotin/ts-stop/sfsm$': '<rootDir>/node_modules/@vsirotin/ts-stop/lib/sfsm/index.js',
    '^@vsirotin/ts-stop$': '<rootDir>/node_modules/@vsirotin/ts-stop/lib/index.js',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};

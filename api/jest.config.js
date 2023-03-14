module.exports = {
    moduleNameMapper: {
      '\\.(css|less)$': '<rootDir>/src/frontend/tests/__mocks__/styleMock.js',
    },
    testEnvironment: 'jsdom',
  };
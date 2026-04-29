module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
};

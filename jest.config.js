// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  testEnvironment: 'jest-fixed-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/singleton.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1',
    '^@clerk/nextjs$': '<rootDir>/__tests__/__mocks__/@clerk/nextjs.ts',
    '^@clerk/backend$': '<rootDir>/__tests__/__mocks__/@clerk/backend.ts',
    '^@prisma/client$': '<rootDir>/__tests__/__mocks__/@prisma/client.ts',
    '^@/app/api/auth/check-role/route$':
      '<rootDir>/__tests__/__mocks__/api/check-role.ts',
    '^@/app/api/test/check-user-role/route$':
      '<rootDir>/__tests__/__mocks__/api/check-user-role.ts',
    '^@/app/api/test/cache-status/route$':
      '<rootDir>/__tests__/__mocks__/api/cache-status.ts',
    '^@/app/api/test/check-backward-compat/route$':
      '<rootDir>/__tests__/__mocks__/api/check-backward-compat.ts',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'features/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@clerk/nextjs|@clerk/backend)/)',
    '\\.pnp\\.[^\\/]+$',
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Sementara nonaktifkan custom reporter
  reporters: [
    'default', // Reporter default Jest
    '<rootDir>/services/simpleJsonReporter.js', // Custom reporter
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

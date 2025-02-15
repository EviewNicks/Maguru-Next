/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    // '^.+\\.(ts|tsx)$': [
    //   'ts-jest',
    //   {
    //     tsconfig: 'tsconfig.json',
    //     jsx: 'react-jsx',
    //     diagnostics: {
    //       ignoreCodes: [1343]
    //     },
    //     astTransformers: {
    //       before: [
    //         {
    //           path: 'node_modules/ts-jest-mock-import-meta',  // optional
    //           options: { metaObjectReplacement: { url: 'https://www.url.com' } }
    //         }
    //       ]
    //     }
    //   },
    // ],
    '^.+\\.(ts|tsx)$': ['babel-jest'],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Jika komponen ada di folder src
    // atau
    '^@/(.*)$': '<rootDir>/$1', // Jika komponen langsung di root
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
    '@clerk/nextjs': '<rootDir>/__tests__/__mocks__/clerk-mock.tsx',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
    'node_modules/(?!(lucide-react|@radix-ui|@heroicons)/)',
  ],
}

export default config

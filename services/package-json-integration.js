/**
 * Contoh konfigurasi untuk package.json
 * Salin konfigurasi berikut ke package.json proyek Anda untuk
 * mengaktifkan custom reporter
 */

// Contoh konfigurasi lengkap untuk package.json
const packageJsonExample = {
  scripts: {
    test: 'jest',
    'test:integration': 'jest --config jest.integration.config.js',
    'test:integration:report':
      'jest --config jest.integration.config.js --reporters=default --reporters=<rootDir>/services/detailedJsonReporter.js',
    'test:unit': 'jest --testPathIgnorePatterns=integration',
    'test:report-detailed':
      'jest --reporters=default --reporters=<rootDir>/services/detailedJsonReporter.js',
    'test:report-simple':
      'jest --reporters=default --reporters=<rootDir>/services/simpleJsonReporter.js',
  },
}

// Contoh konfigurasi Jest untuk reporter
const jestConfigExample = {
  reporters: ['default', ['<rootDir>/services/detailedJsonReporter.js', {}]],
}

// Contoh konfigurasi khusus untuk integration testing
const jestIntegrationConfigExample = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/integration/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  reporters: ['default', ['<rootDir>/services/detailedJsonReporter.js', {}]],
}

console.log(
  'Contoh konfigurasi package.json untuk integrasi reporter tersedia di file ini.'
)
console.log(
  'Untuk menggunakan, salin bagian yang relevan ke package.json atau file konfigurasi Jest.'
)

module.exports = {
  packageJsonExample,
  jestConfigExample,
  jestIntegrationConfigExample,
}

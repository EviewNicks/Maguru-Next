/**
 * Mock untuk @sentry/nextjs
 *
 * File ini akan otomatis digunakan oleh Jest ketika ada import ke @sentry/nextjs
 * karena berada di __tests__/__mocks__/@sentry/nextjs.ts
 */

export const captureException = jest.fn()
export const addBreadcrumb = jest.fn()
export const withScope = jest.fn((callback) => {
  // Untuk menangani kasus seperti Sentry.withScope(scope => { ... })
  const mockScope = {
    setExtras: jest.fn(),
    setTags: jest.fn(),
    setUser: jest.fn(),
  }
  callback(mockScope)
})

// Objek Sentry lengkap untuk kompatibilitas dengan semua metode yang mungkin digunakan
const Sentry = {
  captureException,
  addBreadcrumb,
  withScope,
  init: jest.fn(),
  captureMessage: jest.fn(),
  configureScope: jest.fn(),
  setContext: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  setExtra: jest.fn(),
  setExtras: jest.fn(),
  lastEventId: jest.fn(),
  startTransaction: jest.fn(),
  getCurrentHub: jest.fn(),
}

export default Sentry

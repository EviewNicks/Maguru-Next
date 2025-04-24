import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

// Setup globals
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch
global.fetch = jest.fn()

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))

// Setup globals untuk web API
global.Request = jest.fn().mockImplementation(() => ({}))
global.Response = jest.fn().mockImplementation(() => ({}))

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => data),
    redirect: jest.fn((url) => ({ url })),
  },
  NextRequest: jest.fn().mockImplementation(() => ({
    nextUrl: { searchParams: new URLSearchParams() },
  })),
}))

// Mock @clerk/nextjs/server
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
  clerkClient: {
    users: {
      getUser: jest.fn().mockResolvedValue({ id: 'test-user-id' }),
    },
  },
}))

// Mock API route handlers
jest.mock('@/app/api/auth/check-role/route', () => ({
  GET: jest.fn().mockResolvedValue({ role: 'admin' }),
}))

jest.mock('@/app/api/test/check-user-role/route', () => ({
  GET: jest.fn().mockResolvedValue({ role: 'admin' }),
}))

jest.mock('@/app/api/test/cache-status/route', () => ({
  GET: jest.fn().mockResolvedValue({ cached: true, role: 'admin' }),
}))

jest.mock('@/app/api/test/check-backward-compat/route', () => ({
  GET: jest
    .fn()
    .mockResolvedValue({ role: 'admin', warning: 'Deprecated role format' }),
}))

// Setup test environment
beforeAll(() => {
  // Suppress console errors during tests
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  // Restore console.error
  jest.restoreAllMocks()
})

import { currentUser, getAuth } from '@clerk/nextjs/server'

// Mock untuk Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
  getAuth: jest.fn(),
}))

// Mock untuk Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock untuk role cache
jest.mock('@/lib/cache', () => ({
  getUserRole: jest.fn(),
  roleCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  },
}))

// Helper untuk menyiapkan mock admin user
export const setupMockAdminUser = () => {
  const mockUser = {
    id: 'admin_user_123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'admin@example.com' }],
  }

  // Setup mock untuk clerk auth
  ;(getAuth as jest.Mock).mockReturnValue({
    userId: mockUser.id,
    sessionId: 'mock-session-id',
    session: { userId: mockUser.id },
  })

  // Setup mock untuk current user
  ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

  return mockUser
}

// Helper untuk menyiapkan mock regular user
export const setupMockRegularUser = (userId = 'user_123') => {
  const mockUser = {
    id: userId,
    role: 'mahasiswa',
    firstName: 'Regular',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'user@example.com' }],
  }

  // Setup mock untuk clerk auth
  ;(getAuth as jest.Mock).mockReturnValue({
    userId: mockUser.id,
    sessionId: 'mock-session-id',
    session: { userId: mockUser.id },
  })

  // Setup mock untuk current user
  ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

  return mockUser
}

// Reset all mocks after each test
export const resetMocks = () => {
  jest.resetAllMocks()
}

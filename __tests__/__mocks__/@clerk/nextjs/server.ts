import { jest } from '@jest/globals'

// Mock untuk fungsi auth
export const auth = jest.fn().mockReturnValue({
  userId: null
})

// Mock untuk clerkClient
export const clerkClient = {
  users: {
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getUser: jest.fn()
  }
}

// Tipe untuk mock user Clerk
export type MockClerkUser = {
  id: string
  emailAddresses: { email: string }[]
  publicMetadata: {
    role?: string
    status?: string
  }
}

// Fungsi untuk membuat mock user Clerk
export function createMockClerkUser(overrides: Partial<MockClerkUser> = {}): MockClerkUser {
  return {
    id: overrides.id || 'clerk_1',
    emailAddresses: overrides.emailAddresses || [{ email: 'test@example.com' }],
    publicMetadata: {
      role: overrides.publicMetadata?.role || 'mahasiswa',
      status: overrides.publicMetadata?.status || 'active'
    }
  }
}

const clerkMock = {
  auth,
  clerkClient
}

export default clerkMock

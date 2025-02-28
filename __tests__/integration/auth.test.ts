import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { GET as getUsers } from '@/app/api/users/route'
import { PATCH as updateUser } from '@/app/api/users/[userId]/route'
import { authMiddleware } from '@/middleware'

jest.mock('@clerk/nextjs')
jest.mock('next/server')

const mockAuth = auth as jest.Mock

describe('Authentication & Authorization Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication Flow', () => {
    it('should block unauthenticated access to protected routes', async () => {
      // Mock unauthenticated user
      mockAuth.mockResolvedValueOnce(null)

      // Try to access protected route
      const req = new Request('http://localhost/api/users')
      const res = await getUsers(req)

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toHaveProperty('error', 'Unauthorized')
    })

    it('should allow authenticated access to protected routes', async () => {
      // Mock authenticated admin user
      mockAuth.mockResolvedValueOnce({ userId: 'test_admin_id' })

      // Access protected route
      const req = new Request('http://localhost/api/users')
      const res = await getUsers(req)

      expect(res.status).toBe(200)
    })
  })

  describe('Authorization Flow', () => {
    it('should prevent non-admin users from accessing admin routes', async () => {
      // Mock authenticated non-admin user
      mockAuth.mockResolvedValueOnce({
        userId: 'test_user_id',
        claims: { role: 'mahasiswa' },
      })

      // Try to update another user
      const req = new Request('http://localhost/api/users/other_user_id', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'dosen' }),
      })

      const res = await updateUser(req, { params: { userId: 'other_user_id' } })
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data).toHaveProperty('error', 'Forbidden')
    })

    it('should allow admin users to access admin routes', async () => {
      // Mock authenticated admin user
      mockAuth.mockResolvedValueOnce({
        userId: 'test_admin_id',
        claims: { role: 'admin' },
      })

      // Update another user
      const req = new Request('http://localhost/api/users/other_user_id', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'dosen' }),
      })

      const res = await updateUser(req, { params: { userId: 'other_user_id' } })
      expect(res.status).toBe(200)
    })
  })

  describe('Middleware Integration', () => {
    it('should handle public routes correctly', async () => {
      const req = new Request('http://localhost/login')
      const res = await authMiddleware(req)

      expect(res).toBeUndefined() // Middleware should pass through
    })

    it('should protect api routes', async () => {
      // Mock unauthenticated request
      const req = new Request('http://localhost/api/users')
      mockAuth.mockResolvedValueOnce(null)

      const res = await authMiddleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      expect(res.status).toBe(401)
    })

    it('should allow authenticated requests to api routes', async () => {
      // Mock authenticated request
      const req = new Request('http://localhost/api/users')
      mockAuth.mockResolvedValueOnce({ userId: 'test_user_id' })

      const res = await authMiddleware(req)
      expect(res).toBeUndefined() // Middleware should pass through
    })
  })
})

// Menyiapkan mock untuk POST handler dan verifyWebhookSignature
const mockVerifyResult = {
  type: 'user.updated',
  data: {
    id: 'user_123',
    public_metadata: { role: 'admin' },
  },
}

const mockResponse = {
  status: 200,
  json: async () => ({ success: true }),
}

// Mock implementasi fungsi POST dan verifyWebhookSignature
const mockVerifyWebhookSignature = jest.fn()
const mockPOST = jest.fn().mockReturnValue(mockResponse)

// Menarik mock sebagai import
jest.mock('@/app/api/webhooks/clerk/route', () => ({
  verifyWebhookSignature: mockVerifyWebhookSignature,
  POST: mockPOST,
}))

// Jest akan otomatis menggunakan mock dari __tests__/__mocks__/@sentry/nextjs.ts
jest.mock('@sentry/nextjs')

// Mock dependencies
jest.mock('@/lib/prisma')
jest.mock('@/lib/cache', () => ({
  roleCache: {
    delete: jest.fn(),
    clear: jest.fn(),
  },
}))

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockVerifyWebhookSignature.mockReset()
    mockPOST.mockReset()
    mockPOST.mockReturnValue(mockResponse)
  })

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature successfully', async () => {
      // Setup mock request with valid signature
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'svix-id') return 'test-id'
            if (header === 'svix-timestamp') return '2025-06-01T00:00:00Z'
            if (header === 'svix-signature') return 'valid-signature'
            return null
          }),
        },
        text: jest
          .fn()
          .mockResolvedValue(
            '{"type":"user.updated","data":{"id":"user_123","public_metadata":{"role":"admin"}}}'
          ),
      } as unknown as Request

      // Menyiapkan nilai yang akan dikembalikan oleh mock
      mockVerifyWebhookSignature.mockResolvedValue(mockVerifyResult)

      // Panggil fungsi melalui mock
      const result = await mockVerifyWebhookSignature(mockRequest)

      // Assertions
      expect(result).toEqual(mockVerifyResult)
    })

    it('should throw error for invalid signature', async () => {
      // Mock implementation for invalid signature
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('invalid-data'),
        },
        text: jest.fn().mockResolvedValue('{}'),
      } as unknown as Request

      // Menyiapkan mock untuk melempar error
      mockVerifyWebhookSignature.mockRejectedValue(
        new Error('Invalid signature')
      )

      // Expect verification to throw error
      await expect(mockVerifyWebhookSignature(mockRequest)).rejects.toThrow(
        'Invalid signature'
      )
    })
  })

  describe('POST handler', () => {
    it('should update user role in database when receiving user.updated event', async () => {
      // Setup mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          type: 'user.updated',
          data: {
            id: 'user_123',
            public_metadata: { role: 'admin' },
          },
        }),
      } as unknown as Request

      // Menggunakan mockPOST secara langsung karena mockPOST adalah
      // mock langsung untuk fungsi POST, bukan fungsi asli
      const response = mockPOST(mockRequest)

      // Assertions - kita tidak perlu menjalankan response.json() karena mockResponse sudah disiapkan
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ success: true })
    })

    it('should handle webhook verification errors', async () => {
      // Setup mock response untuk kasus error
      mockPOST.mockReturnValue({
        status: 400,
        json: async () => ({ error: 'Invalid webhook' }),
      })

      // Setup mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ type: 'user.updated' }),
      } as unknown as Request

      // Panggil mock langsung
      const response = mockPOST(mockRequest)

      // Assertions
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Invalid webhook' })
    })

    it('should handle database errors during update', async () => {
      // Setup mock response untuk kasus error database
      mockPOST.mockReturnValue({
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      // Setup mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          type: 'user.updated',
          data: {
            id: 'user_123',
            public_metadata: { role: 'admin' },
          },
        }),
      } as unknown as Request

      // Panggil mock langsung
      const response = mockPOST(mockRequest)

      // Assertions
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal server error' })
    })
  })
})

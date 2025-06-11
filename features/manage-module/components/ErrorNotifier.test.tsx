import {
  handleError,
  showErrorNotification,
  categorizeError,
  isErrorRetryable,
  getActionLabelByCategory,
} from './ErrorNotifier'
import { toast } from 'sonner'

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

describe('ErrorNotifier', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks()
  })

  describe('handleError', () => {
    it('should handle standard JavaScript Error', () => {
      const error = new Error('Test error message')
      const result = handleError(error)

      expect(result).toEqual({
        code: 'JS_ERROR',
        message: 'Test error message',
        category: expect.any(String),
        isRetryable: expect.any(Boolean),
      })
    })

    it('should handle HTTP error with response data', () => {
      const error = new Error('HTTP Error')
      // Simulasi error HTTP dengan response object
      Object.assign(error, {
        response: {
          status: 404,
          data: {
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: 'Resource tidak ditemukan',
              details: 'Detail error',
            },
          },
        },
      })

      const result = handleError(error)

      expect(result).toEqual({
        code: 'RESOURCE_NOT_FOUND',
        message: 'Resource tidak ditemukan',
        details: 'Detail error',
        category: expect.any(String),
        isRetryable: expect.any(Boolean),
      })
    })

    it('should handle HTTP error without specific error format', () => {
      const error = new Error('HTTP Error')
      // Simulasi error HTTP dengan format umum
      Object.assign(error, {
        response: {
          status: 400,
          data: {
            message: 'Bad Request Error',
          },
        },
      })

      const result = handleError(error)

      expect(result).toEqual({
        code: 'HTTP_400',
        message: 'Bad Request Error',
        category: expect.any(String),
        isRetryable: expect.any(Boolean),
      })
    })

    it('should handle HTTP error with only status code', () => {
      const error = new Error('HTTP Error')
      // Simulasi error HTTP tanpa detail, hanya status
      Object.assign(error, {
        response: {
          status: 500,
          data: {},
        },
      })

      const result = handleError(error)

      expect(result).toEqual({
        code: 'HTTP_500',
        message: 'Terjadi kesalahan pada server. Coba lagi nanti',
        category: expect.any(String),
        isRetryable: expect.any(Boolean),
      })
    })

    it('should handle string error', () => {
      const errorString = 'String error message'
      const result = handleError(errorString)

      expect(result).toEqual({
        code: 'STRING_ERROR',
        message: 'String error message',
        category: 'unknown',
        isRetryable: false,
      })
    })

    it('should handle object error', () => {
      const errorObject = {
        code: 'CUSTOM_ERROR',
        message: 'Custom error message',
        details: 'Error details',
      }
      const result = handleError(errorObject)

      expect(result).toEqual({
        code: 'CUSTOM_ERROR',
        message: 'Custom error message',
        details: 'Error details',
        category: expect.any(String),
        isRetryable: expect.any(Boolean),
      })
    })

    it('should handle unknown error types', () => {
      const result = handleError(null)

      expect(result).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Terjadi kesalahan yang tidak diketahui',
        category: 'unknown',
        isRetryable: false,
      })
    })
  })

  describe('categorizeError', () => {
    it('should categorize network errors', () => {
      const networkError1 = new Error('Network error')
      const networkError2 = new Error('Failed to fetch: connection error')
      const networkError3 = new Error('Request timed out')
      const networkError4 = Object.assign(new Error('Fetch failed'), {
        name: 'NetworkError',
      })

      expect(categorizeError(networkError1)).toBe('network')
      expect(categorizeError(networkError2)).toBe('network')
      expect(categorizeError(networkError3)).toBe('network')
      expect(categorizeError(networkError4)).toBe('network')
    })

    it('should categorize validation errors', () => {
      const validationError1 = new Error('Validation failed')
      const validationError2 = new Error('Field is required')
      const validationError3 = new Error('Invalid input')

      expect(categorizeError(validationError1)).toBe('validation')
      expect(categorizeError(validationError2)).toBe('validation')
      expect(categorizeError(validationError3)).toBe('validation')
    })

    it('should categorize authentication errors', () => {
      const authError1 = new Error('Authentication failed')
      const authError2 = new Error('Unauthorized access')
      const authError3 = new Error('Access denied')

      expect(categorizeError(authError1)).toBe('auth')
      expect(categorizeError(authError2)).toBe('auth')
      expect(categorizeError(authError3)).toBe('auth')
    })

    it('should categorize HTTP errors based on status code', () => {
      const clientError = new Error('Client error')
      Object.assign(clientError, { response: { status: 400 } })

      const authError = new Error('Auth error')
      Object.assign(authError, { response: { status: 401 } })

      const serverError = new Error('Server error')
      Object.assign(serverError, { response: { status: 500 } })

      expect(categorizeError(clientError)).toBe('client')
      expect(categorizeError(authError)).toBe('auth')
      expect(categorizeError(serverError)).toBe('server')
    })

    it('should return unknown for unrecognized error types', () => {
      expect(categorizeError({ random: 'object' })).toBe('unknown')
      expect(categorizeError(null)).toBe('unknown')
      expect(categorizeError(undefined)).toBe('unknown')
    })
  })

  describe('isErrorRetryable', () => {
    it('should return true for retryable error categories', () => {
      expect(isErrorRetryable('network')).toBe(true)
      expect(isErrorRetryable('server')).toBe(true)
    })

    it('should return false for non-retryable error categories', () => {
      expect(isErrorRetryable('validation')).toBe(false)
      expect(isErrorRetryable('client')).toBe(false)
      expect(isErrorRetryable('auth')).toBe(false)
      expect(isErrorRetryable('unknown')).toBe(false)
    })
  })

  describe('getActionLabelByCategory', () => {
    it('should return correct action label based on category', () => {
      expect(getActionLabelByCategory('network')).toBe('Coba Lagi')
      expect(getActionLabelByCategory('server')).toBe('Coba Lagi')
      expect(getActionLabelByCategory('validation')).toBe('Perbaiki')
      expect(getActionLabelByCategory('auth')).toBe('Login Ulang')
      expect(getActionLabelByCategory('client')).toBe('OK')
      expect(getActionLabelByCategory('unknown')).toBe('OK')
    })
  })

  describe('showErrorNotification', () => {
    it('should call toast.error with error details and description', () => {
      const error = new Error('Test notification error')
      showErrorNotification(error)

      // Memeriksa bahwa toast.error dipanggil dengan pesan error dan deskripsi sesuai kategori
      expect(toast.error).toHaveBeenCalledWith(
        'Test notification error',
        expect.objectContaining({
          description: expect.any(String),
          duration: expect.any(Number),
        })
      )
    })

    it('should include retry action for retryable errors', () => {
      const networkError = new Error('Network connection error')
      const retryFn = jest.fn()

      showErrorNotification(networkError, { retryFn })

      expect(toast.error).toHaveBeenCalledWith(
        'Network connection error',
        expect.objectContaining({
          description: 'Periksa koneksi internet Anda dan coba lagi.',
          action: expect.objectContaining({
            label: 'Coba Lagi',
            onClick: expect.any(Function),
          }),
        })
      )
    })

    it('should customize duration based on error category', () => {
      // Network error (longer duration)
      const networkError = new Error('Network error')
      showErrorNotification(networkError)

      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 8000,
        })
      )

      jest.clearAllMocks()

      // Client error (standard duration)
      const clientError = new Error('Validation error')
      Object.assign(clientError, {
        response: {
          status: 400,
          data: { message: 'Validation error' },
        },
      })
      showErrorNotification(clientError)

      expect(toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 5000,
        })
      )
    })
  })
})

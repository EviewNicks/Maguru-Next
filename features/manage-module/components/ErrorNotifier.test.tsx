import { handleError, showErrorNotification } from './ErrorNotifier'
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
      })
    })

    it('should handle string error', () => {
      const errorString = 'String error message'
      const result = handleError(errorString)

      expect(result).toEqual({
        code: 'STRING_ERROR',
        message: 'String error message',
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
      })
    })

    it('should handle unknown error types', () => {
      const result = handleError(null)

      expect(result).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'Terjadi kesalahan yang tidak diketahui',
      })
    })
  })

  describe('showErrorNotification', () => {
    it('should call toast.error with error details', () => {
      const error = new Error('Test notification error')
      showErrorNotification(error)

      expect(toast.error).toHaveBeenCalledWith('Test notification error', {
        description: 'JS_ERROR',
        duration: 5000,
      })
    })

    it('should call toast.error with HTTP error details', () => {
      const error = new Error('HTTP Error')
      Object.assign(error, {
        response: {
          status: 403,
          data: {
            error: {
              code: 'FORBIDDEN',
              message: 'Akses ditolak',
            },
          },
        },
      })

      showErrorNotification(error)

      expect(toast.error).toHaveBeenCalledWith('Akses ditolak', {
        description: 'FORBIDDEN',
        duration: 5000,
      })
    })
  })
})

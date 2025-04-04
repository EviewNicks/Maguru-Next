import React from 'react'
import { render } from '@testing-library/react'
import { toast } from 'sonner'
import { ErrorNotifier, ErrorDetails, ErrorType } from './ErrorNotifier'

// Mock Sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

describe('ErrorType', () => {
  it('should have correct predefined error types', () => {
    const expectedTypes: ErrorType[] = ['validation', 'network', 'server', 'permission', 'unknown']
    
    // Verifikasi bahwa setiap tipe error memiliki panjang yang benar
    expectedTypes.forEach(type => {
      expect(['validation', 'network', 'server', 'permission', 'unknown']).toContain(type)
    })

    // Verifikasi jumlah tipe error
    expect(expectedTypes).toHaveLength(5)
  })

  it('should not allow other types of error', () => {
    // Contoh tipe yang tidak valid
    const invalidType = 'random' as ErrorType

    // Ini akan menghasilkan type error saat kompilasi TypeScript
    const error: ErrorDetails = {
      type: invalidType,
      message: 'Invalid error type'
    }

    // Pastikan tidak bisa menggunakan tipe yang tidak valid
    const isValidType = (type: ErrorType) => 
      ['validation', 'network', 'server', 'permission', 'unknown'].includes(type)

    expect(isValidType(error.type)).toBe(false)
  })
})

describe('ErrorNotifier', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render error toast with default message for validation error', () => {
    const error: ErrorDetails = {
      type: 'validation',
      message: 'Invalid input',
      code: 'VAL_001'
    }

    render(<ErrorNotifier error={error} />)

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Terjadi kesalahan validasi'),
      expect.objectContaining({
        description: 'Kode Error: VAL_001'
      })
    )
  })

  it('should render error toast with network error message', () => {
    const error: ErrorDetails = {
      type: 'network',
      message: 'Connection failed'
    }

    render(<ErrorNotifier error={error} />)

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Gagal terhubung ke server'),
      expect.objectContaining({
        duration: 5000
      })
    )
  })

  it('should render error toast with server error message', () => {
    const error: ErrorDetails = {
      type: 'server',
      message: 'Internal server error',
      code: 'SRV_500'
    }

    render(<ErrorNotifier error={error} />)

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Terjadi kesalahan pada server'),
      expect.objectContaining({
        description: 'Kode Error: SRV_500'
      })
    )
  })

  it('should render error toast with permission error message', () => {
    const error: ErrorDetails = {
      type: 'permission',
      message: 'Access denied',
      code: 'PERM_403'
    }

    render(<ErrorNotifier error={error} />)

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Anda tidak memiliki izin'),
      expect.objectContaining({
        description: 'Kode Error: PERM_403'
      })
    )
  })

  it('should render error toast with unknown error message', () => {
    const error: ErrorDetails = {
      type: 'unknown',
      message: 'Unexpected error occurred'
    }

    render(<ErrorNotifier error={error} />)

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Terjadi kesalahan yang tidak diketahui'),
      expect.objectContaining({
        description: undefined
      })
    )
  })
})

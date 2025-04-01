import React from 'react'
import { render, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useModuleMutation } from '../../hooks/useModuleMutation'
import {
  createModule,
  updateModule,
  deleteModule,
} from '../../services/moduleClientService'
import { ModuleStatus } from '../../types'
import { handleError } from '../../components/ErrorNotifier/ErrorNotifier'

// Mock dependencies
jest.mock('sonner', () => {
  const originalModule = jest.requireActual('sonner')
  return {
    ...originalModule,
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    },
  }
})

jest.mock('../../services/moduleClientService', () => ({
  createModule: jest.fn(),
  updateModule: jest.fn(),
  deleteModule: jest.fn(),
}))

// Komponen wrapper untuk testing hook
function TestComponent() {
  const { createModuleMutation, updateModuleMutation, deleteModuleMutation } =
    useModuleMutation()

  // Gunakan useRef untuk memastikan effect hanya dijalankan sekali
  const hasRun = React.useRef(false)

  React.useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    // Simulasi error pada setiap operasi
    createModuleMutation.mutate({
      title: 'Test Module',
      description: 'Test Description',
      status: ModuleStatus.DRAFT,
    })

    updateModuleMutation.mutate({
      id: '1',
      title: 'Updated Module',
      status: ModuleStatus.ACTIVE,
    })

    deleteModuleMutation.mutate('1')
  }, [createModuleMutation, updateModuleMutation, deleteModuleMutation])

  return null
}

describe('Module Mutation Error Handling', () => {
  let queryClient: QueryClient
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    // Atur environment ke test untuk menghindari console.error
    process.env.NODE_ENV = 'test'

    // Reset semua mock
    jest.clearAllMocks()

    // Konfigurasi QueryClient dengan retry dinonaktifkan
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          // Nonaktifkan refetch
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchOnMount: false,
        },
        mutations: {
          // Nonaktifkan retry untuk mutation
          retry: false,
        },
      },
    })

    // Ganti implementasi mock console.error sepenuhnya
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Tidak melakukan apa-apa (silent)
    })

    // Mock implementasi untuk menghasilkan error
    ;(createModule as jest.Mock).mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Validation Error' },
      },
    })
    ;(updateModule as jest.Mock).mockRejectedValue({
      response: {
        status: 403,
        data: { message: 'Permission Denied' },
      },
    })
    ;(deleteModule as jest.Mock).mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Server Error' },
      },
    })
  })

  afterEach(() => {
    // Kembalikan environment ke default
    process.env.NODE_ENV = 'development'

    // Restore console.error
    consoleSpy.mockRestore()
  })

  it('should handle and log errors for module operations', async () => {
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )
    })

    // Tunggu sebentar untuk memastikan semua mutation selesai
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Verifikasi error handling untuk create
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Terjadi kesalahan validasi'),
      expect.objectContaining({
        description: expect.stringContaining('HTTP_400'),
      })
    )

    // Verifikasi error handling untuk update
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Akses ditolak'),
      expect.objectContaining({
        description: expect.stringContaining('HTTP_403'),
      })
    )

    // Verifikasi error handling untuk delete
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Masalah pada server'),
      expect.objectContaining({
        description: expect.stringContaining('HTTP_500'),
      })
    )
  })

  // Tambahan test untuk memverifikasi handleError
  it('should correctly map error types', () => {
    const validationError = handleError({
      response: {
        status: 400,
        data: { message: 'Validation Error' },
      },
    })
    expect(validationError.type).toBe('validation')

    const permissionError = handleError({
      response: {
        status: 403,
        data: { message: 'Permission Denied' },
      },
    })
    expect(permissionError.type).toBe('permission')

    const serverError = handleError({
      response: {
        status: 500,
        data: { message: 'Server Error' },
      },
    })
    expect(serverError.type).toBe('server')
  })
})

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useModuleMutation,
  CreateModuleInput,
  UpdateModuleInput,
} from './useModuleMutation'
import * as moduleClientService from '../services/moduleClientService'
import { ReactNode } from 'react'
import { Module, ModuleStatus } from '../types'
import { toast } from 'sonner'

// Mock moduleClientService
jest.mock('../services/moduleClientService')
const mockedModuleClientService = moduleClientService as jest.Mocked<
  typeof moduleClientService
>

// Mock ErrorNotifier dan toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock console.error untuk mencegah log dalam test
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('useModuleMutation', () => {
  // Setup mock data
  const mockModule: Module = {
    id: '1',
    title: 'Module 1',
    description: 'Description 1',
    status: ModuleStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user1',
    updatedBy: 'user1',
  }

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Create a wrapper for React Query
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    Wrapper.displayName = 'QueryClientWrapper'

    return Wrapper
  }

  describe('createModuleMutation', () => {
    beforeEach(() => {
      mockedModuleClientService.createModule.mockResolvedValue(mockModule)
    })

    it('should call createModule with correct data', async () => {
      // Arrange
      const wrapper = createWrapper()
      const newModule: CreateModuleInput = {
        title: 'New Module',
        description: 'New Description',
        status: ModuleStatus.DRAFT,
      }

      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })

      // Assert
      expect(result.current.createModuleMutation).toBeDefined()

      // Call the mutation
      result.current.createModuleMutation.mutate(newModule)

      // Tunggu service dipanggil, bukan lagi menunggu isSuccess
      await waitFor(() =>
        expect(mockedModuleClientService.createModule).toHaveBeenCalledTimes(1)
      )

      // Check if the service was called with correct data
      expect(mockedModuleClientService.createModule).toHaveBeenCalledWith(
        newModule
      )

      // Verifikasi toast dipanggil setelah sukses
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Modul berhasil dibuat')
      )
    })

    it('should handle errors when creating module', async () => {
      // Arrange
      const wrapper = createWrapper()
      const error = {
        response: {
          status: 400,
          data: { message: 'Validation Error' },
        },
      }
      mockedModuleClientService.createModule.mockRejectedValue(error)

      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })

      // Call the mutation
      result.current.createModuleMutation.mutate({
        title: 'Test Module',
        description: 'Test Description',
        status: ModuleStatus.DRAFT,
      })

      // Tunggu service dipanggil dan error ditangani
      await waitFor(() => expect(toast.error).toHaveBeenCalled())

      // Verifikasi pesan error yang benar ditampilkan
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Terjadi kesalahan validasi'),
        expect.objectContaining({
          description: expect.stringContaining('HTTP_400'),
        })
      )
    })
  })

  describe('updateModuleMutation', () => {
    beforeEach(() => {
      mockedModuleClientService.updateModule.mockResolvedValue(mockModule)
    })

    it('should call updateModule with correct data', async () => {
      // Arrange
      const wrapper = createWrapper()
      const updateData: UpdateModuleInput = {
        id: '1',
        title: 'Updated Module',
        description: 'Updated Description',
        status: ModuleStatus.ACTIVE,
      }

      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })

      // Call the mutation
      result.current.updateModuleMutation.mutate(updateData)

      // Tunggu service dipanggil, bukan lagi menunggu isSuccess
      await waitFor(() =>
        expect(mockedModuleClientService.updateModule).toHaveBeenCalledTimes(1)
      )

      // Check if the service was called with correct data
      expect(mockedModuleClientService.updateModule).toHaveBeenCalledWith('1', {
        title: 'Updated Module',
        description: 'Updated Description',
        status: ModuleStatus.ACTIVE,
      })

      // Verifikasi toast dipanggil setelah sukses
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Modul berhasil diperbarui')
      )
    })
  })

  describe('deleteModuleMutation', () => {
    beforeEach(() => {
      mockedModuleClientService.deleteModule.mockResolvedValue(undefined)
    })

    it('should call deleteModule with correct id', async () => {
      // Arrange
      const wrapper = createWrapper()
      const moduleId = '1'

      // Act
      const { result } = renderHook(() => useModuleMutation(), { wrapper })

      // Call the mutation
      result.current.deleteModuleMutation.mutate(moduleId)

      // Tunggu service dipanggil, bukan lagi menunggu isSuccess
      await waitFor(() =>
        expect(mockedModuleClientService.deleteModule).toHaveBeenCalledTimes(1)
      )

      // Check if the service was called with correct id
      expect(mockedModuleClientService.deleteModule).toHaveBeenCalledWith(
        moduleId
      )

      // Verifikasi toast dipanggil setelah sukses
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Modul berhasil dihapus')
      )
    })
  })
})

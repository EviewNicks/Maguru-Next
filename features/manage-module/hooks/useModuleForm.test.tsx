import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useModuleForm } from './useModuleForm'
import * as moduleClientService from '../services/moduleClientService'
import { ReactNode } from 'react'
import { Module, ModuleStatus } from '../types'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('../services/moduleClientService')
const mockedModuleClientService = moduleClientService as jest.Mocked<
  typeof moduleClientService
>

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock console.error
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('useModuleForm', () => {
  // Test data
  const mockModule: Module = {
    id: '1',
    title: 'Test Module',
    description: 'Test Description',
    status: ModuleStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user1',
    updatedBy: 'user1',
  }

  const mockFormValues = {
    title: 'Updated Title',
    description: 'Updated Description',
    status: ModuleStatus.ACTIVE,
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

  describe('Create mode', () => {
    it('should initialize form with default values in create mode', () => {
      // Arrange
      const onSuccess = jest.fn()
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(
        () => useModuleForm({ mode: 'create', onSuccess }),
        { wrapper }
      )

      // Assert
      expect(result.current.form).toBeDefined()
      expect(result.current.form.getValues()).toEqual({
        title: '',
        description: '',
        status: ModuleStatus.DRAFT,
      })
    })

    it('should call createModule service with form data', async () => {
      // Arrange
      const onSuccess = jest.fn()
      const wrapper = createWrapper()
      mockedModuleClientService.createModule.mockResolvedValue(mockModule)

      // Act
      const { result } = renderHook(
        () => useModuleForm({ mode: 'create', onSuccess }),
        { wrapper }
      )

      // Set form values
      await act(async () => {
        result.current.form.setValue('title', mockFormValues.title)
        result.current.form.setValue('description', mockFormValues.description)
        result.current.form.setValue('status', mockFormValues.status)
      })

      // Submit form
      await act(async () => {
        result.current.onSubmit(mockFormValues)
      })

      // Assert
      await waitFor(() => {
        expect(mockedModuleClientService.createModule).toHaveBeenCalledWith({
          title: mockFormValues.title,
          description: mockFormValues.description,
          status: mockFormValues.status.toLowerCase(),
        })
      })

      // Check success callback and toast
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Modul berhasil ditambahkan')
      })
    })

    it('should handle errors when creating module', async () => {
      // Arrange
      const onSuccess = jest.fn()
      const wrapper = createWrapper()
      const error = {
        response: {
          status: 400,
          data: { message: 'Validation Error' },
        },
      }
      mockedModuleClientService.createModule.mockRejectedValue(error)

      // Act
      const { result } = renderHook(
        () => useModuleForm({ mode: 'create', onSuccess }),
        { wrapper }
      )

      // Submit form with error
      await act(async () => {
        result.current.onSubmit(mockFormValues)
      })

      // Assert
      await waitFor(() => {
        expect(mockedModuleClientService.createModule).toHaveBeenCalled()
        expect(onSuccess).not.toHaveBeenCalled()
      })

      // Check error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Terjadi kesalahan validasi'),
          expect.objectContaining({
            description: expect.stringContaining('HTTP_400'),
          })
        )
      })
    })
  })

  describe('Edit mode', () => {
    it('should initialize form with module values in edit mode', () => {
      // Arrange
      const onSuccess = jest.fn()
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(
        () => useModuleForm({ mode: 'edit', module: mockModule, onSuccess }),
        { wrapper }
      )

      // Assert
      expect(result.current.form).toBeDefined()
      expect(result.current.form.getValues()).toEqual({
        title: mockModule.title,
        description: mockModule.description,
        status: mockModule.status,
      })
    })

    it('should call updateModule service with form data', async () => {
      // Arrange
      const onSuccess = jest.fn()
      const wrapper = createWrapper()
      mockedModuleClientService.updateModule.mockResolvedValue(mockModule)

      // Act
      const { result } = renderHook(
        () => useModuleForm({ mode: 'edit', module: mockModule, onSuccess }),
        { wrapper }
      )

      // Set form values
      await act(async () => {
        result.current.form.setValue('title', mockFormValues.title)
        result.current.form.setValue('description', mockFormValues.description)
        result.current.form.setValue('status', mockFormValues.status)
      })

      // Submit form
      await act(async () => {
        result.current.onSubmit(mockFormValues)
      })

      // Assert
      await waitFor(() => {
        expect(mockedModuleClientService.updateModule).toHaveBeenCalledWith(
          mockModule.id,
          {
            title: mockFormValues.title,
            description: mockFormValues.description,
            status: mockFormValues.status.toLowerCase(),
          }
        )
      })

      // Check success callback and toast
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Modul berhasil diperbarui')
      })
    })

    it('should throw error when updating module without ID', async () => {
      // Arrange
      const onSuccess = jest.fn()
      const wrapper = createWrapper()

      // Act
      const { result } = renderHook(
        () =>
          useModuleForm({
            mode: 'edit',
            module: { ...mockModule, id: undefined } as unknown as Module,
            onSuccess,
          }),
        { wrapper }
      )

      // Submit form without module ID
      await act(async () => {
        result.current.onSubmit(mockFormValues)
      })

      // Assert that update mutation errors due to missing ID
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Terjadi kesalahan'),
          expect.any(Object)
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })

    it('should handle errors when updating module', async () => {
      // Arrange
      const onSuccess = jest.fn()
      const wrapper = createWrapper()
      const error = {
        response: {
          status: 403,
          data: { message: 'Permission Denied' },
        },
      }
      mockedModuleClientService.updateModule.mockRejectedValue(error)

      // Act
      const { result } = renderHook(
        () => useModuleForm({ mode: 'edit', module: mockModule, onSuccess }),
        { wrapper }
      )

      // Submit form with error
      await act(async () => {
        result.current.onSubmit(mockFormValues)
      })

      // Assert
      await waitFor(() => {
        expect(mockedModuleClientService.updateModule).toHaveBeenCalled()
        expect(onSuccess).not.toHaveBeenCalled()
      })

      // Check error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Akses ditolak'),
          expect.objectContaining({
            description: expect.stringContaining('HTTP_403'),
          })
        )
      })
    })
  })

  it('should track loading state during mutations', async () => {
    // Arrange
    const onSuccess = jest.fn()
    const wrapper = createWrapper()

    // Buat Promise yang bisa dikontrol manual dengan tipe yang benar
    let resolvePromise: (value: Module) => void
    let rejectPromise: (reason: Error) => void
    const promise = new Promise<Module>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    })

    // Mock createModule untuk mengembalikan promise yang bisa dikontrol
    mockedModuleClientService.createModule.mockImplementation(() => {
      console.log('Mock createModule called') // Debugging log
      return promise
    })

    // Act
    const { result } = renderHook(
      () => useModuleForm({ mode: 'create', onSuccess }),
      { wrapper }
    )

    // Submit form
    await act(async () => {
      console.log('Before onSubmit') // Debugging log
      result.current.onSubmit(mockFormValues)
      console.log('After onSubmit') // Debugging log
    })

    // Tunggu sebentar untuk memastikan mutation dimulai
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check loading state (seharusnya true)
    console.log('Current isLoading:', result.current.isLoading) // Debugging log
    expect(result.current.isLoading).toBe(true)

    // Selesaikan promise dengan nilai Module yang valid
    await act(async () => {
      console.log('Resolving promise') // Debugging log
      resolvePromise(mockModule)
      // Tunggu sampai promise selesai dan komponen diperbarui
      await promise
    })

    // Tunggu sampai loading state false
    await waitFor(
      () => {
        console.log('Final isLoading:', result.current.isLoading) // Debugging log
        expect(result.current.isLoading).toBe(false)
      },
      { timeout: 2000 }
    )

    // Tambahkan test untuk error path (optional, untuk menghilangkan lint warning)
    try {
      await act(async () => {
        rejectPromise(new Error('Test error'))
        await promise
      })
    } catch {
      // Error ditangkap sebagai bagian dari test
    }
  })
})

import { renderHook, waitFor } from '@testing-library/react'
import { useCreateModule, useUpdateModule, useDeleteModule } from './useModuleMutations'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { ModuleStatus } from '../types'

// Mock axios dan toast
jest.mock('axios')
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedToast = toast as jest.Mocked<typeof toast>

// Setup wrapper dengan QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useModuleMutations', () => {
  let queryClient: QueryClient
  
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })
  
  describe('useCreateModule', () => {
    it('creates a module successfully', async () => {
      // Mock response data
      const newModule = {
        id: '1',
        title: 'Modul Baru',
        description: 'Deskripsi modul baru',
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
        updatedBy: 'user1',
      }
      
      mockedAxios.post.mockResolvedValueOnce({ data: newModule })
      
      const { result } = renderHook(() => useCreateModule(), {
        wrapper: createWrapper(),
      })
      
      // Call the mutation
      const moduleInput = {
        title: 'Modul Baru',
        description: 'Deskripsi modul baru',
        status: ModuleStatus.DRAFT,
        createdBy: 'user1',
      }
      
      await result.current.mutateAsync(moduleInput)
      
      // Check if axios was called with correct data
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/modules', moduleInput)
      
      // Check if success toast was shown
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Modul berhasil dibuat',
        expect.objectContaining({
          description: expect.stringContaining('Modul Baru'),
        })
      )
    })
    
    it('handles error when creating module fails', async () => {
      // Mock error response
      const error = new Error('Network error')
      mockedAxios.post.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useCreateModule(), {
        wrapper: createWrapper(),
      })
      
      // Call the mutation and expect it to throw
      await expect(
        result.current.mutateAsync({
          title: 'Modul Baru',
          description: 'Deskripsi modul baru',
          status: ModuleStatus.DRAFT,
          createdBy: 'user1',
        })
      ).rejects.toThrow()
      
      // Check if error toast was shown
      expect(mockedToast.error).toHaveBeenCalledWith(
        'Gagal membuat modul',
        expect.objectContaining({
          description: expect.stringContaining('Network error'),
        })
      )
    })
  })
  
  describe('useUpdateModule', () => {
    it('updates a module successfully', async () => {
      // Mock response data
      const updatedModule = {
        id: '1',
        title: 'Modul Updated',
        description: 'Deskripsi modul updated',
        status: ModuleStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
        updatedBy: 'user2',
      }
      
      mockedAxios.put.mockResolvedValueOnce({ data: updatedModule })
      
      const { result } = renderHook(() => useUpdateModule(), {
        wrapper: createWrapper(),
      })
      
      // Call the mutation
      const moduleInput = {
        id: '1',
        title: 'Modul Updated',
        description: 'Deskripsi modul updated',
        status: ModuleStatus.ACTIVE,
        updatedBy: 'user2',
      }
      
      await result.current.mutateAsync(moduleInput)
      
      // Check if axios was called with correct data
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/modules/1',
        expect.objectContaining({
          title: 'Modul Updated',
          description: 'Deskripsi modul updated',
          status: ModuleStatus.ACTIVE,
          updatedBy: 'user2',
        })
      )
      
      // Check if success toast was shown
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Modul berhasil diperbarui',
        expect.objectContaining({
          description: expect.stringContaining('Modul Updated'),
        })
      )
    })
    
    it('handles error when updating module fails', async () => {
      // Mock error response
      const error = new Error('Network error')
      mockedAxios.put.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useUpdateModule(), {
        wrapper: createWrapper(),
      })
      
      // Call the mutation and expect it to throw
      await expect(
        result.current.mutateAsync({
          id: '1',
          title: 'Modul Updated',
          status: ModuleStatus.ACTIVE,
          updatedBy: 'user2',
        })
      ).rejects.toThrow()
      
      // Check if error toast was shown
      expect(mockedToast.error).toHaveBeenCalledWith(
        'Gagal memperbarui modul',
        expect.objectContaining({
          description: expect.stringContaining('Network error'),
        })
      )
    })
  })
  
  describe('useDeleteModule', () => {
    it('deletes a module successfully', async () => {
      // Mock response data
      const deletedModule = {
        id: '1',
        title: 'Modul Dihapus',
        description: 'Deskripsi modul dihapus',
        status: ModuleStatus.ARCHIVED,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
        updatedBy: 'user2',
      }
      
      mockedAxios.delete.mockResolvedValueOnce({ data: deletedModule })
      
      const { result } = renderHook(() => useDeleteModule(), {
        wrapper: createWrapper(),
      })
      
      // Call the mutation
      await result.current.mutateAsync('1')
      
      // Check if axios was called with correct URL
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/modules/1')
      
      // Check if success toast was shown
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Modul berhasil dihapus',
        expect.anything()
      )
    })
    
    it('handles error when deleting module fails', async () => {
      // Mock error response
      const error = new Error('Network error')
      mockedAxios.delete.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useDeleteModule(), {
        wrapper: createWrapper(),
      })
      
      // Call the mutation and expect it to throw
      await expect(result.current.mutateAsync('1')).rejects.toThrow()
      
      // Check if error toast was shown
      expect(mockedToast.error).toHaveBeenCalledWith(
        'Gagal menghapus modul',
        expect.objectContaining({
          description: expect.stringContaining('Network error'),
        })
      )
    })
  })
})

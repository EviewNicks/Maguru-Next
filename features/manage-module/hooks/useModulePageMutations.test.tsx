// features/manage-module/hooks/useModulePageMutations.test.tsx
import { renderHook} from '@testing-library/react'
import { 
  useCreateModulePage, 
  useUpdateModulePage, 
  useDeleteModulePage,
  useReorderModulePages
} from './useModulePageMutations'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'
import React from 'react'

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

describe('useModulePageMutations', () => {
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
  
  // Wrapper untuk React Query
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  
  describe('useCreateModulePage', () => {
    it('creates a module page successfully', async () => {
      // Mock response data
      const newPage = {
        id: '1',
        moduleId: 'module-1',
        order: 1,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockedAxios.post.mockResolvedValueOnce({ data: newPage })
      
      const { result } = renderHook(() => useCreateModulePage('module-1'), {
        wrapper,
      })
      
      // Call the mutation
      const pageInput = {
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
      }
      
      await result.current.mutateAsync(pageInput)
      
      // Verify API call
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/modules/module-1/pages',
        pageInput
      )
      
      // Verify toast
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Halaman berhasil dibuat',
        expect.any(Object)
      )
    })
    
    it('handles create error', async () => {
      // Mock error
      const error = new Error('API Error')
      mockedAxios.post.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useCreateModulePage('module-1'), {
        wrapper,
      })
      
      // Call the mutation and expect it to throw
      await expect(
        result.current.mutateAsync({
          type: ModulePageType.TEORI,
          content: '<p>Konten teori</p>',
        })
      ).rejects.toThrow()
      
      // Verify toast
      expect(mockedToast.error).toHaveBeenCalledWith(
        'Gagal membuat halaman',
        expect.any(Object)
      )
    })
  })
  
  describe('useUpdateModulePage', () => {
    it('updates a module page successfully', async () => {
      // Mock response data
      const updatedPage = {
        id: '1',
        moduleId: 'module-1',
        order: 1,
        type: ModulePageType.TEORI,
        content: '<p>Konten teori yang diperbarui</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockedAxios.put.mockResolvedValueOnce({ data: updatedPage })
      
      const { result } = renderHook(() => useUpdateModulePage('module-1'), {
        wrapper,
      })
      
      // Call the mutation
      const pageInput = {
        id: '1',
        moduleId: 'module-1',
        type: ModulePageType.TEORI,
        content: '<p>Konten teori yang diperbarui</p>',
      }
      
      await result.current.mutateAsync(pageInput)
      
      // Verify API call
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/modules/module-1/pages/1',
        pageInput
      )
      
      // Verify toast
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Halaman berhasil diperbarui',
        expect.any(Object)
      )
    })
    
    it('handles update error', async () => {
      // Mock error
      const error = new Error('API Error')
      mockedAxios.put.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useUpdateModulePage('module-1'), {
        wrapper,
      })
      
      // Call the mutation and expect it to throw
      await expect(
        result.current.mutateAsync({
          id: '1',
          moduleId: 'module-1',
          type: ModulePageType.TEORI,
          content: '<p>Konten teori yang diperbarui</p>',
        })
      ).rejects.toThrow()
      
      // Verify toast
      expect(mockedToast.error).toHaveBeenCalledWith(
        'Gagal memperbarui halaman',
        expect.any(Object)
      )
    })
  })
  
  describe('useDeleteModulePage', () => {
    it('deletes a module page successfully', async () => {
      // Mock response data
      mockedAxios.delete.mockResolvedValueOnce({ data: {} })
      
      const { result } = renderHook(() => useDeleteModulePage('module-1'), {
        wrapper,
      })
      
      // Call the mutation
      await result.current.mutateAsync('1')
      
      // Verify API call
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/modules/module-1/pages/1'
      )
      
      // Verify toast
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Halaman berhasil dihapus',
        expect.any(Object)
      )
    })
    
    it('handles delete error', async () => {
      // Mock error
      const error = new Error('API Error')
      mockedAxios.delete.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useDeleteModulePage('module-1'), {
        wrapper,
      })
      
      // Call the mutation and expect it to throw
      await expect(result.current.mutateAsync('1')).rejects.toThrow()
      
      // Verify toast
      expect(mockedToast.error).toHaveBeenCalledWith(
        'Gagal menghapus halaman',
        expect.any(Object)
      )
    })
  })
  
  describe('useReorderModulePages', () => {
    it('reorders module pages successfully', async () => {
      // Mock response data
      mockedAxios.patch.mockResolvedValueOnce({ data: {} })
      
      const { result } = renderHook(() => useReorderModulePages('module-1'), {
        wrapper,
      })
      
      // Call the mutation
      const reorderInput = [
        { pageId: '1', order: 2 },
        { pageId: '2', order: 1 },
      ]
      
      await result.current.mutateAsync(reorderInput)
      
      // Verify API call
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/modules/module-1/pages/reorder',
        { updates: reorderInput }
      )
      
      // Verify toast
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Urutan halaman berhasil diperbarui',
        expect.any(Object)
      )
    })
    
    it('handles reorder error', async () => {
      // Mock error
      const error = new Error('API Error')
      mockedAxios.patch.mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useReorderModulePages('module-1'), {
        wrapper,
      })
      
      // Call the mutation and expect it to throw
      const reorderInput = [
        { pageId: '1', order: 2 },
        { pageId: '2', order: 1 },
      ]
      
      await expect(result.current.mutateAsync(reorderInput)).rejects.toThrow()
      
      // Verify toast
      expect(mockedToast.error).toHaveBeenCalledWith(
        'Gagal memperbarui urutan halaman',
        expect.any(Object)
      )
    })
  })
})

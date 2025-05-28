'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moduleAdapter } from '../adapters/moduleAdapter'
import {
  Module,
  CreateModuleInput,
  UpdateModuleInput,
  ModuleStatus,
  ApiListResponse,
  // ApiEntityResponse,
} from '../types'
import { logger } from '../services/logger'
import { toast } from 'sonner'

// Konstanta untuk hook name (logging)
const HOOK = 'useModuleData'

// Interface untuk parameter query
export interface ModuleQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: ModuleStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  moduleId?: string
}

/**
 * Custom hook untuk mengelola data modul dengan React Query
 * Hook ini menyediakan fungsi-fungsi untuk query dan mutasi data sebagai satu-satunya
 * entry point ke moduleAdapter
 *
 * @param params - Parameter untuk pagination, sorting, pencarian, dan filter
 * @returns Object dengan queries dan mutations untuk mengelola data modul
 */
export function useModuleData(params: ModuleQueryParams = {}) {
  const queryClient = useQueryClient()

  // Default values untuk parameter
  const queryParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    search: params.search || '',
    status: params.status,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
  }

  // Query untuk daftar modul
  const {
    data: modulesData,
    isLoading: isModulesLoading,
    error: modulesError,
  } = useQuery({
    queryKey: ['modules', queryParams],
    queryFn: () => moduleAdapter.getModules(queryParams),
    staleTime: 1000 * 60 * 5, // 5 menit
    refetchOnWindowFocus: false,
  })

  // Query untuk detail modul berdasarkan ID
  const {
    data: moduleData,
    isLoading: isModuleLoading,
    error: moduleError,
  } = useQuery({
    queryKey: ['module', params.moduleId],
    queryFn: () => moduleAdapter.getModuleById(params.moduleId as string),
    staleTime: 1000 * 60 * 5, // 5 menit
    refetchOnWindowFocus: false,
    enabled: !!params.moduleId, // Hanya jalankan query jika moduleId tersedia
  })

  // Mutation untuk membuat modul baru
  const createModuleMutation = useMutation({
    mutationFn: async (data: CreateModuleInput) => {
      // Gunakan userId dummy untuk sementara
      // TODO: Gunakan userId yang sebenarnya dari auth context
      const userId = 'dummy-user-id'
      return moduleAdapter.createModule(data, userId)
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar modul
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Modul berhasil dibuat')
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      logger.error(`${HOOK}: Error creating module:`, error)
      toast.error('Gagal membuat modul', {
        description: error.message || 'Terjadi kesalahan saat membuat modul',
      })
    },
  })

  // Mutation untuk memperbarui modul
  const updateModuleMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateModuleInput
    }) => {
      // Gunakan userId dummy untuk sementara
      // TODO: Gunakan userId yang sebenarnya dari auth context
      const userId = 'dummy-user-id'
      return moduleAdapter.updateModule(id, data, userId)
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar modul
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['module', params.moduleId] })
      toast.success('Modul berhasil diperbarui')
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      logger.error(`${HOOK}: Error updating module:`, error)
      toast.error('Gagal memperbarui modul', {
        description:
          error.message || 'Terjadi kesalahan saat memperbarui modul',
      })
    },
  })

  // Mutation untuk menghapus modul
  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => moduleAdapter.deleteModule(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modules'] })

      // Snapshot the previous value
      const previousModules = queryClient.getQueryData(['modules'])

      // Optimistically update to the new value
      queryClient.setQueryData(
        ['modules'],
        (old: ApiListResponse<Module> | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((module) => module.id !== deletedId),
          }
        }
      )

      // Return a context object with the snapshot value
      return { previousModules }
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar modul
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Modul berhasil dihapus')
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any, _deletedId, context) => {
      logger.error(`${HOOK}: Error deleting module:`, error)
      toast.error('Gagal menghapus modul', {
        description: error.message || 'Terjadi kesalahan saat menghapus modul',
      })

      // Rollback optimistic update jika terjadi error
      if (context?.previousModules) {
        queryClient.setQueryData(['modules'], context.previousModules)
      }
    },
  })

  // Mutation untuk memperbarui status modul
  const updateModuleStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: ModuleStatus
    }) => {
      // Gunakan userId dummy untuk sementara
      // TODO: Gunakan userId yang sebenarnya dari auth context
      const userId = 'dummy-user-id'
      return moduleAdapter.updateModuleStatus(id, status, userId)
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar modul
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['module', params.moduleId] })
      toast.success('Status modul berhasil diperbarui')
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      logger.error(`${HOOK}: Error updating module status:`, error)
      toast.error('Gagal memperbarui status modul', {
        description:
          error.message || 'Terjadi kesalahan saat memperbarui status modul',
      })
    },
  })

  // Fungsi wrapper untuk membuat modul baru
  const createModule = async (
    data: CreateModuleInput
  ): Promise<Module | null> => {
    try {
      const result = await createModuleMutation.mutateAsync(data)
      return result.data
    } catch {
      return null
    }
  }

  // Fungsi wrapper untuk memperbarui modul
  const updateModule = async (
    id: string,
    data: UpdateModuleInput
  ): Promise<Module | null> => {
    try {
      const result = await updateModuleMutation.mutateAsync({ id, data })
      return result.data
    } catch {
      return null
    }
  }

  // Fungsi wrapper untuk menghapus modul
  const deleteModule = async (id: string): Promise<boolean> => {
    try {
      await deleteModuleMutation.mutateAsync(id)
      return true
    } catch {
      return false
    }
  }

  // Fungsi wrapper untuk memperbarui status modul
  const updateModuleStatus = async (
    id: string,
    status: ModuleStatus
  ): Promise<Module | null> => {
    try {
      const result = await updateModuleStatusMutation.mutateAsync({
        id,
        status,
      })
      return result?.data || null
    } catch {
      return null
    }
  }

  return {
    // Data dari queries
    modules: modulesData?.data || [],
    module: moduleData?.data || null,
    isLoading: isModulesLoading || isModuleLoading,
    error: modulesError || moduleError,
    totalPages: modulesData?.meta?.totalPages || 0,
    totalItems: modulesData?.meta?.totalItems || 0,

    // Fungsi CRUD
    createModule,
    updateModule,
    deleteModule,
    updateModuleStatus,

    // Raw mutations (untuk kasus khusus)
    createModuleMutation,
    updateModuleMutation,
    deleteModuleMutation,
    updateModuleStatusMutation,
  }
}

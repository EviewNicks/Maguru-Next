'use client'

import { useQuery } from '@tanstack/react-query'
import { getModules, getModuleById } from '../services/moduleService'
import { ModuleStatus } from '../types'

interface QueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: ModuleStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | ''
  moduleId?: string
}

/**
 * Hook untuk mengambil data modul dari API
 * @param params Parameter untuk pagination, sorting, pencarian, dan filter
 * @returns Object berisi query untuk list dan detail modul
 */
export function useModuleQuery(params: QueryParams = {}) {
  const queryParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    search: params.search || '',
    status: params.status,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
  }

  // Query untuk daftar modul
  const useModuleListQuery = useQuery({
    queryKey: ['modules', queryParams],
    queryFn: () => getModules(queryParams),
    staleTime: 1000 * 60 * 5, // 5 menit
    refetchOnWindowFocus: false,
  })

  // Query untuk detail modul berdasarkan ID
  const useModuleDetailQuery = useQuery({
    queryKey: ['module', params.moduleId],
    queryFn: () => getModuleById(params.moduleId as string),
    staleTime: 1000 * 60 * 5, // 5 menit
    refetchOnWindowFocus: false,
    enabled: !!params.moduleId, // Hanya jalankan query jika moduleId tersedia
  })

  return {
    useModuleListQuery,
    useModuleDetailQuery,
  }
}

// Ekspor QueryParams
export type { QueryParams }

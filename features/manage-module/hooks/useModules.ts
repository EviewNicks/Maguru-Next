import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Module, ModuleStatus } from '../types'

interface ModulesResponse {
  modules: Module[]
  pagination: {
    count: number
    hasMore: boolean
    nextCursor?: string
  }
}

interface UseModulesOptions {
  status?: ModuleStatus | 'ALL'
  search?: string
  limit?: number
  cursor?: string
}

/**
 * Hook untuk mengambil data modul dari API
 * Mendukung pagination, filtering, dan pencarian
 *
 * @param options - Opsi untuk query modules
 * @returns Data modul, status loading, dan error
 */
export function useModules(options: UseModulesOptions = {}) {
  const { status, search, limit = 10, cursor } = options

  return useInfiniteQuery<ModulesResponse>({
    queryKey: ['modules', { status, search, limit, cursor }],
    queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
      // Bangun URL dengan query params
      const params = new URLSearchParams()

      // Hanya tambahkan parameter status jika bukan 'ALL'
      if (status && status !== 'ALL') {
        params.append('status', status)
      }

      if (search) {
        params.append('search', search)
      }

      if (limit) {
        params.append('limit', limit.toString())
      }

      if (typeof pageParam === 'string') {
        params.append('cursor', pageParam)
      }

      const response = await axios.get(`/api/modules?${params.toString()}`)
      return response.data
    },
    staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    initialPageParam: cursor || undefined, // Menangani nilai cursor yang mungkin tidak ada
  })
}

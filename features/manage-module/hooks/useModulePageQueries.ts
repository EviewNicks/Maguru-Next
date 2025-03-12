// features/manage-module/hooks/useModulePageQueries.ts
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ModulePage } from '../types'

/**
 * Hook untuk mengambil daftar halaman modul
 * @param moduleId - ID modul
 */
export function useModulePages(moduleId: string) {
  return useQuery({
    queryKey: ['modulePages', moduleId],
    queryFn: async () => {
      const response = await axios.get<{ pages: ModulePage[] }>(
        `/api/modules/${moduleId}/pages`
      )
      return response.data.pages
    },
    enabled: !!moduleId, // Hanya jalankan query jika moduleId ada
  })
}

/**
 * Hook untuk mengambil detail halaman modul
 * @param moduleId - ID modul
 * @param pageId - ID halaman
 */
export function useModulePage(moduleId: string, pageId: string) {
  return useQuery({
    queryKey: ['modulePage', moduleId, pageId],
    queryFn: async () => {
      const response = await axios.get<ModulePage>(
        `/api/modules/${moduleId}/pages/${pageId}`
      )
      return response.data
    },
    enabled: !!moduleId && !!pageId, // Hanya jalankan query jika moduleId dan pageId ada
  })
}

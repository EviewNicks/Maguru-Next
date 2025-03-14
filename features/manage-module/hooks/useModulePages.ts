import { useQuery } from '@tanstack/react-query'
import { ModulePage } from '@prisma/client'

interface ModulePagesResponse {
  pages: ModulePage[]
}

async function fetchModulePages(moduleId: string): Promise<ModulePage[]> {
  const response = await fetch(`/api/modules/${moduleId}/pages`)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Gagal mengambil data halaman modul')
  }
  
  const data: ModulePagesResponse = await response.json()
  return data.pages
}

export function useModulePages(moduleId: string) {
  return useQuery({
    queryKey: ['modulePages', moduleId],
    queryFn: () => fetchModulePages(moduleId),
    staleTime: 1000 * 60 * 5, // 5 menit
  })
}

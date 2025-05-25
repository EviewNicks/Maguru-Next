import { useQuery } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'
import { ModulePage } from '../types/modulePageSchema'

export function useModulePageQuery(moduleId: string) {
  // Query untuk mendapatkan semua halaman dalam modul
  const getAllPages = useQuery({
    queryKey: ['modulePages', moduleId],
    queryFn: () => modulePageService.getModulePages(moduleId),
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 10 * 60 * 1000, // 10 menit
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
  })

  // Function helpers untuk mendapatkan halaman berikutnya atau sebelumnya
  const getAdjacentPages = (
    currentPageId: string
  ): {
    previousPage: ModulePage | null
    nextPage: ModulePage | null
  } => {
    const pages = getAllPages.data?.data || []

    if (!pages || pages.length === 0) {
      return { previousPage: null, nextPage: null }
    }

    const currentIndex = pages.findIndex((page) => page.id === currentPageId)
    if (currentIndex === -1) {
      return { previousPage: null, nextPage: null }
    }

    const previousPage = currentIndex > 0 ? pages[currentIndex - 1] : null
    const nextPage =
      currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null

    return { previousPage, nextPage }
  }

  return {
    getAllPages,
    getAdjacentPages,
  }
}

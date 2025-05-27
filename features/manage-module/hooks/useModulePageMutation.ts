import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modulePageAdapter } from '../adapters/modulePageAdapter'
import {
  CreateModulePageInput,
  UpdateModulePageInput,
  ModulePage,
  StandardEditorContent,
  IModulePageAdapter,
} from '../types'
import { logger } from '../services/logger'
import { toast } from 'sonner'

// Konstanta untuk hook name (logging)
const HOOK = 'useModulePageData'

/**
 * Custom hook untuk mengelola data module page dengan React Query
 * Hook ini menyediakan fungsi-fungsi untuk query dan mutasi data sebagai satu-satunya
 * entry point ke modulePageAdapter
 * 
 * @param moduleId - ID modul yang akan diakses datanya
 * @returns Object dengan queries dan mutations untuk mengelola data halaman modul
 */
export const useModulePageData = (moduleId: string) => {
  const queryClient = useQueryClient()
  const queryKey = ['modulePages', moduleId]

  // Query untuk mendapatkan semua halaman dari modul
  const pagesQuery = useQuery({
    queryKey,
    queryFn: () => modulePageAdapter.getPages(moduleId),
    staleTime: 60 * 1000, // 1 menit
  })

  // Query untuk mendapatkan semua halaman dalam modul (kompatibel dengan useModulePageQuery)
  const getAllPages = useQuery({
    queryKey,
    queryFn: () => modulePageAdapter.getPages(moduleId).then(pages => ({
      success: true,
      data: pages,
      meta: {
        currentPage: 1,
        pageSize: pages.length,
        totalItems: pages.length,
        totalPages: 1,
      }
    })),
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 10 * 60 * 1000, // 10 menit
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
  })

  // Function untuk mendapatkan halaman spesifik berdasarkan ID
  const getPage = async (pageId: string): Promise<ModulePage | null> => {
    try {
      logger.debug(HOOK, `Fetching page: ${pageId}`)
      return await modulePageAdapter.getPage(pageId)
    } catch (error) {
      logger.error(HOOK, `Error fetching page: ${pageId}`, error)
      return null
    }
  }

  // Function helper untuk mendapatkan halaman berikutnya atau sebelumnya
  const getAdjacentPages = (
    currentPageId: string
  ): {
    previousPage: ModulePage | null
    nextPage: ModulePage | null
  } => {
    const pages = pagesQuery.data || []

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

  // Mutation untuk membuat halaman baru
  const createPageMutation = useMutation({
    mutationFn: (data: CreateModulePageInput) =>
      modulePageAdapter.createPage(data),
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar halaman
      queryClient.invalidateQueries({ queryKey })
      toast.success('Halaman berhasil dibuat')
    },
    onError: (error) => {
      logger.error(HOOK, 'Error creating page', error)
      toast.error('Gagal membuat halaman. Silakan coba lagi.')
    },
  })

  // Mutation untuk memperbarui halaman
  const updatePageMutation = useMutation({
    mutationFn: ({
      pageId,
      data,
    }: {
      pageId: string
      data: UpdateModulePageInput
    }) => modulePageAdapter.updatePage(pageId, data),
    onSuccess: (data, variables) => {
      if (data) {
        // Update data di cache
        queryClient.setQueryData(['modulePage', variables.pageId], data)

        // Invalidate query untuk memperbarui daftar halaman
        queryClient.invalidateQueries({ queryKey })
        toast.success('Halaman berhasil diperbarui')
      }
    },
    onError: (error) => {
      logger.error(HOOK, 'Error updating page', error)
      toast.error('Gagal memperbarui halaman. Silakan coba lagi.')
    },
  })

  // Mutation untuk menyimpan konten editor
  const saveEditorContentMutation = useMutation({
    mutationFn: ({
      pageId,
      content,
    }: {
      pageId: string
      content: StandardEditorContent
    }) => modulePageAdapter.saveEditorContent(pageId, content),
    onSuccess: (data, variables) => {
      if (data) {
        // Update data di cache
        queryClient.setQueryData(['modulePage', variables.pageId], data)

        // Invalidate query untuk memperbarui daftar halaman
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (error) => {
      logger.error(HOOK, 'Error saving editor content', error)
      toast.error('Gagal menyimpan konten. Silakan coba lagi.')
    },
  })

  // Mutation untuk menghapus halaman
  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => modulePageAdapter.deletePage(pageId),
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar halaman
      queryClient.invalidateQueries({ queryKey })
      toast.success('Halaman berhasil dihapus')
    },
    onError: (error) => {
      logger.error(HOOK, 'Error deleting page', error)
      toast.error('Gagal menghapus halaman. Silakan coba lagi.')
    },
  })

  // Mutation untuk mengubah urutan halaman
  const reorderPagesMutation = useMutation({
    mutationFn: (pageIds: string[]) =>
      modulePageAdapter.reorderPages(moduleId, pageIds),
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar halaman
      queryClient.invalidateQueries({ queryKey })
      toast.success('Urutan halaman berhasil diperbarui')
    },
    onError: (error) => {
      logger.error(HOOK, 'Error reordering pages', error)
      toast.error('Gagal mengubah urutan halaman. Silakan coba lagi.')
    },
  })

  return {
    // Queries
    pages: pagesQuery.data || [],
    isPagesLoading: pagesQuery.isLoading,
    isPagesError: pagesQuery.isError,
    pagesError: pagesQuery.error,
    refetchPages: pagesQuery.refetch,
    getPage,
    getAllPages,
    getAdjacentPages,

    // Mutations
    createPage: createPageMutation.mutateAsync,
    updatePage: (pageId: string, data: UpdateModulePageInput) =>
      updatePageMutation.mutateAsync({ pageId, data }),
    savePage: (pageId: string, data: UpdateModulePageInput) =>
      updatePageMutation.mutateAsync({ pageId, data }),
    saveEditorContent: (pageId: string, content: StandardEditorContent) =>
      saveEditorContentMutation.mutateAsync({ pageId, content }),
    deletePage: deletePageMutation.mutateAsync,
    reorderPages: reorderPagesMutation.mutateAsync,

    // Mutation states
    isCreatePageLoading: createPageMutation.isPending,
    isUpdatePageLoading: updatePageMutation.isPending,
    isSaveEditorContentLoading: saveEditorContentMutation.isPending,
    isDeletePageLoading: deletePageMutation.isPending,
    isReorderPagesLoading: reorderPagesMutation.isPending,
  }
}

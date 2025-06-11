import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modulePageAdapter } from '../adapters/modulePageAdapter'
import {
  CreateModulePageInput,
  UpdateModulePageInput,
  ModulePage,
  StandardEditorContent,
  ModulePageStatus,
} from '../types'
import { toast } from 'sonner'
import { ensureValidEditorContent } from '../lib/dataFormats'

// Konstanta untuk hook name (logging)
// const HOOK = 'useModulePageData'

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
    queryFn: async () => {
      try {
        const pages = await modulePageAdapter.getPages(moduleId)
        // Ensure we return an array
        if (!Array.isArray(pages)) {
          return []
        }
        return pages
      } catch {
        return []
      }
    },
    staleTime: 60 * 1000, // 1 menit
  })

  // Query untuk mendapatkan semua halaman dalam modul (kompatibel dengan useModulePageQuery)
  const getAllPages = useQuery({
    queryKey,
    queryFn: () =>
      modulePageAdapter.getPages(moduleId).then((pages) => ({
        success: true,
        data: pages,
        meta: {
          currentPage: 1,
          pageSize: pages.length,
          totalItems: pages.length,
          totalPages: 1,
        },
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
      return await modulePageAdapter.getPage(pageId)
    } catch {
      return null
    }
  }

  /**
   * Mendapatkan konten yang telah diparse untuk editor
   * @param page - Halaman yang berisi konten
   * @returns Konten yang telah diparse dalam format JSON
   */
  const getParsedEditorContent = (
    page: ModulePage | null
  ): StandardEditorContent => {
    try {
      // Gunakan modulePageAdapter yang sudah menggunakan ensureValidEditorContent
      return modulePageAdapter.getParsedEditorContent(page)
    } catch {
      // Kembalikan konten default jika terjadi error
      return ensureValidEditorContent(null)
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

  // Function untuk mengecek apakah halaman memiliki draft
  const checkHasDraft = async (pageId: string): Promise<boolean> => {
    try {
      return await modulePageAdapter.hasDraft(pageId)
    } catch {
      return false
    }
  }

  // Function untuk mendapatkan draft halaman
  const getDraft = async (pageId: string): Promise<ModulePage | null> => {
    try {
      return await modulePageAdapter.getDraft(pageId)
    } catch {
      return null
    }
  }

  // Mutation untuk membuat halaman baru
  const createPageMutation = useMutation({
    mutationFn: (data: CreateModulePageInput) => {
      // Pastikan content valid sebelum dikirim ke adapter
      if (data.content) {
        const validContent = ensureValidEditorContent(data.content)
        // Gunakan type assertion untuk mengatasi ketidakcocokan tipe
        return modulePageAdapter.createPage({
          ...data,
          content: validContent as unknown as CreateModulePageInput['content'],
        })
      }
      return modulePageAdapter.createPage(data)
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar halaman
      queryClient.invalidateQueries({ queryKey })
      toast.success('Halaman berhasil dibuat')
    },
    onError: () => {
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
    }) => {
      // Pastikan content valid sebelum dikirim ke adapter
      if (data.content) {
        const validContent = ensureValidEditorContent(data.content)
        // Gunakan type assertion untuk mengatasi ketidakcocokan tipe
        return modulePageAdapter.updatePage(pageId, {
          ...data,
          content: validContent as unknown as UpdateModulePageInput['content'],
        })
      }
      return modulePageAdapter.updatePage(pageId, data)
    },
    onSuccess: (data, variables) => {
      if (data) {
        // Update data di cache
        queryClient.setQueryData(['modulePage', variables.pageId], {
          success: true,
          data,
        })

        // Invalidate query untuk memperbarui daftar halaman
        queryClient.invalidateQueries({ queryKey })
        toast.success('Halaman berhasil diperbarui')
      }
    },
    onError: () => {
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
    }) => {
      // Pastikan content valid sebelum dikirim ke adapter
      const validContent = ensureValidEditorContent(content)
      return modulePageAdapter.saveEditorContent(pageId, validContent)
    },
    onSuccess: (data, variables) => {
      if (data) {
        // Update data di cache
        queryClient.setQueryData(['modulePage', variables.pageId], {
          success: true,
          data,
        })

        // Invalidate query untuk memperbarui daftar halaman
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: () => {
      toast.error('Gagal menyimpan konten. Silakan coba lagi.')
    },
  })

  // Mutation untuk menyimpan draft
  const saveDraftMutation = useMutation({
    mutationFn: ({
      pageId,
      content,
      authorId,
    }: {
      pageId: string
      content: StandardEditorContent
      authorId: string
    }) => {
      // Pastikan content valid sebelum dikirim ke adapter
      const validContent = ensureValidEditorContent(content)
      return modulePageAdapter.saveDraft(pageId, validContent, authorId)
    },
    onSuccess: (data, variables) => {
      if (data) {
        // Update data di cache
        queryClient.setQueryData(['modulePage', variables.pageId], {
          success: true,
          data,
        })

        // Update cache draft
        queryClient.setQueryData(['modulePage', variables.pageId, 'draft'], {
          success: true,
          data,
        })

        // Tidak perlu invalidate query karena draft tidak mengubah daftar halaman
        // Juga tidak perlu toast karena auto-save berjalan di background
      }
    },
    onError: () => {
      // Tidak perlu toast error karena auto-save berjalan di background
      // toast.error('Gagal menyimpan draft. Silakan coba lagi.')
    },
  })

  // Mutation untuk mempublikasikan draft
  const publishDraftMutation = useMutation({
    mutationFn: (pageId: string) => modulePageAdapter.publishDraft(pageId),
    onSuccess: (data, variables) => {
      if (data) {
        // Update data di cache
        queryClient.setQueryData(['modulePage', variables], {
          success: true,
          data,
        })

        // Hapus cache draft
        queryClient.removeQueries({
          queryKey: ['modulePage', variables, 'draft'],
        })

        // Invalidate query untuk memperbarui daftar halaman
        queryClient.invalidateQueries({ queryKey })
        toast.success('Draft berhasil dipublikasikan')
      }
    },
    onError: () => {
      toast.error('Gagal mempublikasikan draft. Silakan coba lagi.')
    },
  })

  // Mutation untuk membuang draft
  const discardDraftMutation = useMutation({
    mutationFn: (pageId: string) => modulePageAdapter.discardDraft(pageId),
    onSuccess: (data, variables) => {
      if (data) {
        // Hapus cache draft
        queryClient.removeQueries({
          queryKey: ['modulePage', variables, 'draft'],
        })

        // Invalidate query untuk memperbarui cache halaman
        queryClient.invalidateQueries({
          queryKey: ['modulePage', variables],
        })

        toast.success('Draft berhasil dibuang')
      }
    },
    onError: () => {
      toast.error('Gagal membuang draft. Silakan coba lagi.')
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
    onError: () => {
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
    onError: () => {
      toast.error('Gagal mengubah urutan halaman. Silakan coba lagi.')
    },
  })

  // Mutation untuk mengubah status halaman
  const updatePageStatusMutation = useMutation({
    mutationFn: ({
      pageId,
      status,
      options,
    }: {
      pageId: string
      status: ModulePageStatus
      options?: { isDraft?: boolean; hasUnpublishedChanges?: boolean }
    }) => modulePageAdapter.updatePageStatus(pageId, status, options),
    onSuccess: (data, variables) => {
      if (data) {
        // Update data di cache
        queryClient.setQueryData(['modulePage', variables.pageId], {
          success: true,
          data,
        })

        // Invalidate query untuk memperbarui daftar halaman
        queryClient.invalidateQueries({ queryKey })

        // Tampilkan toast dengan pesan berbeda berdasarkan status
        const statusMessages = {
          [ModulePageStatus.DRAFT]: 'Halaman dikembalikan ke draft',
          [ModulePageStatus.PUBLISHED]: 'Halaman berhasil dipublikasikan',
          [ModulePageStatus.ARCHIVED]: 'Halaman berhasil diarsipkan',
        }
        toast.success(
          statusMessages[variables.status] ||
            'Status halaman berhasil diperbarui'
        )
      }
    },
    onError: () => {
      toast.error('Gagal mengubah status halaman. Silakan coba lagi.')
    },
  })

  return {
    // Queries
    pagesQuery,
    getAllPages,
    getPage,
    getParsedEditorContent,
    getAdjacentPages,
    checkHasDraft,
    getDraft,

    // Mutations
    createPage: createPageMutation.mutate,
    updatePage: updatePageMutation.mutate,
    saveEditorContent: saveEditorContentMutation.mutate,
    saveDraft: saveDraftMutation.mutate,
    publishDraft: publishDraftMutation.mutate,
    discardDraft: discardDraftMutation.mutate,
    deletePage: deletePageMutation.mutate,
    reorderPages: reorderPagesMutation.mutate,
    updatePageStatus: (
      pageId: string,
      status: ModulePageStatus,
      options?: { isDraft?: boolean; hasUnpublishedChanges?: boolean }
    ) => updatePageStatusMutation.mutate({ pageId, status, options }),

    // Loading states
    isCreating: createPageMutation.isPending,
    isUpdating: updatePageMutation.isPending,
    isSaving: saveEditorContentMutation.isPending,
    isSavingDraft: saveDraftMutation.isPending,
    isPublishingDraft: publishDraftMutation.isPending,
    isDiscardingDraft: discardDraftMutation.isPending,
    isDeleting: deletePageMutation.isPending,
    isReordering: reorderPagesMutation.isPending,
    isUpdatingStatus: updatePageStatusMutation.isPending,
  }
}

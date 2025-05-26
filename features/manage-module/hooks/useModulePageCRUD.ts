import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ModulePage } from '../types'
import {
  CreateModulePageInput,
  UpdateModulePageInput,
  ContentBlock,
  ContentBlockType,
} from '../types/modulePageSchema'
import { modulePageClientService } from '../services/modulePageClientService'
import { showErrorNotification } from '../components/ErrorNotifier'
import axios from 'axios'

// Kategori error untuk penanganan error yang lebih baik
enum ErrorCategory {
  NETWORK,
  AUTH,
  VALIDATION,
  SERVER,
  UNKNOWN,
}

// Helper untuk mengkategorikan error
function categorizeError(error: unknown): ErrorCategory {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') return ErrorCategory.NETWORK
    if (error.response?.status === 401 || error.response?.status === 403)
      return ErrorCategory.AUTH
    if (error.response?.status === 400) return ErrorCategory.VALIDATION
    if (error.response?.status && error.response.status >= 500)
      return ErrorCategory.SERVER
  }
  return ErrorCategory.UNKNOWN
}

// Helper untuk menentukan apakah error bisa di-retry
function isErrorRetryable(category: ErrorCategory): boolean {
  return category === ErrorCategory.NETWORK || category === ErrorCategory.SERVER
}

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    totalItems?: number
  }
}

/**
 * Hook untuk operasi CRUD pada halaman modul
 * Menyediakan fungsi create, update, delete, dan reorder halaman
 * dengan integrasi React Query untuk caching dan optimistic updates
 *
 * @param moduleId - ID modul yang sedang diedit
 */
export function useModulePageCRUD(moduleId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [activePage, setActivePage] = useState<ModulePage | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'unsaved' | 'error'
  >('saved')

  // Simpan moduleId di service untuk operasi lain
  useEffect(() => {
    if (moduleId) {
      modulePageClientService.setActiveModuleId(moduleId)
      const storedModuleId = modulePageClientService.getActiveModuleId()
      console.log(
        `[useModulePageCRUD] Verified stored moduleId: ${storedModuleId}`
      )
    }
  }, [moduleId])

  // Fetch pages untuk modul dengan query
  const {
    data: pagesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['modulePages', moduleId],
    queryFn: async () => {
      console.log(
        `[useModulePageCRUD] Fetching pages for moduleId: ${moduleId}`
      )
      const result = await modulePageClientService.getModulePages(moduleId)
      console.log(
        `[useModulePageCRUD] Fetched ${result.data?.length || 0} pages`
      )
      return result
    },
    staleTime: 1 * 60 * 1000, // 1 menit
    gcTime: 5 * 60 * 1000, // 5 menit (sebelumnya cacheTime)
    refetchOnMount: 'always', // Refetch hanya sekali saat komponen dimount
    refetchOnWindowFocus: false, // Nonaktifkan refetch saat window mendapat fokus
    retry: (failureCount, error) => {
      // Hanya retry maksimal 2 kali dan hanya untuk error tertentu
      if (failureCount > 2) return false

      // Jangan retry untuk error koneksi ditolak
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        return false
      }

      return true
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  })

  // Mutation untuk create halaman
  const createPage = useMutation({
    mutationFn: (newPage: CreateModulePageInput) =>
      modulePageClientService.createModulePage(newPage),
    onSuccess: () => {
      // Invalidate cache untuk memastikan data terbaru
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil dibuat')
    },
    onError: (error, variables) => {
      console.error('Error creating page:', error)

      // Gunakan enhanced error notification dengan kategori dan retry option
      const category = categorizeError(error)
      showErrorNotification(error, {
        retryFn: isErrorRetryable(category)
          ? () => createPage.mutate(variables)
          : undefined,
      })
    },
  })

  // Mutation untuk update halaman (dengan optimistic update)
  const updatePage = useMutation({
    mutationFn: ({
      pageId,
      updateData,
    }: {
      pageId: string
      updateData: UpdateModulePageInput
    }) => modulePageClientService.updateModulePage(pageId, updateData),
    onMutate: async ({ pageId, updateData }) => {
      // Cancel outgoing refetch to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ['modulePage', moduleId, pageId],
      })

      // Snapshot previous state
      const previousPageData = queryClient.getQueryData<
        ApiResponse<ModulePage>
      >(['modulePage', moduleId, pageId])

      // Optimistically update cache
      queryClient.setQueryData<ApiResponse<ModulePage> | undefined>(
        ['modulePage', moduleId, pageId],
        (old) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: { ...old.data, ...updateData },
          }
        }
      )

      // Jika update memengaruhi daftar halaman, update juga cache daftar
      if (updateData.title) {
        await queryClient.cancelQueries({
          queryKey: ['modulePages', moduleId],
        })

        const previousPagesData = queryClient.getQueryData<
          ApiResponse<ModulePage[]>
        >(['modulePages', moduleId])

        // Update title in pages list
        queryClient.setQueryData<ApiResponse<ModulePage[]> | undefined>(
          ['modulePages', moduleId],
          (old) => {
            if (!old || !old.data) return old
            return {
              ...old,
              data: old.data.map((page: ModulePage) =>
                page.id === pageId
                  ? { ...page, title: updateData.title as string }
                  : page
              ),
            }
          }
        )

        return { previousPageData, previousPagesData, pageId }
      }

      return { previousPageData, pageId }
    },
    onError: (error, variables, context) => {
      console.error('Error updating page:', error)

      // Rollback to previous state if mutation fails
      if (context?.previousPageData) {
        queryClient.setQueryData(
          ['modulePage', moduleId, context.pageId],
          context.previousPageData
        )
      }

      // Rollback pages list if needed
      if (context?.previousPagesData) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPagesData
        )
      }

      // Kategorisasi error dan tambahkan opsi retry
      const category = categorizeError(error)
      showErrorNotification(error, {
        retryFn: isErrorRetryable(category)
          ? () => updatePage.mutate(variables)
          : undefined,
      })
    },
    onSuccess: (_, variables) => {
      // Kita tetap invalidate query untuk memastikan konsistensi data jangka panjang
      queryClient.invalidateQueries({
        queryKey: ['modulePage', moduleId, variables.pageId],
      })
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil diperbarui')
    },
  })

  // Mutation untuk delete halaman
  const deletePage = useMutation({
    mutationFn: (pageId: string) =>
      modulePageClientService.deleteModulePage(pageId),
    onMutate: async (pageId) => {
      // Cancel any outgoing refetches untuk menghindari overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })

      // Snapshot state sebelumnya untuk rollback jika error
      const previousPages = queryClient.getQueryData<ApiResponse<ModulePage[]>>(
        ['modulePages', moduleId]
      )

      // Optimistically remove page from cache
      queryClient.setQueryData<ApiResponse<ModulePage[]> | undefined>(
        ['modulePages', moduleId],
        (old) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: old.data.filter((page: ModulePage) => page.id !== pageId),
          }
        }
      )

      return { previousPages }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil dihapus')
    },
    onError: (error, variables, context) => {
      console.error('Error deleting page:', error)

      // Rollback to previous state if mutation fails
      if (context?.previousPages) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPages
        )
      }

      // Kategorisasi error dan tambahkan opsi retry
      const category = categorizeError(error)
      showErrorNotification(error, {
        retryFn: isErrorRetryable(category)
          ? () => deletePage.mutate(variables)
          : undefined,
      })
    },
  })

  // Mutation untuk reorder halaman
  const reorderPages = useMutation({
    mutationFn: (pageIds: string[]) =>
      modulePageClientService.reorderModulePages(moduleId, pageIds),
    onMutate: async (pageIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })

      // Snapshot previous state
      const previousPages = queryClient.getQueryData<ApiResponse<ModulePage[]>>(
        ['modulePages', moduleId]
      )

      // Optimistically update cache with new order
      queryClient.setQueryData<ApiResponse<ModulePage[]> | undefined>(
        ['modulePages', moduleId],
        (old) => {
          if (!old || !old.data) return old

          // Create a map of pages by ID for quick lookup
          const pagesMap = old.data.reduce(
            (acc, page) => {
              acc[page.id] = page
              return acc
            },
            {} as Record<string, ModulePage>
          )

          // Create new array with updated order
          const reorderedPages = pageIds
            .map((id, index) => {
              if (!pagesMap[id]) return null
              return { ...pagesMap[id], order: index + 1 }
            })
            .filter((page): page is ModulePage => page !== null)

          return {
            ...old,
            data: reorderedPages,
          }
        }
      )

      return { previousPages }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Urutan halaman berhasil diperbarui')
    },
    onError: (error, variables, context) => {
      console.error('Error reordering pages:', error)

      // Rollback to previous state if mutation fails
      if (context?.previousPages) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPages
        )
      }

      // Kategorisasi error dan tambahkan opsi retry
      const category = categorizeError(error)
      showErrorNotification(error, {
        retryFn: isErrorRetryable(category)
          ? () => reorderPages.mutate(variables)
          : undefined,
      })
    },
  })

  // Mutation untuk update status halaman
  const updatePageStatus = useMutation({
    mutationFn: ({
      pageId,
      status,
    }: {
      pageId: string
      status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    }) => modulePageClientService.updatePageStatus(pageId, status),
    onMutate: async ({ pageId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['modulePage', moduleId, pageId],
      })
      await queryClient.cancelQueries({
        queryKey: ['modulePages', moduleId],
      })

      // Snapshot previous states
      const previousPageData = queryClient.getQueryData<
        ApiResponse<ModulePage>
      >(['modulePage', moduleId, pageId])
      const previousPagesData = queryClient.getQueryData<
        ApiResponse<ModulePage[]>
      >(['modulePages', moduleId])

      // Optimistically update cache for single page
      queryClient.setQueryData<ApiResponse<ModulePage> | undefined>(
        ['modulePage', moduleId, pageId],
        (old) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: { ...old.data, status },
          }
        }
      )

      // Update status in pages list
      queryClient.setQueryData<ApiResponse<ModulePage[]> | undefined>(
        ['modulePages', moduleId],
        (old) => {
          if (!old || !old.data) return old
          return {
            ...old,
            data: old.data.map((page: ModulePage) =>
              page.id === pageId ? { ...page, status } : page
            ),
          }
        }
      )

      return { previousPageData, previousPagesData, pageId }
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ['modulePage', moduleId, variables.pageId],
      })
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success(
        `Status halaman berhasil diubah menjadi ${variables.status}`
      )
    },
    onError: (error, variables, context) => {
      console.error('Error updating page status:', error)

      // Rollback to previous states
      if (context?.previousPageData) {
        queryClient.setQueryData(
          ['modulePage', moduleId, context.pageId],
          context.previousPageData
        )
      }
      if (context?.previousPagesData) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPagesData
        )
      }

      // Kategorisasi error dan tambahkan opsi retry
      const category = categorizeError(error)
      showErrorNotification(error, {
        retryFn: isErrorRetryable(category)
          ? () => updatePageStatus.mutate(variables)
          : undefined,
      })
    },
  })

  // Helper untuk mendapatkan halaman berdasarkan ID
  const getPageById = useCallback(
    async (pageId: string): Promise<ModulePage | null> => {
      try {
        const response = await modulePageClientService.getModulePage(pageId)
        return response?.data || null
      } catch (error) {
        console.error('Error fetching page by ID:', error)
        return null
      }
    },
    []
  )

  // Helper untuk mendapatkan halaman berikutnya
  const getNextPage = useCallback(
    (currentPageId?: string): ModulePage | null => {
      if (!pagesData?.data || pagesData.data.length === 0) return null

      // Jika tidak ada currentPageId, kembalikan halaman pertama
      if (!currentPageId) return pagesData.data[0]

      // Temukan indeks halaman saat ini
      const currentIndex = pagesData.data.findIndex(
        (page) => page.id === currentPageId
      )
      if (currentIndex === -1) return null

      // Kembalikan halaman berikutnya jika ada
      return currentIndex < pagesData.data.length - 1
        ? pagesData.data[currentIndex + 1]
        : null
    },
    [pagesData?.data]
  )

  // Helper untuk mendapatkan halaman sebelumnya
  const getPreviousPage = useCallback(
    (currentPageId?: string): ModulePage | null => {
      if (!pagesData?.data || pagesData.data.length === 0) return null

      // Jika tidak ada currentPageId, kembalikan halaman terakhir
      if (!currentPageId) return pagesData.data[pagesData.data.length - 1]

      // Temukan indeks halaman saat ini
      const currentIndex = pagesData.data.findIndex(
        (page) => page.id === currentPageId
      )
      if (currentIndex === -1) return null

      // Kembalikan halaman sebelumnya jika ada
      return currentIndex > 0 ? pagesData.data[currentIndex - 1] : null
    },
    [pagesData?.data]
  )

  // Helper untuk mendapatkan halaman pertama
  const getFirstPage = useCallback((): ModulePage | null => {
    if (!pagesData?.data || pagesData.data.length === 0) return null
    return pagesData.data[0]
  }, [pagesData?.data])

  // Helper untuk mendapatkan halaman terakhir
  const getLastPage = useCallback((): ModulePage | null => {
    if (!pagesData?.data || pagesData.data.length === 0) return null
    return pagesData.data[pagesData.data.length - 1]
  }, [pagesData?.data])

  // Handler untuk navigasi ke halaman berikutnya
  const handleNavigateToNextPage = useCallback(() => {
    if (!activePage || isNavigating) return

    const nextPage = getNextPage(activePage.id)
    if (nextPage) {
      setIsNavigating(true)
      router.push(`/manage-module/pages/${moduleId}?pageId=${nextPage.id}`)
      setActivePage(nextPage)
      setIsNavigating(false)
    }
  }, [activePage, getNextPage, isNavigating, moduleId, router])

  // Handler untuk navigasi ke halaman sebelumnya
  const handleNavigateToPrevPage = useCallback(() => {
    if (!activePage || isNavigating) return

    const prevPage = getPreviousPage(activePage.id)
    if (prevPage) {
      setIsNavigating(true)
      router.push(`/manage-module/pages/${moduleId}?pageId=${prevPage.id}`)
      setActivePage(prevPage)
      setIsNavigating(false)
    }
  }, [activePage, getPreviousPage, isNavigating, moduleId, router])

  // Handler untuk mengubah halaman aktif
  const handlePageChange = useCallback(
    (newPageId: string) => {
      if (isNavigating) return

      setIsNavigating(true)
      router.push(`/manage-module/pages/${moduleId}?pageId=${newPageId}`)

      // Cari halaman dari cache jika ada
      const pageFromCache = pagesData?.data?.find(
        (page) => page.id === newPageId
      )
      if (pageFromCache) {
        setActivePage(pageFromCache)
      } else {
        // Jika tidak ada di cache, fetch dari API
        getPageById(newPageId).then((page) => {
          if (page) setActivePage(page)
        })
      }

      setIsNavigating(false)
    },
    [getPageById, isNavigating, moduleId, pagesData?.data, router]
  )

  // Handler untuk select halaman
  const handleSelectPage = useCallback(
    (page: ModulePage) => {
      handlePageChange(page.id)
    },
    [handlePageChange]
  )

  // Handler untuk editor change
  const handleEditorChange = useCallback(
    (content: object, pageId: string) => {
      if (!pageId) return

      // Set save status to saving
      setSaveStatus('saving')

      // Tambahkan null check untuk updatePage.mutate
      if (!updatePage?.mutate) {
        console.warn('updatePage.mutate not available in testing environment')
        setSaveStatus('error')
        return
      }

      // Buat block dengan tipe yang benar
      const contentBlock: ContentBlock = {
        type: ContentBlockType.TEXT,
        content: JSON.stringify(content),
      }

      // Perbarui halaman dengan konten baru
      updatePage.mutate(
        {
          pageId,
          updateData: { blocks: [contentBlock] },
        },
        {
          onSuccess: () => {
            setSaveStatus('saved')
          },
          onError: () => {
            setSaveStatus('error')
          },
        }
      )
    },
    [updatePage]
  )

  // Fungsi untuk menyimpan halaman
  const savePage = useCallback(
    async (params: {
      pageId: string
      title?: string
      blocks?: any[]
    }): Promise<ModulePage | null> => {
      try {
        setSaveStatus('saving')
        const { pageId, title, blocks } = params

        const result = await modulePageClientService.updateModulePage(pageId, {
          title,
          blocks,
        })

        if (result) {
          setSaveStatus('saved')
          return result.data
        }

        setSaveStatus('error')
        return null
      } catch (error) {
        console.error('Error saving page:', error)
        setSaveStatus('error')
        throw error
      }
    },
    []
  )

  // Wrapper untuk savePageWrapper yang memanfaatkan optimistic update
  const savePageWrapper = useCallback(
    async (
      pageId: string,
      data: { title?: string; blocks?: ContentBlock[] }
    ): Promise<ModulePage | null> => {
      return new Promise((resolve, reject) => {
        // Tambahkan null check untuk updatePage.mutate
        if (!updatePage?.mutate) {
          console.warn('updatePage.mutate not available in testing environment')
          reject(new Error('updatePage.mutate not available'))
          return
        }

        updatePage.mutate(
          {
            pageId,
            updateData: data,
          },
          {
            onSuccess: (result) => {
              if (result?.data) {
                resolve(result.data)
              } else {
                resolve(null)
              }
            },
            onError: (error) => {
              reject(error)
            },
          }
        )
      })
    },
    [updatePage]
  )

  return {
    // Data
    moduleId,
    pages: pagesData?.data || [],
    activePage,
    isLoading,
    error,
    refetch,

    // Mutation functions dengan null check
    createPage:
      createPage?.mutate ||
      (async () => {
        console.warn('createPage mutation not available in testing environment')
        return null
      }),
    updatePage:
      updatePage?.mutate ||
      (async () => {
        console.warn('updatePage mutation not available in testing environment')
        return null
      }),
    deletePage:
      deletePage?.mutate ||
      (async () => {
        console.warn('deletePage mutation not available in testing environment')
        return null
      }),
    reorderPages:
      reorderPages?.mutate ||
      (async () => {
        console.warn(
          'reorderPages mutation not available in testing environment'
        )
        return null
      }),
    updatePageStatus:
      updatePageStatus?.mutate ||
      (async () => {
        console.warn(
          'updatePageStatus mutation not available in testing environment'
        )
        return null
      }),

    // State management
    setActivePage,
    saveStatus,
    setSaveStatus,
    isNavigating,
    setIsNavigating,

    // Navigation helpers
    getNextPage,
    getPreviousPage,
    getFirstPage,
    getLastPage,

    // Helpers
    getPageById,
    savePage,
    savePageWrapper,

    // Handler functions
    handlePageChange,
    handleSelectPage,
    handleEditorChange,
    handleNavigateToPrevPage,
    handleNavigateToNextPage,
  }
}

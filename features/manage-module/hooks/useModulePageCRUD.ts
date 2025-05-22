import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { modulePageClientService } from '../services/modulePageClientService'
import {
  CreateModulePageInput,
  UpdateModulePageInput,
  ModulePage,
  ContentBlock,
} from '../types/modulePageSchema'
import { useCallback } from 'react'
import {
  showErrorNotification,
  categorizeError,
  isErrorRetryable,
} from '../components/ErrorNotifier'
import React from 'react'
import axios from 'axios'

// Mendefinisikan tipe untuk respons API
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

  // Set moduleId aktif agar dapat digunakan di service
  React.useEffect(() => {
    if (moduleId) {
      modulePageClientService.setActiveModuleId(moduleId)
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
    onError: (error, pageId, context) => {
      console.error('Error deleting page:', error)

      // Rollback ke state sebelum optimistic update
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
          ? () => deletePage.mutate(pageId)
          : undefined,
      })
    },
  })

  // Mutation untuk reorder halaman
  const reorderPages = useMutation({
    mutationFn: (pageIds: string[]) =>
      modulePageClientService.reorderModulePages(moduleId, pageIds),
    onMutate: async (pageIds) => {
      // Cancel any outgoing refetches untuk menghindari overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })

      // Snapshot state sebelumnya untuk rollback jika error
      const previousPages = queryClient.getQueryData<ApiResponse<ModulePage[]>>(
        ['modulePages', moduleId]
      )

      // Optimistically update to the new order
      queryClient.setQueryData<ApiResponse<ModulePage[]> | undefined>(
        ['modulePages', moduleId],
        (old) => {
          if (!old || !old.data) return old

          // Create a map for faster lookups
          const pagesMap = new Map(
            old.data.map((page: ModulePage) => [page.id, page])
          )

          // Reorder pages based on pageIds
          const newOrder = pageIds
            .map((id, index) => {
              const page = pagesMap.get(id)
              if (!page) return null
              return { ...page, order: index }
            })
            .filter(Boolean) as ModulePage[]

          return {
            ...old,
            data: newOrder,
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
    onError: (error, pageIds, context) => {
      console.error('Error reordering pages:', error)

      // Rollback ke state sebelum optimistic update
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
          ? () => reorderPages.mutate(pageIds)
          : undefined,
      })
    },
  })

  /**
   * Mengambil halaman berdasarkan ID
   */
  const getPageById = useCallback(
    async (pageId: string): Promise<ModulePage | null> => {
      try {
        const response = await modulePageClientService.getModulePage(pageId)
        return response?.data || null
      } catch (error) {
        console.error('Error fetching page:', error)

        // Kategorisasi error dan tambahkan opsi retry
        const category = categorizeError(error)
        showErrorNotification(error, {
          retryFn: isErrorRetryable(category)
            ? () => getPageById(pageId)
            : undefined,
        })

        return null
      }
    },
    []
  )

  /**
   * Helper function untuk menyimpan perubahan pada halaman
   * Digunakan oleh DocumentHeader dan ModulePageEditor
   * Mendukung optimistic updates untuk pengalaman pengguna yang lebih baik
   */
  const savePage = useCallback(
    async ({
      pageId,
      title,
      blocks,
    }: {
      pageId: string
      title?: string
      blocks?: ContentBlock[]
    }) => {
      const updateData: UpdateModulePageInput = {}
      if (title) updateData.title = title
      if (blocks) updateData.blocks = blocks

      try {
        // Gunakan mutation yang sudah mendukung optimistic updates
        return await updatePage.mutateAsync({
          pageId,
          updateData,
        })
      } catch (error) {
        console.error('Error saving page:', error)
        throw error
      }
    },
    [updatePage]
  )

  return {
    // Data
    pages: pagesData?.data || [],
    isLoading,
    error,
    refetch,

    // Mutations
    createPage,
    updatePage,
    deletePage,
    reorderPages,

    // Helper functions
    getPageById,
    savePage,
  }
}

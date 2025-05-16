import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { modulePageService } from '../services/modulePageService'
import {
  CreateModulePageInput,
  UpdateModulePageInput,
  ModulePage,
} from '../types/modulePageSchema'
import { useCallback } from 'react'
import { showErrorNotification } from '../components/ErrorNotifier'

/**
 * Hook untuk operasi CRUD pada halaman modul
 * Menyediakan fungsi create, update, delete, dan reorder halaman
 * dengan integrasi React Query untuk caching dan optimistic updates
 *
 * @param moduleId - ID modul yang sedang diedit
 */
export function useModulePageCRUD(moduleId: string) {
  const queryClient = useQueryClient()

  // Fetch pages untuk modul dengan query
  const {
    data: pagesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['modulePages', moduleId],
    queryFn: async () => modulePageService.getModulePages(moduleId),
    staleTime: 5 * 60 * 1000, // 5 menit
  })

  // Mutation untuk create halaman
  const createPage = useMutation({
    mutationFn: (newPage: CreateModulePageInput) =>
      modulePageService.createModulePage(newPage),
    onSuccess: () => {
      // Invalidate cache untuk memastikan data terbaru
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil dibuat')
    },
    onError: (error) => {
      console.error('Error creating page:', error)
      showErrorNotification(error)
    },
  })

  // Mutation untuk update halaman
  const updatePage = useMutation({
    mutationFn: ({
      pageId,
      updateData,
    }: {
      pageId: string
      updateData: UpdateModulePageInput
    }) => modulePageService.updateModulePage(pageId, updateData),
    onSuccess: (_, variables) => {
      // Invalidate queries yang terpengaruh
      queryClient.invalidateQueries({
        queryKey: ['modulePage', moduleId, variables.pageId],
      })
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil diperbarui')
    },
    onError: (error) => {
      console.error('Error updating page:', error)
      showErrorNotification(error)
    },
  })

  // Mutation untuk delete halaman
  const deletePage = useMutation({
    mutationFn: (pageId: string) => modulePageService.deleteModulePage(pageId),
    onMutate: async (pageId) => {
      // Cancel any outgoing refetches untuk menghindari overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })

      // Snapshot state sebelumnya untuk rollback jika error
      const previousPages = queryClient.getQueryData(['modulePages', moduleId])

      // Optimistically remove page from cache
      queryClient.setQueryData(['modulePages', moduleId], (old: any) => {
        if (!old || !old.data) return old
        return {
          ...old,
          data: old.data.filter((page: ModulePage) => page.id !== pageId),
        }
      })

      return { previousPages }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil dihapus')
    },
    onError: (error, _, context) => {
      console.error('Error deleting page:', error)
      // Rollback ke state sebelum optimistic update
      if (context?.previousPages) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPages
        )
      }
      showErrorNotification(error)
    },
  })

  // Mutation untuk reorder halaman
  const reorderPages = useMutation({
    mutationFn: (pageIds: string[]) =>
      modulePageService.reorderModulePages(moduleId, pageIds),
    onMutate: async (pageIds) => {
      // Cancel any outgoing refetches untuk menghindari overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })

      // Snapshot state sebelumnya untuk rollback jika error
      const previousPages = queryClient.getQueryData(['modulePages', moduleId])

      // Optimistically update to the new order
      queryClient.setQueryData(['modulePages', moduleId], (old: any) => {
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
          .filter(Boolean)

        return {
          ...old,
          data: newOrder,
        }
      })

      return { previousPages }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Urutan halaman berhasil diperbarui')
    },
    onError: (error, _, context) => {
      console.error('Error reordering pages:', error)
      // Rollback ke state sebelum optimistic update
      if (context?.previousPages) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPages
        )
      }
      showErrorNotification(error)
    },
  })

  /**
   * Mengambil halaman berdasarkan ID
   */
  const getPageById = useCallback(
    async (pageId: string): Promise<ModulePage | null> => {
      try {
        const response = await modulePageService.getModulePage(pageId)
        return response?.data || null
      } catch (error) {
        console.error('Error fetching page:', error)
        showErrorNotification(error)
        return null
      }
    },
    []
  )

  /**
   * Helper function untuk menyimpan perubahan pada halaman
   * Digunakan oleh DocumentHeader dan ModulePageEditor
   */
  const savePage = useCallback(
    async ({
      pageId,
      title,
      blocks,
    }: {
      pageId: string
      title?: string
      blocks?: any[]
    }) => {
      const updateData: UpdateModulePageInput = {}
      if (title) updateData.title = title
      if (blocks) updateData.blocks = blocks

      try {
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

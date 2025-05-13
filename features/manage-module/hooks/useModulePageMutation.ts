import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { modulePageService } from '../services/modulePageService'
import { CreateModulePageInput, UpdateModulePageInput } from '../types'

export function useModulePageMutation(moduleId: string) {
  const queryClient = useQueryClient()

  // Membuat halaman baru
  const createPage = useMutation({
    mutationFn: (newPage: CreateModulePageInput) =>
      modulePageService.createModulePage(newPage),
    onSuccess: () => {
      // Invalidate dan refetch data halaman
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil dibuat')
    },
    onError: (error) => {
      console.error('Error creating page:', error)
      toast.error('Gagal membuat halaman. Silakan coba lagi.')
    },
  })

  // Mengupdate halaman yang ada
  const updatePage = useMutation({
    mutationFn: ({
      pageId,
      updateData,
    }: {
      pageId: string
      updateData: UpdateModulePageInput
    }) => modulePageService.updateModulePage(pageId, updateData),
    onSuccess: (_, variables) => {
      // Invalidate queries yang mungkin terpengaruh
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
      toast.error('Gagal memperbarui halaman. Silakan coba lagi.')
    },
  })

  // Menghapus halaman
  const deletePage = useMutation({
    mutationFn: (pageId: string) => modulePageService.deleteModulePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Halaman berhasil dihapus')
    },
    onError: (error) => {
      console.error('Error deleting page:', error)
      toast.error('Gagal menghapus halaman. Silakan coba lagi.')
    },
  })

  // Mengubah urutan halaman
  const reorderPages = useMutation({
    mutationFn: (pageIds: string[]) =>
      modulePageService.reorderModulePages(moduleId, pageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['modulePages', moduleId],
      })
      toast.success('Urutan halaman berhasil diperbarui')
    },
    onError: (error) => {
      console.error('Error reordering pages:', error)
      toast.error('Gagal mengubah urutan halaman. Silakan coba lagi.')
    },
  })

  return {
    createPage,
    updatePage,
    deletePage,
    reorderPages,
  }
}

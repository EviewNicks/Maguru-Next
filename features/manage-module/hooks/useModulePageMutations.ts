// features/manage-module/hooks/useModulePageMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import {
  ModulePage,
  ModulePageCreateInput,
  ModulePageUpdateInput,
  ModulePageReorderInput,
} from '../types'

/**
 * Hook untuk membuat halaman modul baru
 * Menggunakan optimistic update untuk UX yang lebih baik
 */
export function useCreateModulePage(moduleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<ModulePageCreateInput, 'moduleId'>) => {
      const response = await axios.post<ModulePage>(
        `/api/modules/${moduleId}/pages`,
        data
      )
      return response.data
  
  
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui data
      queryClient.invalidateQueries({ queryKey: ['modulePages', moduleId] })

      // Tampilkan notifikasi sukses
      toast.success('Halaman berhasil dibuat', {
        description: `Halaman baru telah berhasil ditambahkan ke modul.`,
      })
    },
    onError: (error: Error) => {
      // Tampilkan notifikasi error
      toast.error('Gagal membuat halaman', {
        description: error.message || 'Terjadi kesalahan saat membuat halaman.',
      })
    },
  })
}

/**
 * Hook untuk memperbarui halaman modul yang sudah ada
 * Menggunakan optimistic update untuk UX yang lebih baik
 */
export function useUpdateModulePage(moduleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
      version,
    }: {
      id: string
      data: ModulePageUpdateInput
      version: number
    }) => {
      const headers = {
        'x-page-version': version.toString(),
      }

      const response = await axios.put<ModulePage>(
        `/api/modules/${moduleId}/pages/${id}`,
        data,
        { headers }
      )
      return response.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })
      await queryClient.cancelQueries({
        queryKey: ['modulePage', moduleId, id],
      })

      // Snapshot the previous value
      const previousPages = queryClient.getQueryData<ModulePage[]>([
        'modulePages',
        moduleId,
      ])
      const previousPage = queryClient.getQueryData<ModulePage>([
        'modulePage',
        moduleId,
        id,
      ])

      // Optimistically update to the new value
      if (previousPages) {
        queryClient.setQueryData<ModulePage[]>(
          ['modulePages', moduleId],
          previousPages.map((page) =>
            page.id === id ? { ...page, ...data } : page
          )
        )
      }

      if (previousPage) {
        queryClient.setQueryData<ModulePage>(
          ['modulePage', moduleId, id],
          { ...previousPage, ...data }
        )
      }

      // Return a context with the previous and new value
      return { previousPages, previousPage }
    },
    onSuccess: (updatedPage) => {
      // Invalidate query untuk memperbarui data
      queryClient.invalidateQueries({ queryKey: ['modulePages', moduleId] })
      queryClient.invalidateQueries({
        queryKey: ['modulePage', moduleId, updatedPage.id],
      })

      // Tampilkan notifikasi sukses
      toast.success('Halaman berhasil diperbarui', {
        description: `Perubahan pada halaman telah berhasil disimpan.`,
      })
    },
    onError: (error: Error, { id }, context) => {
      // Rollback to the previous value
      if (context?.previousPages) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPages
        )
      }

      if (context?.previousPage) {
        queryClient.setQueryData(
          ['modulePage', moduleId, id],
          context.previousPage
        )
      }

      // Cek jika error adalah karena konflik versi
      if (error.message && error.message.includes('Versi halaman tidak sesuai')) {
        toast.error('Konflik perubahan', {
          description: 'Halaman telah diubah oleh pengguna lain. Silakan muat ulang dan coba lagi.',
        })
      } else {
        // Tampilkan notifikasi error
        toast.error('Gagal memperbarui halaman', {
          description: error.message || 'Terjadi kesalahan saat memperbarui halaman.',
        })
      }
    },
    onSettled: () => {
      // Invalidate queries untuk memastikan data yang benar
      queryClient.invalidateQueries({ queryKey: ['modulePages', moduleId] })
    },
  })
}

/**
 * Hook untuk menghapus halaman modul
 * Menggunakan optimistic update untuk UX yang lebih baik
 */
export function useDeleteModulePage(moduleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pageId: string) => {
      const response = await axios.delete<ModulePage>(
        `/api/modules/${moduleId}/pages/${pageId}`
      )
      return response.data
    },
    onMutate: async (pageId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })

      // Snapshot the previous value
      const previousPages = queryClient.getQueryData<ModulePage[]>([
        'modulePages',
        moduleId,
      ])

      // Optimistically update to the new value
      if (previousPages) {
        queryClient.setQueryData<ModulePage[]>(
          ['modulePages', moduleId],
          previousPages.filter((page) => page.id !== pageId)
        )
      }

      // Return a context with the previous value
      return { previousPages }
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui data
      queryClient.invalidateQueries({ queryKey: ['modulePages', moduleId] })

      // Tampilkan notifikasi sukses
      toast.success('Halaman berhasil dihapus', {
        description: `Halaman telah berhasil dihapus dari modul.`,
      })
    },
    onError: (error: Error, pageId, context) => {
      // Rollback to the previous value
      if (context?.previousPages) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPages
        )
      }

      // Tampilkan notifikasi error
      toast.error('Gagal menghapus halaman', {
        description: error.message || 'Terjadi kesalahan saat menghapus halaman.',
      })
    },
  })
}

/**
 * Hook untuk mengubah urutan halaman modul
 * Menggunakan optimistic update untuk UX yang lebih baik
 */
export function useReorderModulePages(moduleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ModulePageReorderInput) => {
      const response = await axios.patch<{ pages: ModulePage[] }>(
        `/api/modules/${moduleId}/pages/reorder`,
        data
      )
      return response.data.pages
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modulePages', moduleId] })

      // Snapshot the previous value
      const previousPages = queryClient.getQueryData<ModulePage[]>([
        'modulePages',
        moduleId,
      ])

      // Optimistically update to the new value
      if (previousPages) {
        const updatedPages = [...previousPages]
        
        // Update order for each page in the updates array
        data.updates.forEach((update) => {
          const pageIndex = updatedPages.findIndex((p) => p.id === update.pageId)
          if (pageIndex !== -1) {
            updatedPages[pageIndex] = {
              ...updatedPages[pageIndex],
              order: update.order,
            }
          }
        })
        
        // Sort pages by order
        updatedPages.sort((a, b) => a.order - b.order)
        
        queryClient.setQueryData<ModulePage[]>(
          ['modulePages', moduleId],
          updatedPages
        )
      }

      // Return a context with the previous value
      return { previousPages }
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui data
      queryClient.invalidateQueries({ queryKey: ['modulePages', moduleId] })

      // Tampilkan notifikasi sukses
      toast.success('Urutan halaman berhasil diperbarui', {
        description: `Perubahan urutan halaman telah berhasil disimpan.`,
      })
    },
    onError: (error: Error, data, context) => {
      // Rollback to the previous value
      if (context?.previousPages) {
        queryClient.setQueryData(
          ['modulePages', moduleId],
          context.previousPages
        )
      }

      // Tampilkan notifikasi error
      toast.error('Gagal mengubah urutan halaman', {
        description: error.message || 'Terjadi kesalahan saat mengubah urutan halaman.',
      })
    },
  })
}

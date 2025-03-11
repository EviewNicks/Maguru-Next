import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { Module, ModuleCreateInput, ModuleUpdateInput } from '../types'

/**
 * Hook untuk membuat modul baru
 * Menggunakan optimistic update untuk UX yang lebih baik
 */
export function useCreateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ModuleCreateInput) => {
      const response = await axios.post<Module>('/api/modules', data)
      return response.data
    },
    onSuccess: (newModule) => {
      // Invalidate query untuk memperbarui data
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      
      // Tampilkan notifikasi sukses
      toast.success('Modul berhasil dibuat', {
        description: `Modul "${newModule.title}" telah berhasil ditambahkan.`,
      })
    },
    onError: (error: Error) => {
      // Tampilkan notifikasi error
      toast.error('Gagal membuat modul', {
        description: error.message || 'Terjadi kesalahan saat membuat modul.',
      })
    },
  })
}

/**
 * Hook untuk memperbarui modul yang sudah ada
 * Menggunakan optimistic update untuk UX yang lebih baik
 */
export function useUpdateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ModuleUpdateInput & { id: string }) => {
      const { id, ...updateData } = data
      const response = await axios.put<Module>(`/api/modules/${id}`, updateData)
      return response.data
    },
    onMutate: async (updatedModule) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modules'] })
      
      // Snapshot the previous value
      const previousModules = queryClient.getQueryData(['modules'])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['modules'], (old: any) => {
        if (!old?.modules) return old
        
        return {
          ...old,
          modules: old.modules.map((module: Module) =>
            module.id === updatedModule.id
              ? { ...module, ...updatedModule }
              : module
          ),
        }
      })
      
      return { previousModules }
    },
    onSuccess: (updatedModule) => {
      // Invalidate query untuk memastikan data terbaru
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      
      // Tampilkan notifikasi sukses
      toast.success('Modul berhasil diperbarui', {
        description: `Modul "${updatedModule.title}" telah berhasil diperbarui.`,
      })
    },
    onError: (error, _, context) => {
      // Rollback ke data sebelumnya jika terjadi error
      if (context?.previousModules) {
        queryClient.setQueryData(['modules'], context.previousModules)
      }
      
      // Tampilkan notifikasi error
      toast.error('Gagal memperbarui modul', {
        description: error.message || 'Terjadi kesalahan saat memperbarui modul.',
      })
    },
  })
}

/**
 * Hook untuk menghapus modul
 * Menggunakan optimistic update untuk UX yang lebih baik
 */
export function useDeleteModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await axios.delete<Module>(`/api/modules/${moduleId}`)
      return response.data
    },
    onMutate: async (deletedModuleId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modules'] })
      
      // Snapshot the previous value
      const previousModules = queryClient.getQueryData(['modules'])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['modules'], (old: any) => {
        if (!old?.modules) return old
        
        return {
          ...old,
          modules: old.modules.filter(
            (module: Module) => module.id !== deletedModuleId
          ),
        }
      })
      
      return { previousModules }
    },
    onSuccess: (_, deletedModuleId) => {
      // Invalidate query untuk memastikan data terbaru
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      
      // Tampilkan notifikasi sukses
      toast.success('Modul berhasil dihapus', {
        description: 'Modul telah berhasil dihapus dari sistem.',
      })
    },
    onError: (error, _, context) => {
      // Rollback ke data sebelumnya jika terjadi error
      if (context?.previousModules) {
        queryClient.setQueryData(['modules'], context.previousModules)
      }
      
      // Tampilkan notifikasi error
      toast.error('Gagal menghapus modul', {
        description: error.message || 'Terjadi kesalahan saat menghapus modul.',
      })
    },
  })
}

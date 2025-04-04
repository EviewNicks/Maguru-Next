'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createModule,
  updateModule,
  deleteModule,
} from '../services/moduleClientService'
import { Module, ModuleStatus } from '../types'
import { handleError } from '../components/ErrorNotifier/ErrorNotifier'

// Tipe data untuk input pembuatan modul
export interface CreateModuleInput {
  title: string
  description: string // Wajib diisi sesuai dengan tipe Module
  status: ModuleStatus
}

// Tipe data untuk input pembaruan modul
export interface UpdateModuleInput {
  id: string
  title?: string
  description?: string
  status?: ModuleStatus
}

// Tipe untuk respons dari API
interface ModuleResponse {
  data: Module[]
  meta: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
  }
}

/**
 * Hook untuk mengelola mutasi data modul (create, update, delete)
 * dengan optimistic updates untuk pengalaman pengguna yang lebih baik
 */
export function useModuleMutation() {
  const queryClient = useQueryClient()

  // Mutation untuk membuat modul baru
  const createModuleMutation = useMutation({
    mutationFn: (data: CreateModuleInput) => createModule(data),
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar modul
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Modul berhasil dibuat')
    },
    onError: (error) => {
      const errorDetails = handleError(error)
      toast.error(errorDetails.message, {
        description: errorDetails.code,
      })
      // Hanya log error saat development
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error creating module:', errorDetails)
      }
    },
  })

  // Mutation untuk memperbarui modul
  const updateModuleMutation = useMutation({
    mutationFn: (data: UpdateModuleInput) => {
      const { id, ...updateData } = data
      return updateModule(id, updateData)
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar modul
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Modul berhasil diperbarui')
    },
    onError: (error) => {
      const errorDetails = handleError(error)
      toast.error(errorDetails.message, {
        description: errorDetails.code,
      })
      // Hanya log error saat development
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error updating module:', errorDetails)
      }
    },
  })

  // Mutation untuk menghapus modul
  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['modules'] })

      // Snapshot the previous value
      const previousModules = queryClient.getQueryData(['modules'])

      // Optimistically update to the new value
      queryClient.setQueryData(
        ['modules'],
        (old: ModuleResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((module) => module.id !== deletedId),
          }
        }
      )

      // Return a context object with the snapshot value
      return { previousModules }
    },
    onSuccess: () => {
      // Invalidate query untuk memperbarui daftar modul
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Modul berhasil dihapus')
    },
    onError: (error, _deletedId, context) => {
      const errorDetails = handleError(error)
      toast.error(errorDetails.message, {
        description: errorDetails.code,
      })
      // Hanya log error saat development
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error deleting module:', errorDetails)
      }

      // Rollback optimistic update jika terjadi error
      if (context?.previousModules) {
        queryClient.setQueryData(['modules'], context.previousModules)
      }
    },
  })

  return {
    createModuleMutation,
    updateModuleMutation,
    deleteModuleMutation,
  }
}

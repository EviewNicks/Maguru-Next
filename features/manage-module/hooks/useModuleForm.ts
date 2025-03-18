'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { moduleFormSchema, ModuleFormValues } from '../types/schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createModule, updateModule } from '../services/moduleClientService'
import { toast } from 'sonner'
import { Module, ModuleStatus } from '../types'

interface UseModuleFormProps {
  mode: 'create' | 'edit'
  module?: Module
  onSuccess: () => void
}

export function useModuleForm({ mode, module, onSuccess }: UseModuleFormProps) {
  const queryClient = useQueryClient()

  // Inisialisasi form dengan react-hook-form dan zodResolver
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: module?.title || '',
      description: module?.description || '',
      status: module?.status || ModuleStatus.DRAFT,
    },
  })

  // Mutation untuk membuat modul baru
  const createMutation = useMutation({
    mutationFn: (data: ModuleFormValues) => {
      // Konversi ModuleStatus ke string sesuai dengan tipe yang diharapkan API
      return createModule({
        title: data.title,
        description: data.description || '',
        status: data.status.toLowerCase() as 'published' | 'draft' | 'archived',
      })
    },
    onSuccess: () => {
      toast.success('Modul berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      onSuccess()
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyimpan modul: ${error.message}`)
    },
  })

  // Mutation untuk memperbarui modul
  const updateMutation = useMutation({
    mutationFn: (data: ModuleFormValues) => {
      if (!module?.id) throw new Error('ID modul tidak ditemukan')
      // Konversi ModuleStatus ke string sesuai dengan tipe yang diharapkan API
      return updateModule(module.id, {
        title: data.title,
        description: data.description || '',
        status: data.status.toLowerCase() as 'published' | 'draft' | 'archived',
      })
    },
    onSuccess: () => {
      toast.success('Modul berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      onSuccess()
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui modul: ${error.message}`)
    },
  })

  // Handler untuk submit form
  const onSubmit = (data: ModuleFormValues) => {
    if (mode === 'create') {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate(data)
    }
  }

  return {
    form,
    onSubmit,
    isLoading: createMutation.isPending || updateMutation.isPending,
  }
}

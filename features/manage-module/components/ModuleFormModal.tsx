'use client'

import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Module, ModuleStatus } from '@/features/manage-module/types'
import { useModuleMutation } from '@/features/manage-module/hooks/useModuleMutation'
import { showErrorNotification } from './ErrorNotifier'

// Schema validasi untuk form
const moduleSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Judul harus minimal 3 karakter' })
    .max(100, { message: 'Judul maksimal 100 karakter' }),
  description: z
    .string()
    .min(10, { message: 'Deskripsi harus minimal 10 karakter' })
    .max(500, { message: 'Deskripsi maksimal 500 karakter' }),
  status: z.nativeEnum(ModuleStatus, {
    errorMap: () => ({ message: 'Status tidak valid' }),
  }),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

interface ModuleFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  module?: Module
}

export default function ModuleFormModal({
  isOpen,
  onClose,
  mode,
  module,
}: ModuleFormModalProps) {
  const { createModuleMutation, updateModuleMutation } = useModuleMutation()

  // Inisialisasi form dengan react-hook-form dan zod validator
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: '',
      description: '',
      status: ModuleStatus.DRAFT,
    },
  })

  // Reset form dan isi dengan data modul jika dalam mode edit
  useEffect(() => {
    if (mode === 'edit' && module) {
      form.reset({
        title: module.title,
        description: module.description || '',
        status: module.status,
      })
    } else if (mode === 'create') {
      form.reset({
        title: '',
        description: '',
        status: ModuleStatus.DRAFT,
      })
    }
  }, [form, mode, module, isOpen])

  // Tangani error
  useEffect(() => {
    if (createModuleMutation.error) {
      showErrorNotification(createModuleMutation.error)
    }
  }, [createModuleMutation.error])

  useEffect(() => {
    if (updateModuleMutation.error) {
      showErrorNotification(updateModuleMutation.error)
    }
  }, [updateModuleMutation.error])

  // Handler submit form
  const onSubmit = (values: ModuleFormValues) => {
    if (mode === 'create') {
      createModuleMutation.mutate(values, {
        onSuccess: () => {
          onClose()
          form.reset()
        },
      })
    } else if (mode === 'edit' && module) {
      updateModuleMutation.mutate(
        {
          id: module.id,
          ...values,
        },
        {
          onSuccess: () => {
            onClose()
          },
        }
      )
    }
  }

  const isSubmitting =
    createModuleMutation.isPending || updateModuleMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700/50 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Tambah Modul Baru' : 'Edit Modul'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Judul Modul</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan judul modul"
                      className="bg-slate-800/50 border-slate-700 text-slate-200"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Masukkan deskripsi modul"
                      className="min-h-[120px] bg-slate-800/50 border-slate-700 text-slate-200"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                        <SelectValue placeholder="Pilih status modul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem
                        value={ModuleStatus.DRAFT}
                        className="text-slate-200"
                      >
                        Draft
                      </SelectItem>
                      <SelectItem
                        value={ModuleStatus.ACTIVE}
                        className="text-slate-200"
                      >
                        Aktif
                      </SelectItem>
                      <SelectItem
                        value={ModuleStatus.ARCHIVED}
                        className="text-slate-200"
                      >
                        Diarsipkan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isSubmitting
                  ? 'Menyimpan...'
                  : mode === 'create'
                    ? 'Tambah'
                    : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

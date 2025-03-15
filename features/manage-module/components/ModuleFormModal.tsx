'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { Module, ModuleStatus } from '../types'
import { useCreateModule, useUpdateModule } from '../hooks/useModuleMutations'

// Schema untuk validasi form
const moduleFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  status: z.nativeEnum(ModuleStatus, {
    errorMap: () => ({ message: 'Status harus dipilih' }),
  }),
})

type ModuleFormValues = z.infer<typeof moduleFormSchema>

interface ModuleFormModalProps {
  isOpen: boolean
  onClose: () => void
  module?: Module // Jika ada, berarti mode edit
}

export function ModuleFormModal({
  isOpen,
  onClose,
  module,
}: ModuleFormModalProps) {
  const isEditMode = !!module
  const title = isEditMode ? 'Edit Modul' : 'Tambah Modul Baru'
  
  // Gunakan mutation hooks
  const createModule = useCreateModule()
  const updateModule = useUpdateModule()
  
  // Setup form dengan react-hook-form dan zod resolver
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: module?.title || '',
      description: module?.description || '',
      status: module?.status || 'DRAFT' as ModuleStatus,
    },
  })
  
  // Handle form submission
  const onSubmit = async (values: ModuleFormValues) => {
    try {
      if (isEditMode && module) {
        await updateModule.mutateAsync({
          id: module.id,
          ...values,
          updatedBy: 'current-user-id', // Dalam implementasi nyata, ambil dari context auth
        })
      } else {
        await createModule.mutateAsync({
          ...values,
          createdBy: 'current-user-id', // Dalam implementasi nyata, ambil dari context auth
        })
      }
      
      // Reset form dan tutup modal jika berhasil
      form.reset()
      onClose()
    } catch (error) {
      // Error handling dilakukan di mutation hooks
      console.error('Error submitting form:', error)
    }
  }
  
  // Cek apakah sedang loading
  const isLoading = createModule.isPending || updateModule.isPending
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Edit informasi modul akademik.'
              : 'Tambahkan modul akademik baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Modul</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan judul modul" {...field} />
                  </FormControl>
                  <FormDescription>
                    Judul modul harus unik dan deskriptif.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi modul"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Deskripsi singkat tentang modul ini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status modul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ModuleStatus.DRAFT}>Draft</SelectItem>
                      <SelectItem value={ModuleStatus.ACTIVE}>Aktif</SelectItem>
                      <SelectItem value={ModuleStatus.ARCHIVED}>
                        Diarsipkan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Status menentukan visibilitas modul.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Modul'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useModulePageCRUDContext } from '../../../context/ModulePageCRUDContext'
import { toast } from 'sonner'

// Schema for create page form validation
const createPageSchema = z.object({
  title: z.string().min(5, 'Judul harus minimal 5 karakter'),
})

type CreatePageFormValues = z.infer<typeof createPageSchema>

interface CreatePageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePageDialog({
  open,
  onOpenChange,
}: CreatePageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { moduleId, createPage } = useModulePageCRUDContext()

  // Initialize the form
  const form = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      title: '',
    },
  })

  // Handle form submission
  const onSubmit = async (values: CreatePageFormValues) => {
    if (!moduleId) return

    try {
      setIsSubmitting(true)

      // Create new page with title and default content
      await createPage({
        title: values.title,
        moduleId,
        order: 1000, // Will be auto-sorted on backend
        blocks: [
          {
            type: 'text',
            content: '<p>Halaman baru Anda</p>',
          },
        ],
      })

      // Close dialog and reset form
      onOpenChange(false)
      form.reset()

      // Show success message
      toast.success('Halaman berhasil dibuat')
    } catch (error) {
      console.error('Error creating page:', error)
      toast.error('Gagal membuat halaman. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1f1f21] text-[#e3e4f2] border-[#3b3b3b]">
        <DialogHeader>
          <DialogTitle>Tambah Halaman Baru</DialogTitle>
          <DialogDescription className="text-[#96999e]">
            Buat halaman baru dalam modul ini.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Halaman</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan judul halaman"
                      className="bg-[#1a1a1c] border-[#3b3b3b] focus:border-[#669df1]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#3b3b3b]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#669df1] hover:bg-[#669df1]/90"
              >
                {isSubmitting ? 'Membuat...' : 'Tambah Halaman'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

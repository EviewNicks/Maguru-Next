// features/manage-module/components/ModulePageFormModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TheoryEditor } from './editors/TheoryEditor'
import { CodeEditor } from './editors/CodeEditor'
import { ModulePage } from '../types'
import { ModulePageCreateSchema, ModulePageUpdateSchema } from '../schemas/modulePageSchema'

interface ModulePageFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  initialData?: ModulePage
  isLoading?: boolean
}

export function ModulePageFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ModulePageFormModalProps) {
  const [activeTab, setActiveTab] = useState<string>('edit')
  const isEditing = !!initialData

  // Buat schema berdasarkan apakah ini form edit atau tambah
  const formSchema = isEditing ? ModulePageUpdateSchema : ModulePageCreateSchema

  // Setup form dengan react-hook-form dan zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || 'theory',
      content: initialData?.content || '',
      language: initialData?.language || 'javascript',
    },
  })

  // Reset form ketika initialData berubah
  useEffect(() => {
    if (open) {
      form.reset({
        type: initialData?.type || 'theory',
        content: initialData?.content || '',
        language: initialData?.language || 'javascript',
      })
    }
  }, [form, initialData, open])

  // Ambil nilai tipe konten saat ini
  const contentType = form.watch('type')

  // Handler untuk submit form
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Halaman' : 'Tambah Halaman Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Konten</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      // Reset language jika tipe berubah ke theory
                      if (value === 'theory') {
                        form.setValue('language', undefined)
                      } else {
                        form.setValue('language', 'javascript')
                      }
                    }}
                    defaultValue={field.value}
                    disabled={isEditing} // Tidak bisa mengubah tipe jika sedang edit
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe konten" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="theory">Teori</SelectItem>
                      <SelectItem value="code">Kode</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="pt-4">
                {contentType === 'theory' ? (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konten Teori</FormLabel>
                        <FormControl>
                          <TheoryEditor
                            content={field.value}
                            onChange={field.onChange}
                            maxLength={5000}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bahasa Pemrograman</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih bahasa" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                                <SelectItem value="html">HTML</SelectItem>
                                <SelectItem value="css">CSS</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="csharp">C#</SelectItem>
                                <SelectItem value="php">PHP</SelectItem>
                                <SelectItem value="ruby">Ruby</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Konten Kode</FormLabel>
                          <FormControl>
                            <CodeEditor
                              content={field.value}
                              language={form.getValues('language') || 'javascript'}
                              onChange={field.onChange}
                              onLanguageChange={(lang) => form.setValue('language', lang)}
                              maxLength={2000}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="preview" className="pt-4">
                <div className="border rounded-md p-4 min-h-[300px] bg-background">
                  {contentType === 'theory' ? (
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: form.getValues('content') }}
                    />
                  ) : (
                    <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                      <code>{form.getValues('content')}</code>
                    </pre>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

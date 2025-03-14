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
import { ContentType, ModulePageFormModalProps } from '../types'
import { ModulePageCreateSchema, ModulePageUpdateSchema, ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'
import { useCreateModulePage, useUpdateModulePage } from '../hooks/useModulePageMutations'

export function ModulePageFormModal({
  open,
  onOpenChange,
  moduleId,
  contentType: initialContentType,
  onSubmit,
  initialData,
  isLoading = false,
}: ModulePageFormModalProps) {
  const [activeTab, setActiveTab] = useState<string>('edit')
  const isEditing = !!initialData
  
  const createMutation = useCreateModulePage(moduleId)
  const updateMutation = useUpdateModulePage(moduleId)
  
  // Buat schema berdasarkan apakah ini form edit atau tambah
  const formSchema = isEditing ? ModulePageUpdateSchema : ModulePageCreateSchema
  
  // Setup form dengan react-hook-form dan zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing && initialData
      ? {
          // Untuk form edit, gunakan nilai dari initialData
          type: initialData.type,
          content: initialData.content || '',
          ...(isModulePageTypeKode(initialData.type) && 'language' in initialData ? { 
            language: initialData.language as ProgrammingLanguage 
          } : {})
        }
      : {
          // Untuk form tambah, gunakan nilai default berdasarkan initialContentType
          type: initialContentType === ContentType.THEORY ? ModulePageType.TEORI : ModulePageType.KODE,
          content: '',
          ...(initialContentType === ContentType.CODE ? { 
            language: ProgrammingLanguage.JAVASCRIPT 
          } : {})
        },
  })

  // Reset form ketika modal dibuka/ditutup atau initialData berubah
  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        // Reset form untuk edit
        form.reset({
          type: initialData.type,
          content: initialData.content || '',
          ...(isModulePageTypeKode(initialData.type) && 'language' in initialData ? { 
            language: initialData.language 
          } : {})
        })
      } else {
        // Reset form untuk tambah
        const defaultType = initialContentType === ContentType.CODE 
          ? ModulePageType.KODE 
          : ModulePageType.TEORI;
          
        if (defaultType === ModulePageType.KODE) {
          form.reset({
            type: ModulePageType.KODE,
            content: '',
            language: ProgrammingLanguage.JAVASCRIPT
          });
        } else {
          form.reset({
            type: ModulePageType.TEORI,
            content: ''
          });
        }
      }
    }
  }, [form, initialData, open, initialContentType, isEditing])

  // Ambil nilai tipe konten saat ini
  const contentTypeValue = form.watch('type')

  // Handler untuk submit form
  const handleSubmit = form.handleSubmit((values) => {
    if (onSubmit) {
      onSubmit(values);
      return;
    }
    
    if (isEditing && initialData) {
      // Update halaman yang sudah ada
      updateMutation.mutate({
        id: initialData.id,
        data: {
          content: values.content || '',
          ...(isModulePageTypeKode(values.type) && 'language' in values ? { 
            language: values.language 
          } : {})
        },
        version: initialData.version || 1
      }, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
    } else {
      // Buat halaman baru
      const createData = {
        moduleId,
        type: values.type,
        content: values.content || '',
        order: 0, // Default order untuk halaman baru
        ...(isModulePageTypeKode(values.type) && 'language' in values ? { 
          language: values.language 
        } : {})
      };
      
      createMutation.mutate(createData, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Halaman' : 'Tambah Halaman Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Konten</FormLabel>
                  <Select
                    onValueChange={(value: ModulePageType) => {
                      field.onChange(value);
                      // Reset language jika tipe berubah ke teori
                      if (value === ModulePageType.TEORI) {
                        form.setValue('language', undefined);
                      } else {
                        form.setValue('language', ProgrammingLanguage.JAVASCRIPT);
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
                      <SelectItem value={ModulePageType.TEORI}>Teori</SelectItem>
                      <SelectItem value={ModulePageType.KODE}>Kode</SelectItem>
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
                {contentTypeValue === ModulePageType.TEORI ? (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konten Teori</FormLabel>
                        <FormControl>
                          <TheoryEditor
                            content={field.value || ''}
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
                                <SelectItem value={ProgrammingLanguage.JAVASCRIPT}>JavaScript</SelectItem>
                                <SelectItem value={ProgrammingLanguage.HTML}>HTML</SelectItem>
                                <SelectItem value={ProgrammingLanguage.CSS}>CSS</SelectItem>
                                <SelectItem value={ProgrammingLanguage.PYTHON}>Python</SelectItem>
                                <SelectItem value={ProgrammingLanguage.JAVA}>Java</SelectItem>
                                <SelectItem value={ProgrammingLanguage.CSHARP}>C#</SelectItem>
                                <SelectItem value={ProgrammingLanguage.PHP}>PHP</SelectItem>
                                <SelectItem value={ProgrammingLanguage.RUBY}>Ruby</SelectItem>
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
                              content={field.value || ''}
                              language={form.getValues('language') as string || ProgrammingLanguage.JAVASCRIPT}
                              onChange={field.onChange}
                              onLanguageChange={(lang: string) => form.setValue('language', lang as ProgrammingLanguage)}
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
                  {contentTypeValue === ModulePageType.TEORI ? (
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: form.getValues('content') || '' }}
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
              <Button type="submit" disabled={isPending}>
                {isEditing ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function isModulePageTypeKode(type: ModulePageType): type is ModulePageType.KODE {
  return type === ModulePageType.KODE;
}

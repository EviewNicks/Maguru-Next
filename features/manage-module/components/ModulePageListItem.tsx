// features/manage-module/components/ModulePageListItem.tsx
'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Pencil, Trash2, Eye } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ModulePageFormModal } from './ModulePageFormModal'
import { useUpdateModulePage, useDeleteModulePage } from '../hooks/useModulePageMutations'
import { ModulePage, ContentType } from '../types'
import { ModulePageType, ModulePageUpdateSchema } from '../schemas/modulePageSchema'
import { z } from 'zod'

interface ModulePageListItemProps {
  page: ModulePage
  moduleId: string
}

export function ModulePageListItem({ page, moduleId }: ModulePageListItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const updateMutation = useUpdateModulePage(moduleId)
  const deleteMutation = useDeleteModulePage(moduleId)
  
  // Setup sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  // Handler untuk edit halaman
  const handleEditPage = (data: z.infer<typeof ModulePageUpdateSchema>) => {
    updateMutation.mutate({
      id: page.id,
      data: {
        content: data.content,
        ...(data.type === ModulePageType.KODE && 'language' in data && data.language ? { language: data.language } : {}),
      },
      version: page.version,
    }, {
      onSuccess: () => {
        setIsEditModalOpen(false)
      }
    })
  }
  
  // Handler untuk hapus halaman
  const handleDeletePage = () => {
    deleteMutation.mutate(page.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
      }
    })
  }
  
  // Tentukan tipe konten untuk tampilan
  const contentType = page.type === ModulePageType.KODE ? ContentType.CODE : ContentType.THEORY
  
  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="relative border border-border"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <CardHeader className="pl-10 pb-2">
        <div className="flex items-center justify-between">
          <Badge variant={page.type === ModulePageType.KODE ? 'default' : 'outline'}>
            {page.type === ModulePageType.KODE ? 'Kode' : 'Teori'}
            {page.type === ModulePageType.KODE && page.language && ` - ${page.language}`}
          </Badge>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="max-h-20 overflow-hidden text-ellipsis">
          {page.type === ModulePageType.KODE ? (
            <pre className="text-xs">
              <code>{page.content}</code>
            </pre>
          ) : (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: page.content || '' }}
            />
          )}
        </div>
      </CardContent>
      
      <div className="pt-2 pb-2 px-6">
        <Button variant="outline" size="sm" className="ml-auto">
          <Eye className="mr-2 h-4 w-4" />
          Pratinjau
        </Button>
      </div>
      
      {/* Modal Edit */}
      <ModulePageFormModal
        isOpen={isEditModalOpen}
        onClose={setIsEditModalOpen}
        moduleId={moduleId}
        contentType={contentType}
        onSubmit={handleEditPage}
        initialData={{
          ...page,
          language: page.language || null
        }}
        isLoading={updateMutation.isPending}
      />
      
      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Halaman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus halaman ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

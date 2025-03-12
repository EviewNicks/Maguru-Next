// features/manage-module/components/ModulePageListItem.tsx
'use client'

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ModulePage } from '../types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Badge } from '@/components/ui/badge'
import { ModulePageFormModal } from './ModulePageFormModal'
import { useUpdateModulePage, useDeleteModulePage } from '../hooks/useModulePageMutations'
import { GripVertical, MoreVertical, Pencil, Trash, Code, FileText } from 'lucide-react'

interface ModulePageListItemProps {
  page: ModulePage
  moduleId: string
}

export function ModulePageListItem({ page, moduleId }: ModulePageListItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Setup untuk drag-and-drop dengan @dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Mutations
  const updateMutation = useUpdateModulePage(moduleId)
  const deleteMutation = useDeleteModulePage(moduleId)

  // Handler untuk edit halaman
  const handleEditPage = (data: any) => {
    updateMutation.mutate(
      {
        id: page.id,
        data,
        version: page.version,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
        },
      }
    )
  }

  // Handler untuk hapus halaman
  const handleDeletePage = () => {
    deleteMutation.mutate(page.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false)
      },
    })
  }

  // Format tanggal
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Potong konten untuk preview
  const getContentPreview = () => {
    if (page.type === 'theory') {
      // Hapus tag HTML untuk preview
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = page.content
      const textContent = tempDiv.textContent || tempDiv.innerText
      return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent
    } else {
      return page.content.length > 100 ? page.content.substring(0, 100) + '...' : page.content
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`${isDragging ? 'border-primary' : ''}`}
      >
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex items-center">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab p-1 mr-2 text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center">
                {page.type === 'theory' ? (
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                ) : (
                  <Code className="h-4 w-4 mr-2 text-green-500" />
                )}
                {page.type === 'theory' ? 'Teori' : 'Kode'} #{page.order + 1}
              </CardTitle>
              <CardDescription className="text-xs">
                Diperbarui: {formatDate(page.updatedAt)}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {page.type === 'code' && (
              <Badge variant="outline" className="text-xs">
                {page.language}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-sm text-muted-foreground line-clamp-2">
            {getContentPreview()}
          </div>
        </CardContent>
      </Card>

      {/* Modal Edit */}
      <ModulePageFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditPage}
        initialData={page}
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
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

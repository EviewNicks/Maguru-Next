'use client'

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
import { Loader2 } from 'lucide-react'
import { useDeleteModule } from '../hooks/useModuleMutations'
import { Module } from '../types'
import DOMPurify from 'dompurify'

interface DeleteModuleDialogProps {
  isOpen: boolean
  onClose: () => void
  module: Module
}

export function DeleteModuleDialog({
  isOpen,
  onClose,
  module,
}: DeleteModuleDialogProps) {
  const deleteModule = useDeleteModule()
  
  // Sanitasi judul modul untuk mencegah XSS
  const sanitizedTitle = DOMPurify.sanitize(module.title)
  
  const handleDelete = async () => {
    try {
      await deleteModule.mutateAsync(module.id)
      onClose()
    } catch (error) {
      // Error handling dilakukan di mutation hook
      console.error('Error deleting module:', error)
    }
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Modul</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus modul &quot;
            <span dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
            &quot;? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteModule.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={deleteModule.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteModule.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

'use client'

import { useState } from 'react'
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
import { useModulePageCRUDContext } from '../../../context/ModulePageCRUDContext'
import { toast } from 'sonner'

interface DeletePageConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: string
  pageTitle: string
}

export function DeletePageConfirmation({
  open,
  onOpenChange,
  pageId,
  pageTitle,
}: DeletePageConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deletePage } = useModulePageCRUDContext()

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)

      const success = await deletePage(pageId)

      if (success) {
        toast.success('Halaman berhasil dihapus')
      } else {
        toast.error('Gagal menghapus halaman')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error('Terjadi kesalahan saat menghapus halaman')
    } finally {
      setIsDeleting(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1f1f21] text-[#e3e4f2] border-[#3b3b3b]">
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Hapus Halaman</AlertDialogTitle>
          <AlertDialogDescription className="text-[#96999e]">
            Anda yakin ingin menghapus halaman{' '}
            <span className="font-medium text-[#e3e4f2]">
              &quot;{pageTitle}&quot;
            </span>
            ?
            <br />
            <br />
            Tindakan ini tidak dapat dibatalkan dan semua konten dalam halaman
            ini akan dihapus secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="bg-transparent border-[#3b3b3b] text-[#e3e4f2] hover:bg-[#2a2a2c]"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

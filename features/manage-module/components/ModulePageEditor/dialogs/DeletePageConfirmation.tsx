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
import { useQueryClient } from '@tanstack/react-query'
import { logger } from '../../../services/logger'

interface DeletePageConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: string
  pageTitle: string
  onForceUpdate?: () => void
}

export function DeletePageConfirmation({
  open,
  onOpenChange,
  pageId,
  pageTitle,
  onForceUpdate,
}: DeletePageConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deletePage, moduleId, pages, activePage, handleSelectPage, refetch } =
    useModulePageCRUDContext()
  const queryClient = useQueryClient()

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      logger.debug('DeletePageConfirmation', `Deleting page: ${pageId}`)

      // Check if we're deleting the active page
      const currentlyActive = activePage?.id === pageId
      let pageToNavigateTo = null

      // Store pages information before deletion for later use
      const pagesBeforeDeletion = [...pages]

      // If we're deleting the active page, find another page to navigate to
      if (
        currentlyActive &&
        Array.isArray(pagesBeforeDeletion) &&
        pagesBeforeDeletion.length > 1
      ) {
        pageToNavigateTo =
          pagesBeforeDeletion.find((p) => p.id !== pageId) || null
      }

      // Delete the page
      const success = await deletePage(pageId)

      if (success) {
        logger.debug(
          'DeletePageConfirmation',
          `Page deleted successfully. Updating cache and data.`
        )

        // Use a multi-step approach to ensure the cache is properly updated
        if (queryClient && moduleId) {
          // Step 1: Invalidate all related queries
          await queryClient.invalidateQueries({
            queryKey: ['modulePages'],
            refetchType: 'all',
          })

          // Step 2: Remove specific page from cache if it exists
          queryClient.removeQueries({ queryKey: ['modulePage', pageId] })

          // Step 3: Force refetch the module pages data
          await queryClient.refetchQueries({
            queryKey: ['modulePages', moduleId],
            exact: true,
          })

          // Step 4: Directly use the context's refetch function
          await refetch()
        }

        // Trigger force update immediately before navigation to ensure sidebar shows updated data
        if (onForceUpdate) {
          logger.debug('DeletePageConfirmation', 'Triggering force update')
          onForceUpdate()
        }

        // If we have a page to navigate to and it was the active page
        if (pageToNavigateTo && currentlyActive) {
          logger.debug(
            'DeletePageConfirmation',
            `Navigating to alternative page: ${pageToNavigateTo.id}`
          )

          // Use setTimeout to allow the data to be refreshed first
          setTimeout(() => {
            handleSelectPage(pageToNavigateTo)
          }, 300)
        }

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
            onClick={(e) => {
              e.preventDefault() // Prevent default to handle it manually
              handleConfirmDelete()
            }}
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

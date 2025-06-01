'use client'

import React, { useEffect, useRef } from 'react'
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

interface UnsavedChangesDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

/**
 * Komponen dialog untuk memperingatkan pengguna sebelum meninggalkan
 * halaman dengan perubahan yang belum disimpan
 */
export function UnsavedChangesDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title = 'Perubahan Belum Disimpan',
  description = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini? Perubahan yang belum disimpan mungkin hilang.',
  confirmText = 'Ya, Tinggalkan Halaman',
  cancelText = 'Tetap di Halaman Ini',
}: UnsavedChangesDialogProps) {
  // Ref untuk melacak apakah dialog ditutup karena konfirmasi
  const confirmedRef = useRef(false)

  // Reset confirmed state ketika dialog dibuka
  useEffect(() => {
    if (isOpen) {
      confirmedRef.current = false
    }
  }, [isOpen])

  // Handle konfirmasi
  const handleConfirm = () => {
    confirmedRef.current = true
    onConfirm()
    onClose()
  }

  // Handle close (jika pengguna mengklik di luar dialog)
  const handleClose = () => {
    if (!confirmedRef.current) {
      onCancel()
    }
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Hook untuk menambahkan penanganan beforeunload untuk mencegah navigasi
 * dengan perubahan yang belum disimpan
 *
 * @param hasUnsavedChanges - Boolean yang menunjukkan apakah ada perubahan yang belum disimpan
 * @param message - Pesan konfirmasi (hanya bekerja di beberapa browser)
 */
export function useUnsavedChangesWarning(
  hasUnsavedChanges: boolean,
  message = 'Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?'
) {
  useEffect(() => {
    // Hanya tambahkan listener jika ada perubahan yang belum disimpan
    if (!hasUnsavedChanges) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Modern browsers memiliki pesan default dan mengabaikan string yang dikembalikan
      // Tetapi kita tetap atur pesan untuk backwards compatibility
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, message])
}

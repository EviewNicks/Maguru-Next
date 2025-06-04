'use client'

import React, { useEffect } from 'react'
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
import { useModuleDraftPageContext } from '../../context/ModuleDraftPageContext'
import { SaveIcon, XIcon } from 'lucide-react'

/**
 * Dialog konfirmasi yang muncul saat pengguna mencoba menavigasi
 * dengan perubahan yang belum disimpan
 */
export function UnsavedChangesDialog() {
  const { showUnsavedChangesDialog, confirmNavigation, cancelNavigation } =
    useModuleDraftPageContext()

  return (
    <AlertDialog open={showUnsavedChangesDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Perubahan belum tersimpan</AlertDialogTitle>
          <AlertDialogDescription>
            Anda memiliki perubahan yang belum tersimpan. Apa yang ingin Anda
            lakukan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelNavigation}>
            <XIcon className="h-4 w-4 mr-2" />
            Kembali ke editor
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => confirmNavigation()}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Simpan dan lanjutkan
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

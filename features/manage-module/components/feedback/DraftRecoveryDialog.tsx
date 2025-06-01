'use client'

import React from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
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
import { Button } from '@/components/ui/button'

interface DraftRecoveryDialogProps {
  isOpen: boolean
  onClose: () => void
  onRecover: () => void
  onDiscard: () => void
  draftSavedAt?: Date | null
  editorName?: string
}

/**
 * Komponen dialog untuk menampilkan opsi pemulihan draft
 * ketika pengguna mengunjungi halaman yang memiliki draft
 * yang belum dipublikasikan
 */
export function DraftRecoveryDialog({
  isOpen,
  onClose,
  onRecover,
  onDiscard,
  draftSavedAt,
  editorName,
}: DraftRecoveryDialogProps) {
  // Format waktu terakhir disimpan
  const formattedTime = React.useMemo(() => {
    if (!draftSavedAt) return ''

    return format(draftSavedAt, 'dd MMMM yyyy, HH:mm:ss', {
      locale: id,
    })
  }, [draftSavedAt])

  // Handle recover
  const handleRecover = () => {
    onRecover()
    onClose()
  }

  // Handle discard
  const handleDiscard = () => {
    onDiscard()
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Pemulihan Draft</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Ditemukan draft yang belum dipublikasikan untuk halaman ini.
                {draftSavedAt && (
                  <>
                    {' '}
                    Draft terakhir disimpan pada:
                    <strong className="block mt-1 text-foreground">
                      {formattedTime}
                    </strong>
                  </>
                )}
                {editorName && (
                  <span className="block mt-1">
                    Disunting oleh: <strong>{editorName}</strong>
                  </span>
                )}
              </p>
              <p>
                Apakah Anda ingin melanjutkan mengedit draft ini atau
                menggunakan versi yang telah dipublikasikan?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row">
          <AlertDialogCancel
            onClick={handleDiscard}
            className="sm:mr-auto sm:w-auto w-full"
          >
            Gunakan Versi Publikasi
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRecover}
            className="bg-primary hover:bg-primary/90"
          >
            Pulihkan Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Komponen dialog untuk menampilkan opsi pemulihan setelah crash browser
 * atau ketika browser tiba-tiba ditutup
 */
export function BrowserCrashRecoveryDialog({
  isOpen,
  onClose,
  onRecover,
  draftSavedAt,
}: {
  isOpen: boolean
  onClose: () => void
  onRecover: () => void
  draftSavedAt?: Date | null
}) {
  // Format waktu terakhir disimpan
  const formattedTime = React.useMemo(() => {
    if (!draftSavedAt) return 'tidak diketahui'

    return format(draftSavedAt, 'dd MMMM yyyy, HH:mm:ss', {
      locale: id,
    })
  }, [draftSavedAt])

  // Handle recover
  const handleRecover = () => {
    onRecover()
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Pemulihan Konten Otomatis</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Sepertinya browser Anda tertutup secara tidak terduga saat
                terakhir kali Anda mengedit halaman ini. Kami telah menyimpan
                draft secara otomatis.
              </p>
              <p>
                Draft terakhir disimpan pada:{' '}
                <strong className="text-foreground">{formattedTime}</strong>
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-auto sm:w-auto w-full"
          >
            Tutup
          </Button>
          <AlertDialogAction
            onClick={handleRecover}
            className="bg-primary hover:bg-primary/90"
          >
            Pulihkan Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useModuleDraftPageContext } from '../../context/ModuleDraftPageContext'
import { Loader2 } from 'lucide-react'

/**
 * Dialog pemulihan draft yang muncul saat ada draft yang tersedia
 * untuk halaman yang sedang diedit
 */
export function DraftRecoveryDialog() {
  const {
    showRecoveryDialog,
    draftMetadata,
    handleRecoverDraft,
    handleDiscardDraft,
    closeRecoveryDialog,
    isDraftLoading,
  } = useModuleDraftPageContext()

  if (isDraftLoading) {
    return (
      <Dialog open={showRecoveryDialog}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">
              Memeriksa draft tersedia...
            </span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={showRecoveryDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Draft tersedia</DialogTitle>
          <DialogDescription>
            Ada draft yang belum dipublikasikan untuk halaman ini.
            {draftMetadata.lastEditBy && (
              <span className="block mt-1">
                Terakhir diedit oleh: {draftMetadata.lastEditBy}
              </span>
            )}
            {draftMetadata.formattedDraftTime && (
              <span className="block mt-1">
                Waktu penyimpanan: {draftMetadata.formattedDraftTime}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={closeRecoveryDialog}
            className="sm:order-1"
          >
            Gunakan versi terpublikasi
          </Button>

          <div className="flex gap-2 sm:order-2">
            <Button variant="destructive" onClick={handleDiscardDraft}>
              Hapus draft
            </Button>
            <Button variant="default" onClick={handleRecoverDraft}>
              Pulihkan draft
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

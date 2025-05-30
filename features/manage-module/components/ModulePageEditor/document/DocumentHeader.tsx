import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronDown,
  Link,
  MessageSquare,
  MoreHorizontal,
  Share2,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  useModulePageCRUDContext,
  SaveStatus,
} from '../../../context/ModulePageCRUDContext'
import { toast } from 'sonner'
import { showErrorNotification } from '../../../components/ErrorNotifier'
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

interface DocumentHeaderProps {
  isLoading?: boolean
}

export default function DocumentHeader({
  isLoading = false,
}: DocumentHeaderProps) {
  // Mengambil data dan fungsi dari context
  const {
    activePage,
    deletePage,
    saveStatus: contextSaveStatus,
    savePage,
  } = useModulePageCRUDContext()

  // Ref untuk mendeteksi apakah perubahan judul sedang dalam proses penyimpanan
  const isSavingRef = useRef(false)

  // Gunakan data dari context langsung
  const title = activePage?.title || 'Untitled Page'

  // State local
  const [localTitle, setLocalTitle] = useState<string>(title)
  const [titleSaveStatus, setTitleSaveStatus] = useState<SaveStatus>(
    contextSaveStatus || 'saved'
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Gunakan pageId dari activePage context
  const effectivePageId = activePage ? activePage.id : undefined

  // Sync title dari context saat activePage berubah
  useEffect(() => {
    if (activePage && activePage.title !== localTitle) {
      setLocalTitle(activePage.title || '')
    }
  }, [activePage])

  // Sync save status dari context
  useEffect(() => {
    if (contextSaveStatus && contextSaveStatus !== titleSaveStatus) {
      setTitleSaveStatus(contextSaveStatus)
    }
  }, [contextSaveStatus, titleSaveStatus])

  // Handler untuk membuka dialog konfirmasi hapus
  const handleCloseDraft = () => {
    if (effectivePageId) {
      setShowDeleteDialog(true)
    }
  }

  // Handler untuk konfirmasi hapus halaman
  const handleDeleteConfirm = async () => {
    if (!effectivePageId) return

    try {
      setIsDeleting(true)
      await deletePage(effectivePageId)
      setShowDeleteDialog(false)
      // Navigasi ke halaman lain akan ditangani oleh context
      // karena kita sudah mengimplementasikan logika di deletePage
      toast.success('Halaman berhasil dihapus')
    } catch (error) {
      console.error('Error deleting page:', error)
      showErrorNotification(error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle title input change - hanya mengubah state lokal tanpa trigger save
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      setLocalTitle(newTitle)
      setIsEditing(true)

      // Set status ke unsaved untuk feedback visual
      setTitleSaveStatus('unsaved')
    },
    []
  )

  // Fungsi untuk menyimpan judul
  const handleTitleSave = useCallback(async () => {
    // Jika tidak ada pageId, tidak sedang dalam mode editing, atau sedang dalam proses saving, skip
    if (!effectivePageId || !isEditing || isSavingRef.current) return

    // Validasi judul
    if (localTitle.trim().length < 5) {
      toast.error('Judul harus terdiri dari minimal 5 karakter')
      setTitleSaveStatus('error')
      return
    }

    try {
      // Set flag dan status
      isSavingRef.current = true
      setTitleSaveStatus('saving')

      // Panggil savePage dari context
      await savePage({
        pageId: effectivePageId,
        title: localTitle,
      })

      // Update status dan reset flag
      setTitleSaveStatus('saved')
      setIsEditing(false)
      toast.success('Judul berhasil disimpan')
    } catch (error) {
      console.error('Error saving title:', error)
      setTitleSaveStatus('error')

      // Tampilkan error notification dengan opsi retry
      showErrorNotification(error, {
        retryFn: () => handleTitleSave(),
      })
    } finally {
      isSavingRef.current = false
    }
  }, [effectivePageId, isEditing, localTitle, savePage])

  // Handler untuk keydown event - trigger save saat Enter ditekan
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.currentTarget.blur() // Remove focus
        handleTitleSave()
      }
    },
    [handleTitleSave]
  )

  // Handler untuk blur event - trigger save saat input kehilangan fokus
  const handleBlur = useCallback(() => {
    if (isEditing) {
      handleTitleSave()
    }
  }, [isEditing, handleTitleSave])

  // Render status save yang lebih informatif
  const renderSaveStatus = () => {
    switch (titleSaveStatus) {
      case 'saved':
        return (
          <div
            className="flex items-center text-[#a9abaf] mr-2"
            aria-live="polite"
          >
            <CheckCircle
              className="h-3 w-3 mr-1 text-green-500"
              aria-hidden="true"
            />
            <span>Tersimpan</span>
          </div>
        )
      case 'saving':
        return (
          <div
            className="flex items-center text-[#a9abaf] mr-2"
            aria-live="polite"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" aria-hidden="true" />
            <span>Menyimpan...</span>
          </div>
        )
      case 'unsaved':
        return (
          <div
            className="flex items-center text-[#a9abaf] mr-2"
            aria-live="polite"
          >
            <Clock className="h-3 w-3 mr-1 text-amber-500" aria-hidden="true" />
            <span>Belum tersimpan</span>
          </div>
        )
      case 'error':
        return (
          <div
            className="flex items-center text-red-400 mr-2"
            aria-live="assertive"
          >
            <AlertCircle className="h-3 w-3 mr-1" aria-hidden="true" />
            <span>Gagal menyimpan</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="flex items-center px-4 h-12 border-b border-[#3b3b3b]"
      role="region"
      aria-label="Header dokumen"
    >
      <Button
        variant="ghost"
        size="icon"
        className="mr-1"
        aria-label="Menu utama"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </Button>

      {/* Title Input */}
      <div className="w-[280px] mr-3">
        <Input
          value={localTitle}
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Untitled Page"
          className="border-0 bg-transparent h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-[#e3e4f2]"
          aria-label="Judul halaman"
          disabled={isLoading || titleSaveStatus === 'saving'}
        />
      </div>

      {/* Save Status */}
      {renderSaveStatus()}

      <Avatar className="h-6 w-6 bg-[#669df1] mr-2">
        <AvatarFallback className="bg-[#669df1] text-white text-xs">
          EN
        </AvatarFallback>
      </Avatar>

      <Button
        variant="ghost"
        size="icon"
        className="mr-2"
        aria-label="Komentar"
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
      </Button>

      <Button
        className="bg-[#669df1] hover:bg-[#669df1]/90 text-white h-8 mr-2"
        aria-label="Publikasikan halaman"
      >
        Publish...
      </Button>

      {/* Close draft button dengan konfirmasi dialog */}
      <Button
        variant="ghost"
        className="text-[#a9abaf] h-8 mr-2"
        aria-label="Tutup draft"
        onClick={handleCloseDraft}
        disabled={!effectivePageId || isDeleting || isLoading}
      >
        {isDeleting ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Deleting...
          </>
        ) : (
          'Close draft'
        )}
      </Button>

      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent h-8 mr-2"
      >
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>

      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent h-8 mr-2"
      >
        <Link className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {/* Alert Dialog untuk konfirmasi penghapusan halaman */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus halaman?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Halaman ini akan dihapus
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

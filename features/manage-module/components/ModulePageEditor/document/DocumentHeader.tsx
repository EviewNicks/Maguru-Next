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
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import { useModulePageCRUDContext } from '../../../context/ModulePageCRUDContext'
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
  title?: string
  onTitleChange?: (title: string) => void
  saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error'
  pageId?: string
}

export default function DocumentHeader({
  title = '',
  onTitleChange,
  saveStatus: propsSaveStatus = 'saved',
  pageId,
}: DocumentHeaderProps) {
  // State local
  const [localTitle, setLocalTitle] = useState<string>(title)
  const [titleSaveStatus, setTitleSaveStatus] = useState<
    'saved' | 'saving' | 'unsaved' | 'error'
  >(propsSaveStatus)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Hook debounce untuk judul
  const debouncedTitle = useDebounce<string>(localTitle, 1000)

  // Mengambil fungsi dan data dari context
  const {
    moduleId,
    pages,
    activePage,
    setActivePage,
    createPage,
    deletePage,
    savePage,
  } = useModulePageCRUDContext()

  // Gunakan pageId dari props atau dari activePage
  const effectivePageId = pageId || (activePage ? activePage.id : undefined)

  // Handler untuk pembuatan halaman baru
  const handleCreate = async () => {
    try {
      // Set status ke loading
      setIsCreating(true)

      // Membuat halaman baru dengan createPage dari context
      const newPage = await createPage({
        moduleId,
        title: 'Halaman Baru',
        order: pages.length,
        blocks: [],
      })

      // Setelah berhasil, set halaman baru sebagai halaman aktif
      if (newPage && newPage.data) {
        setActivePage(newPage.data)
      }

      // Tampilkan toast sukses
      toast.success('Halaman baru berhasil dibuat')
    } catch (error) {
      console.error('Error creating new page:', error)
      showErrorNotification(error)
    } finally {
      setIsCreating(false)
    }
  }

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

  // Handle title input change dengan validasi
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      setLocalTitle(newTitle)

      // Set status langsung ke unsaved untuk feedback instan
      setTitleSaveStatus('unsaved')

      if (onTitleChange) {
        onTitleChange(newTitle)
      }
    },
    [onTitleChange]
  )

  // Auto-save title when it changes (debounced) dengan validasi dan error handling yang lebih baik
  useEffect(() => {
    // Jika tidak ada pageId atau title sama dengan yang sebelumnya, skip
    if (!effectivePageId || debouncedTitle === title) {
      return
    }

    // Jika judul terlalu pendek, tampilkan error tapi jangan simpan
    if (debouncedTitle.trim().length < 5) {
      setTitleSaveStatus('error')
      toast.error('Judul harus terdiri dari minimal 5 karakter')
      return
    }

    // Fungsi untuk menyimpan judul
    const saveTitle = async () => {
      // Jika sedang dalam proses saving, jangan kirim request baru
      if (titleSaveStatus === 'saving') return

      try {
        setTitleSaveStatus('saving')

        // Tambahkan delay kecil untuk menghindari terlalu banyak request
        await new Promise((resolve) => setTimeout(resolve, 300))

        await savePage({
          pageId: effectivePageId,
          title: debouncedTitle,
        })

        setTitleSaveStatus('saved')
      } catch (error) {
        console.error('Error saving title:', error)
        setTitleSaveStatus('error')

        // Cek apakah error adalah network error
        if (error instanceof Error && error.message.includes('Network')) {
          toast.error(
            'Koneksi ke server gagal. Perubahan akan disimpan saat koneksi pulih.',
            {
              duration: 5000,
            }
          )

          // Coba lagi dalam 10 detik jika network error
          setTimeout(() => {
            if (titleSaveStatus === 'error') {
              saveTitle()
            }
          }, 10000)
        } else {
          // Show error notification dengan opsi retry untuk error lainnya
          showErrorNotification(error, {
            retryFn: () => saveTitle(),
          })
        }
      }
    }

    // Jalankan fungsi save
    saveTitle()
  }, [debouncedTitle, title, effectivePageId, savePage, titleSaveStatus])

  // Sync with props
  useEffect(() => {
    setLocalTitle(title)
  }, [title])

  // Pindahkan setSaveStatus ke dalam setTitleSaveStatus
  useEffect(() => {
    setTitleSaveStatus(
      propsSaveStatus as 'saved' | 'saving' | 'unsaved' | 'error'
    )
  }, [propsSaveStatus])

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
          placeholder="Untitled Page"
          className="border-0 bg-transparent h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-[#e3e4f2]"
          aria-label="Judul halaman"
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
        disabled={!effectivePageId || isDeleting}
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

      <div className="flex items-center gap-2 mr-auto">
        {/* Create button dengan loading state */}
        <Button
          className="bg-[#1868db] hover:bg-[#1868db]/90 text-white"
          onClick={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Create
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="border-[#669df1] text-[#669df1] bg-transparent hover:bg-[#1c2b42]"
        >
          <span className="text-[#bf63f3] mr-1">⭐</span>
          Upgrade
        </Button>
      </div>

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

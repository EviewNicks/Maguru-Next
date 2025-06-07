import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
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
import { useModuleDraftPageContext } from '../../../context/ModuleDraftPageContext'
import { DraftStatusIndicator } from '../../../components/feedback/DraftStatusIndicator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import {
  ActiveEditorIndicator,
  ConflictDialog,
} from '../../../components/feedback/ActiveEditorIndicator'
import {
  type ActiveEditor,
  getConcurrentEditingService,
} from '../../../lib/draft/ConcurrentEditingService'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { ModulePageStatus } from '../../../types'
import { logger } from '../../../services/logger'

// TODO: Phase 4 - Mode View dan Edit
// Import Edit dan Check icons dari lucide-react untuk tombol toggle mode

interface DocumentHeaderProps {
  isLoading?: boolean
}

// Konstanta untuk nama komponen (context)
const COMPONENT_NAME = 'DocumentHeader'

export default function DocumentHeader({
  isLoading = false,
}: DocumentHeaderProps) {
  // Mengambil data dan fungsi dari context
  const {
    activePage,
    deletePage,
    saveStatus: contextSaveStatus,
    savePage,
    refetch,
    getPageById,
  } = useModulePageCRUDContext()

  // Mengambil data dan fungsi dari draft context
  const {
    editorMode,
    draftSaveStatus,
    lastSavedAt,
    hasDraft,
    forceSave,
    publishDraft,
    discardDraft,
    toggleEditorMode,
    refreshActivePage,
    updatePageStatus,
  } = useModuleDraftPageContext()

  // State untuk concurrent editing
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([])
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictEditorName, setConflictEditorName] = useState<
    string | undefined
  >(undefined)

  // Ref untuk concurrent editing service
  const concurrentEditingServiceRef = useRef(getConcurrentEditingService())

  // Integrasi dengan Clerk untuk data user
  const { user, isLoaded } = useUser()
  const currentUserId = user?.id || 'anonymous'
  const currentUserName = user?.fullName || user?.username || 'Pengguna'
  const userProfileImage = user?.imageUrl

  // Ref untuk mendeteksi apakah perubahan judul sedang dalam proses penyimpanan
  const isSavingRef = useRef(false)

  // State untuk operasi publikasi
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  // State untuk operasi buang draft
  const [isDiscarding, setIsDiscarding] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

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
  const pageId = effectivePageId

  // Efek untuk meregister aktivitas pengguna dan memonitor pengguna aktif lainnya
  useEffect(() => {
    if (!effectivePageId || !isLoaded) return

    const concurrentEditingService = concurrentEditingServiceRef.current

    // Register aktivitas pengguna saat ini dengan data dari Clerk
    concurrentEditingService.registerActivity(
      effectivePageId,
      currentUserId,
      currentUserName,
      userProfileImage
    )

    // Set callback untuk perubahan aktivitas
    concurrentEditingService.setActivityChangeCallback((pageId, editors) => {
      if (pageId === effectivePageId) {
        const filteredEditors = editors.filter(
          (e) => e.userId !== currentUserId
        )
        setActiveEditors(filteredEditors)

        // Deteksi konflik berdasarkan lastEditBy dan timestamp
        if (filteredEditors.length > 0 && activePage && activePage.lastEditBy) {
          // Cek apakah ada editor yang memiliki ID yang sama dengan lastEditBy
          const conflictingEditor = filteredEditors.find(
            (editor) => editor.userId === activePage.lastEditBy
          )

          // Cek apakah draft memiliki timestamp yang lebih baru dari versi lokal
          if (
            conflictingEditor &&
            activePage.draftSavedAt &&
            new Date(conflictingEditor.timestamp) >
              new Date(activePage.draftSavedAt)
          ) {
            setConflictEditorName(conflictingEditor.userName)
            setShowConflictDialog(true)
          }
        }
      }
    })

    // Heartbeat interval untuk update aktivitas
    const heartbeatInterval = setInterval(() => {
      concurrentEditingService.registerActivity(
        effectivePageId,
        currentUserId,
        currentUserName,
        userProfileImage
      )
    }, 30000) // Setiap 30 detik

    // Dapatkan editor aktif saat mount
    const initialEditors =
      concurrentEditingService.getActiveEditors(effectivePageId)
    setActiveEditors(initialEditors.filter((e) => e.userId !== currentUserId))

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval)
      // Unregister aktivitas saat unmount
      concurrentEditingService.unregisterActivity(
        effectivePageId,
        currentUserId
      )
    }
  }, [
    effectivePageId,
    currentUserId,
    currentUserName,
    userProfileImage,
    activePage,
    isLoaded,
  ])

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
      showErrorNotification(error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handler untuk publikasi draft
  const handlePublishDraft = async () => {
    let publishSuccess = false

    try {
      setIsPublishing(true)
      // Tandai bahwa operasi publikasi sedang berlangsung
      window.sessionStorage.setItem('isPublishingDraft', 'true')

      // 1. Simpan perubahan terakhir

      try {
        await forceSave()
      } catch {
        // Lanjutkan meskipun ada error pada save
      }

      // Berikan sedikit waktu untuk memastikan save selesai

      await new Promise((resolve) => setTimeout(resolve, 300))

      // 2. Publikasikan draft

      try {
        const result = await publishDraft(effectivePageId)

        if (result) {
          publishSuccess = true

          toast.success('Draft berhasil dipublikasikan')
        } else {
          toast.error('Gagal mempublikasikan draft')
          return
        }
      } catch {
        throw new Error('Gagal mempublikasikan draft')
      }

      // 3. Ubah mode editor ke view melalui toggleEditorMode jika sekarang dalam edit mode
      if (editorMode === 'edit') {
        try {
          await toggleEditorMode()
        } catch {
          // Lanjutkan meskipun ada error dalam toggle mode
        }
      }

      // Berikan waktu untuk transisi mode selesai
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 4. Refresh data dari server seperti di handleToggleMode

      try {
        await refetch()
      } catch {}

      // Berikan waktu untuk data direfresh
      await new Promise((resolve) => setTimeout(resolve, 300))

      // 5. Perbarui state context berdasarkan halaman yang diperbarui

      try {
        // Gunakan true untuk memastikan state diperbarui dengan benar setelah publikasi
        refreshActivePage(true)
      } catch {}

      // 6. Validasi status halaman seperti di handleToggleMode
      try {
        if (!effectivePageId) {
          return
        }

        const updatedPage = await getPageById(effectivePageId)
        if (updatedPage) {
          // Jika status masih DRAFT, coba perbarui lagi
          if (updatedPage.status !== ModulePageStatus.PUBLISHED) {
            try {
              await updatePageStatus(
                effectivePageId,
                ModulePageStatus.PUBLISHED
              )
            } catch {}
          }
        }
      } catch {}
    } catch (error) {
      showErrorNotification(error)
      // Jika publikasi berhasil tapi terjadi error setelahnya, tetap lakukan refresh
      if (publishSuccess) {
        try {
          await refetch()
          refreshActivePage(true)
        } catch {}
      }
    } finally {
      setIsPublishing(false)
      setShowPublishDialog(false)
      try {
        // Hapus flag operasi dari sessionStorage
        window.sessionStorage.removeItem('isPublishingDraft')
      } catch {}
    }
  }

  // Handler untuk conflict resolution
  const handleUseLocalVersion = async () => {
    // Paksa save versi lokal
    try {
      await forceSave()
      toast.success('Perubahan Anda telah disimpan')
    } catch (error) {
      showErrorNotification(error)
    } finally {
      setShowConflictDialog(false)
    }
  }

  const handleUseRemoteVersion = async () => {
    if (!effectivePageId) return

    try {
      // Discard draft dan reload halaman
      await discardDraft(effectivePageId)
      toast.info('Menggunakan versi terbaru dari server')
      // Reload page data
    } catch (error) {
      showErrorNotification(error)
    } finally {
      setShowConflictDialog(false)
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
      setTitleSaveStatus('unsaved')

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



  // State for toggle mode loading
  const [isTogglingMode, setIsTogglingMode] = useState(false)

  // Handler untuk toggle mode
  const handleToggleMode = useCallback(async () => {
    const targetMode = editorMode === 'view' ? 'edit' : 'view'

    let toggleSuccess = false

    try {
      setIsTogglingMode(true)
      window.sessionStorage.setItem('isTogglingMode', 'true')

      try {
        try {
          await toggleEditorMode()
          toggleSuccess = true
        } catch (toggleError) {
          throw new Error(
            `Gagal mengubah mode: ${toggleError instanceof Error ? toggleError.message : 'Unknown error'}`
          )
        }
      } catch (toggleError) {
        throw toggleError
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      try {
        await refetch()
      } catch {}

      await new Promise((resolve) => setTimeout(resolve, 300))

      try {
        refreshActivePage(true)
      } catch {}

      try {
        if (!pageId) {
          return
        }

        const currentPage = await getPageById(pageId)

        if (currentPage) {
        }
      } catch {}

      if (targetMode === 'edit') {
        toast.success(
          'Mode edit diaktifkan. Sekarang Anda dapat mengedit halaman ini.'
        )
      } else {
        toast.success('Mode lihat diaktifkan.')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Gagal mengubah mode editor: ${error.message}`
          : 'Gagal mengubah mode editor. Silakan coba lagi.'

      toast.error(errorMessage)

      showErrorNotification(
        error instanceof Error ? error : new Error(errorMessage)
      )

      if (toggleSuccess) {
        try {
          await refetch()
          refreshActivePage(true)
        } catch {}
      }
    } finally {
      setIsTogglingMode(false)

      try {
        window.sessionStorage.removeItem('isTogglingMode')
      } catch {}
    }
  }, [
    editorMode,
    toggleEditorMode,
    refetch,
    refreshActivePage,
    activePage,
    pageId,
    getPageById,
  ])

  return (
    <div className="border-b sticky top-0 z-10 bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              aria-label="Menu utama"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="flex items-center space-x-2 flex-1">
              <Input
                value={localTitle}
                onChange={handleTitleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder="Untitled Page"
                className="border-none bg-transparent text-lg font-semibold h-9 focus-visible:ring-transparent w-full max-w-lg"
                aria-label="Judul halaman"
                disabled={isLoading || titleSaveStatus === 'saving'}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            {userProfileImage ? (
              <Avatar className="h-8 w-8">
                <div className="relative w-full h-full">
                  <Image
                    src={userProfileImage}
                    alt={currentUserName}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8 bg-[#669df1]">
                <AvatarFallback className="bg-[#669df1] text-white">
                  {currentUserName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Comment Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Komentar">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Komentar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Draft Status Indicator - hanya tampilkan di mode edit */}
            {editorMode === 'edit' && (
              <div className="flex items-center">
                <DraftStatusIndicator
                  status={draftSaveStatus}
                  lastSavedAt={lastSavedAt}
                  onRetry={forceSave}
                />
              </div>
            )}

            <Separator
              orientation="vertical"
              className="h-6 mx-1 bg-[#3b3b3b]"
            />

            {/* Toggle Mode Button - hanya tampilkan di mode view */}
            {editorMode === 'view' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={handleToggleMode}
                      disabled={isLoading || isTogglingMode}
                    >
                      {isTogglingMode ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Mengubah...</span>
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit halaman</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Active Editors Indicator */}
            {activeEditors.length > 0 && (
              <ActiveEditorIndicator editors={activeEditors} />
            )}

            {/* Tampilkan tombol publikasi dan buang draft hanya dalam mode edit */}
            {editorMode === 'edit' &&
              (hasDraft || activePage?.status === ModulePageStatus.DRAFT) && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 gap-1"
                    aria-label="Publikasikan draft"
                    onClick={() => setShowPublishDialog(true)}
                    disabled={
                      isPublishing ||
                      !effectivePageId ||
                      draftSaveStatus === 'saving'
                    }
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        <span>Publikasikan</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    aria-label="Buang draft"
                    onClick={() => setShowDiscardDialog(true)}
                    disabled={isDiscarding || !effectivePageId}
                  >
                    {isDiscarding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Buang Draft</span>
                      </>
                    )}
                  </Button>
                </>
              )}

            {/* Share Button */}
            <Button
              variant="outline"
              className="border-[#3b3b3b] bg-transparent h-8 gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>

            {/* Delete Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-8"
                    disabled={isDeleting || !effectivePageId}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hapus halaman</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* More Options Button */}
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog konfirmasi publikasi draft */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publikasikan draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Draft akan dipublikasikan dan menjadi versi publik dari halaman
              ini. Versi publik sebelumnya akan digantikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handlePublishDraft()
              }}
              disabled={isPublishing}
            >
              {isPublishing ? 'Memproses...' : 'Publikasikan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog konfirmasi buang draft */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Draft akan dibuang dan Anda akan kembali ke versi yang sudah
              dipublikasikan sebelumnya. Semua perubahan dalam draft akan
              hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDiscarding}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDiscardDraft()
              }}
              disabled={isDiscarding}
            >
              {isDiscarding ? 'Memproses...' : 'Buang Draft'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog konfirmasi hapus halaman */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus halaman?</AlertDialogTitle>
            <AlertDialogDescription>
              Halaman akan dihapus secara permanen. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog konflik editing */}
      <ConflictDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onUseRemoteVersion={handleUseRemoteVersion}
        onUseLocalVersion={handleUseLocalVersion}
        editorName={conflictEditorName}
      />
    </div>
  )
}

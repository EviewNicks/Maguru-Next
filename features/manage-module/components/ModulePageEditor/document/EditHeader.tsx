'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Loader2,
  ExternalLink,
  Trash2,
  Eye,
} from 'lucide-react'
import { useModulePageCRUDContext } from '../../../context/ModulePageCRUDContext'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ActiveEditorIndicator } from '../../../components/feedback/ActiveEditorIndicator'
import { getConcurrentEditingService } from '../../../lib/draft/ConcurrentEditingService'
import { DraftStatusIndicator } from '../../../components/feedback/DraftStatusIndicator'
import { SaveStatus } from '../../../context/ModulePageCRUDContext'
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
import { ModulePageStatus } from '../../../types'

interface EditHeaderProps {
  pageId: string
  moduleId: string
  onSwitchToView: () => void
}

/**
 * EditHeader - Header untuk mode edit
 *
 * Komponen ini menampilkan header lengkap untuk mode edit
 * dengan tombol untuk menyimpan, publikasi, dan buang draft.
 */
export function EditHeader({
  pageId,
  moduleId,
  onSwitchToView,
}: EditHeaderProps) {
  const {
    activePage,
    saveStatus: contextSaveStatus,
    savePage,
    deletePage,
    refetch,
  } = useModulePageCRUDContext()

  // Integrasi dengan Clerk untuk data user
  const { user, isLoaded } = useUser()
  const currentUserId = user?.id || 'anonymous'
  const currentUserName = user?.fullName || user?.username || 'Pengguna'
  const userProfileImage = user?.imageUrl

  // State untuk concurrent editing
  const [activeEditors, setActiveEditors] = useState<
    Array<{
      userId: string
      userName: string
      timestamp: number
      profileImageUrl?: string
    }>
  >([])

  // Ref untuk concurrent editing service
  const concurrentEditingServiceRef = useRef(getConcurrentEditingService())

  // State untuk judul halaman
  const title = activePage?.title || 'Untitled Page'
  const [localTitle, setLocalTitle] = useState<string>(title)
  const [titleSaveStatus, setTitleSaveStatus] = useState<SaveStatus>(
    contextSaveStatus || 'saved'
  )
  const [isEditing, setIsEditing] = useState(false)

  // Ref untuk mendeteksi apakah perubahan judul sedang dalam proses penyimpanan
  const isSavingRef = useRef(false)

  // State untuk operasi publikasi dan hapus
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // State untuk draft status (placeholder)
  const draftSaveStatus = 'saved' as const
  const lastSavedAt = new Date()
  const hasDraft = true

  // Efek untuk meregister aktivitas pengguna dan memonitor pengguna aktif lainnya
  useEffect(() => {
    if (!pageId || !isLoaded) return

    const concurrentEditingService = concurrentEditingServiceRef.current

    // Register aktivitas pengguna saat ini dengan data dari Clerk
    concurrentEditingService.registerActivity(
      pageId,
      currentUserId,
      currentUserName,
      userProfileImage
    )

    // Set callback untuk perubahan aktivitas
    concurrentEditingService.setActivityChangeCallback(
      (updatedPageId, editors) => {
        if (updatedPageId === pageId) {
          const filteredEditors = editors.filter(
            (e) => e.userId !== currentUserId
          )
          setActiveEditors(filteredEditors)
        }
      }
    )

    // Heartbeat interval untuk update aktivitas
    const heartbeatInterval = setInterval(() => {
      concurrentEditingService.registerActivity(
        pageId,
        currentUserId,
        currentUserName,
        userProfileImage
      )
    }, 30000) // Setiap 30 detik

    // Dapatkan editor aktif saat mount
    const initialEditors = concurrentEditingService.getActiveEditors(pageId)
    setActiveEditors(initialEditors.filter((e) => e.userId !== currentUserId))

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval)
      // Unregister aktivitas saat unmount
      concurrentEditingService.unregisterActivity(pageId, currentUserId)
    }
  }, [pageId, currentUserId, currentUserName, userProfileImage, isLoaded])

  // Sync title dari context saat activePage berubah
  useEffect(() => {
    if (activePage && activePage.title !== localTitle) {
      setLocalTitle(activePage.title || '')
    }
  }, [activePage, localTitle])

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
    if (!pageId || !isEditing || isSavingRef.current) return

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
        pageId: pageId,
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
  }, [pageId, isEditing, localTitle, savePage])

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

  // Handler untuk konfirmasi hapus halaman
  const handleDeleteConfirm = async () => {
    if (!pageId) return

    try {
      setIsDeleting(true)
      await deletePage(pageId)
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

  // Handler untuk publikasi draft (placeholder)
  const handlePublishDraft = async () => {
    setIsPublishing(true)
    try {
      // Implementasi publikasi draft akan ditambahkan nanti
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Draft berhasil dipublikasikan')
      onSwitchToView()
    } catch (error) {
      showErrorNotification(error)
    } finally {
      setIsPublishing(false)
      setShowPublishDialog(false)
    }
  }

  // Placeholder untuk forceSave
  const forceSave = async () => {
    // Implementasi forceSave akan ditambahkan nanti
  }

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
                disabled={titleSaveStatus === 'saving'}
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

            {/* Draft Status Indicator */}
            <div className="flex items-center">
              <DraftStatusIndicator
                status={draftSaveStatus}
                lastSavedAt={lastSavedAt}
                onRetry={forceSave}
              />
            </div>

            <Separator
              orientation="vertical"
              className="h-6 mx-1 bg-[#3b3b3b]"
            />

            {/* View Mode Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={onSwitchToView}
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lihat halaman</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Active Editors Indicator */}
            {activeEditors.length > 0 && (
              <ActiveEditorIndicator editors={activeEditors} />
            )}

            {/* Publish Button */}
            {(hasDraft || activePage?.status === ModulePageStatus.DRAFT) && (
              <Button
                size="sm"
                variant="default"
                className="h-8 gap-1"
                aria-label="Publikasikan draft"
                onClick={() => setShowPublishDialog(true)}
                disabled={isPublishing || draftSaveStatus === 'saving'}
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
                    disabled={isDeleting}
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
    </div>
  )
}

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from 'react'
import { Editor } from '@tiptap/react'
import {
  ModulePage,
  StandardEditorContent,
  DraftSaveStatus,
  ModulePageStatus,
  ApiEntityResponse,
} from '../types'
import { useRichTextAutosave } from '../hooks/draft/useRichTextAutosave'
import { useDraftRecovery } from '../hooks/draft/useDraftRecovery'
import { useUnsavedChangesPrompt } from '../hooks/draft/useUnsavedChangesPrompt'
import { modulePageAdapter } from '../adapters/modulePageAdapter'
import { showErrorNotification } from '../components/ErrorNotifier'
import { getDraftFeedbackService } from '../lib/draft/DraftFeedbackService'
import { getConcurrentEditingService } from '../lib/draft/ConcurrentEditingService'
import { useClerk } from '@clerk/nextjs'
import { useModulePageCRUDContext } from './ModulePageCRUDContext'
import { logger } from '../services/logger'
import { toast } from 'sonner'

// Nama komponen untuk logging
const CONTEXT = 'ModuleDraftPageContext'

// Inisialisasi service
const draftFeedbackService = getDraftFeedbackService()
const concurrentEditingService = getConcurrentEditingService()

// Tipe untuk mode editor
export type EditorMode = 'view' | 'edit'

// Interface untuk context
interface ModuleDraftPageContextProps {
  // Draft save status
  draftSaveStatus: DraftSaveStatus
  lastSavedAt: Date | null
  formattedLastSaved: string
  hasUnsavedChanges: boolean
  isDraftSaving: boolean
  forceSave: () => Promise<void>
  draftError: Error | null

  // Editor reference
  setEditor: (editor: Editor | null) => void

  // Draft recovery
  hasDraft: boolean
  isDraftLoading: boolean
  showRecoveryDialog: boolean
  draftMetadata: {
    lastEditBy: string | null
    draftSavedAt: Date | null
    formattedDraftTime: string
  }
  checkForDraft: (pageId: string) => Promise<boolean>
  recoverDraft: (pageId: string) => Promise<ModulePage | null>
  handleRecoverDraft: () => Promise<void>
  discardDraft: (
    pageId: string
  ) => Promise<ApiEntityResponse<ModulePage> | null>
  handleDiscardDraft: () => Promise<void>
  publishDraft: (pageId: string) => Promise<ModulePage | null>
  closeRecoveryDialog: () => void

  // Unsaved changes prompt
  showUnsavedChangesDialog: boolean
  confirmNavigation: () => Promise<void>
  cancelNavigation: () => void

  // Concurrent editing
  activeEditors: Array<{
    userId: string
    userName: string
    timestamp: number
    profileImageUrl?: string
  }>
  hasEditingConflict: boolean
  resolveConflict: () => Promise<void>

  // Mode View dan Edit
  editorMode: EditorMode
  setEditorMode: (mode: EditorMode) => void
  toggleEditorMode: () => void

  // Fungsi untuk mendapatkan konten yang sesuai dengan mode
  getDraftOrPublishedContent: (page: ModulePage | null) => StandardEditorContent

  // Fungsi untuk update status halaman
  updatePageStatus: (
    pageId: string,
    status: ModulePageStatus
  ) => Promise<ModulePage | null>

  // Fungsi untuk memperbarui state berdasarkan perubahan halaman aktif
  refreshActivePage: (forceSync?: boolean) => void
}

const ModuleDraftPageContext =
  createContext<ModuleDraftPageContextProps | null>(null)

export function useModuleDraftPageContext() {
  const context = useContext(ModuleDraftPageContext)
  if (!context) {
    throw new Error(
      'useModuleDraftPageContext must be used within a ModuleDraftPageProvider'
    )
  }
  return context
}

interface ModuleDraftPageProviderProps {
  children: ReactNode
  activePage: ModulePage | null
  enabled?: boolean
}

export function ModuleDraftPageProvider({
  children,
  activePage,
  enabled = true,
}: ModuleDraftPageProviderProps) {
  const pageId = activePage?.id || ''
  const { user } = useClerk()
  const userId = user?.id || ''
  const userName = user?.fullName || user?.username || 'Unknown User'

  // Gunakan getPageById dari ModulePageCRUDContext
  const { getPageById, refetch } = useModulePageCRUDContext()

  // Ref untuk editor
  const [editor, setEditor] = useState<Editor | null>(null)

  // State untuk konfirmasi navigasi
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null)

  // State untuk concurrent editing
  const [activeEditors, setActiveEditors] = useState<
    Array<{
      userId: string
      userName: string
      timestamp: number
      profileImageUrl?: string
    }>
  >([])
  const [hasEditingConflict, setHasEditingConflict] = useState(false)

  // State untuk mode view/edit - inisialisasi berdasarkan status halaman
  const [editorMode, setEditorMode] = useState<EditorMode>(
    activePage?.status === ModulePageStatus.DRAFT ? 'edit' : 'view'
  )

  // Gunakan hook useRichTextAutosave
  const {
    saveStatus,
    lastSavedAt,
    formattedLastSaved,
    hasUnsavedChanges,
    forceSave: hookForceSave,
    error: draftError,
  } = useRichTextAutosave({
    editor,
    enabled: !!editor && !!pageId && enabled && editorMode === 'edit', // Hanya aktifkan autosave saat dalam mode edit
    pageId,
  })

  // Derive isDraftSaving dari saveStatus
  const isDraftSaving = saveStatus === 'saving'

  // Mapeo de saveStatus a draftSaveStatus para mantener la API del contexto
  const draftSaveStatus = saveStatus

  // Wrapper for forceSave that returns a Promise
  const forceSave = useCallback(async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      try {
        hookForceSave()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }, [hookForceSave])

  // Fungsi untuk update status halaman
  const updatePageStatus = useCallback(
    async (
      pageId: string,
      status: ModulePageStatus
    ): Promise<ModulePage | null> => {
      if (!pageId) {
        return null
      }

      try {
        // Tentukan nilai isDraft dan hasUnpublishedChanges berdasarkan status
        const isDraft = status === ModulePageStatus.DRAFT
        const hasUnpublishedChanges = status === ModulePageStatus.DRAFT

        // Step 1: Panggil updatePageStatusOperation dari ModulePageCRUDContext dengan options
        // Gunakan modulePageAdapter langsung untuk mendukung parameter options
        const result = await modulePageAdapter.updatePageStatus(
          pageId,
          status,
          { isDraft, hasUnpublishedChanges }
        )

        // Step 2: Validasi hasil operasi
        if (!result) {
          return null
        }

        // Step 3: Verifikasi apakah status halaman sesuai dengan yang diminta
        if (result.status !== status) {
        }

        // Step 4: Log hasil operasi

        // Step 5: Log detail hasil operasi

        return result
      } catch (error) {
        // Tangani error dengan lebih detail
        const errorMessage =
          error instanceof Error ? error.message : String(error)

        showErrorNotification(
          error instanceof Error
            ? error
            : new Error(
                `Gagal mengubah status halaman ke ${status}: ${errorMessage}`
              )
        )
        return null
      }
    },
    [modulePageAdapter]
  )

  // Fungsi untuk memperbarui state berdasarkan perubahan halaman aktif
  const refreshActivePage = useCallback(
    (forceSync = false) => {
      if (activePage) {
        // Cek apakah sedang dalam proses toggle mode
        const isTogglingInProgress =
          window.sessionStorage.getItem('isTogglingMode') === 'true'

        // Perbarui mode editor berdasarkan status halaman HANYA jika forceSync=true
        if (forceSync) {
          // Jika sedang dalam proses toggle, skip pembaruan mode untuk mencegah race condition
          if (isTogglingInProgress) {
            return
          }

          const newMode =
            activePage.status === ModulePageStatus.DRAFT ? 'edit' : 'view'

          if (editorMode !== newMode) {
            // Set mode editor

            setEditorMode(newMode)

            // Perbarui editor editable state
            if (editor) {
              const expectedEditable = newMode === 'edit'

              try {
                editor.setEditable(expectedEditable)

                // Verifikasi perubahan
                setTimeout(() => {
                  if (editor.isEditable !== expectedEditable) {
                  } else {
                  }
                }, 50)
              } catch {}
            } else {
            }
          } else {
          }
        } else {
        }
      } else {
      }
    },
    [activePage, editorMode, editor]
  )

  // Toggle mode function yang diperbarui untuk mengubah status halaman
  const toggleEditorMode = useCallback(async () => {
    if (!activePage || !pageId) {
      return false
    }

    // const FUNCTION_NAME = 'toggleEditorMode'
    const targetMode = editorMode === 'view' ? 'edit' : 'view'

    try {
      // Langsung ubah status halaman di database jika diperlukan
      if (targetMode === 'edit') {
        // Mengubah ke mode edit - halaman menjadi DRAFT
        if (activePage.status === ModulePageStatus.PUBLISHED) {
          const updatedPage = await updatePageStatus(
            pageId,
            ModulePageStatus.DRAFT
          )

          if (!updatedPage) {
            throw new Error('Gagal mengubah status halaman ke DRAFT')
          }
        }
      } else {
        // Mengubah ke mode view

        // Simpan perubahan jika ada
        if (hasUnsavedChanges && editor) {
          try {
            await forceSave()
          } catch {
            // Lanjutkan meskipun gagal menyimpan
          }
        }

        // Update status ke PUBLISHED jika perlu
        if (
          activePage.status === ModulePageStatus.DRAFT &&
          !activePage.hasUnpublishedChanges
        ) {
          const publishedPage = await updatePageStatus(
            pageId,
            ModulePageStatus.PUBLISHED
          )

          if (!publishedPage) {
            throw new Error('Gagal mengubah status halaman ke PUBLISHED')
          }
        }
      }

      // Update state React
      setEditorMode(targetMode)

      // Update editor properties
      if (editor) {
        editor.setEditable(targetMode === 'edit')
      }

      // Refresh data halaman
      try {
        await getPageById(pageId)
      } catch {
        // Lanjutkan meskipun gagal refresh
      }

      return true
    } catch (error) {
      // Tampilkan notifikasi error
      showErrorNotification(
        error instanceof Error ? error : new Error('Gagal mengubah mode editor')
      )

      return false
    }
  }, [
    activePage,
    pageId,
    editorMode,
    editor,
    updatePageStatus,
    hasUnsavedChanges,
    forceSave,
    getPageById,
  ])

  // Fungsi untuk mendapatkan konten yang sesuai dengan mode saat ini
  const getDraftOrPublishedContent = useCallback(
    (page: ModulePage | null): StandardEditorContent => {
      if (!page) {
        return { type: 'doc', content: [] } as StandardEditorContent
      }

      try {
        // Jika dalam mode edit dan halaman memiliki draft yang belum dipublikasikan
        if (
          editorMode === 'edit' &&
          page.hasUnpublishedChanges &&
          page.draftData
        ) {
          // Gunakan draftData jika tersedia
          const content = modulePageAdapter.getParsedEditorContent({
            ...page,
            content: page.draftData,
          } as ModulePage)

          // Log ringkasan konten untuk debugging

          return content
        } else {
          // Gunakan content yang sudah dipublikasikan
          const content = modulePageAdapter.getParsedEditorContent(page)

          // Log ringkasan konten untuk debugging

          return content
        }
      } catch {
        return { type: 'doc', content: [] } as StandardEditorContent
      }
    },
    [editorMode]
  )

  // Gunakan hook useDraftRecovery
  const {
    hasDraft,
    draftData,
    isLoading: isDraftLoading,
    showRecoveryDialog,
    formattedDraftTime,
    editorName: lastEditBy,
    checkDraft: checkForDraft,
    closeDialog: closeRecoveryDialog,
  } = useDraftRecovery({
    pageId,
    onRecover: useCallback(
      (content: StandardEditorContent) => {
        if (editor) {
          editor.commands.clearContent()
          editor.commands.setContent(content)
        } else {
        }
      },
      [editor, pageId]
    ),
    onDiscard: useCallback(() => {}, [pageId]),
    autoCheckOnMount: true,
  })

  // Fungsi untuk memulihkan draft - dioptimalkan dengan useCallback
  const handleRecoverDraft = useCallback(async (): Promise<void> => {
    if (!pageId || !editor) {
      return
    }

    try {
      const draft = await modulePageAdapter.getDraft(pageId)

      if (!draft?.draftData) {
        showErrorNotification(new Error('Tidak ada draft yang tersedia'))
        return
      }

      // Bersihkan editor terlebih dahulu
      editor.commands.clearContent()

      // Set content dari draft
      editor.commands.setContent(draft.draftData)

      // Ubah mode ke edit setelah memulihkan draft
      setEditorMode('edit')

      // Ubah status halaman ke DRAFT
      await updatePageStatus(pageId, ModulePageStatus.DRAFT)

      // Hapus dialog recovery
      closeRecoveryDialog()
    } catch (error) {
      showErrorNotification(
        error instanceof Error ? error : new Error('Gagal memulihkan draft')
      )
    }
  }, [pageId, editor, closeRecoveryDialog, updatePageStatus])

  // Implementasi handleDiscardDraft yang ditingkatkan
  const handleDiscardDraft = useCallback(async (): Promise<void> => {
    const FUNCTION_NAME = 'handleDiscardDraft'

    if (!pageId) {
      logger.warn(CONTEXT, FUNCTION_NAME, 'Tidak ada pageId yang tersedia')
      return
    }

    try {
      logger.info(CONTEXT, FUNCTION_NAME, 'Memulai proses membuang draft', {
        pageId,
      })

      // Panggil adapter untuk membuang draft
      const result = await modulePageAdapter.discardDraft(pageId)

      if (!result || !result.success) {
        logger.error(CONTEXT, FUNCTION_NAME, 'Gagal membuang draft', { pageId })
        showErrorNotification(new Error('Gagal membuang draft'))
        return
      }

      logger.info(CONTEXT, FUNCTION_NAME, 'Draft berhasil dibuang', {
        pageId,
        status: result.data.status,
        isDraft: result.data.isDraft,
        hasUnpublishedChanges: result.data.hasUnpublishedChanges,
      })

      // Tampilkan notifikasi sukses
      toast.success('Draft berhasil dibuang')

      // Berikan sedikit waktu untuk cache invalidation
      logger.debug(
        CONTEXT,
        FUNCTION_NAME,
        'Menunggu untuk cache invalidation',
        { delay: '200ms' }
      )
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Refresh data halaman dari server untuk memperbarui UI
      logger.info(
        CONTEXT,
        FUNCTION_NAME,
        'Memanggil refetch untuk memperbarui data'
      )
      await refetch()
      logger.debug(CONTEXT, FUNCTION_NAME, 'refetch berhasil dipanggil')

      // Jika editor tersedia, perbarui konten dengan versi published
      if (editor) {
        try {
          // Dapatkan versi published dari server
          const publishedPage = await modulePageAdapter.getPage(pageId, true)

          if (publishedPage) {
            // Gunakan getParsedEditorContent untuk memastikan format konten valid
            const publishedContent =
              modulePageAdapter.getParsedEditorContent(publishedPage)

            // Update editor dengan konten published
            editor.commands.setContent(publishedContent)

            logger.debug(
              CONTEXT,
              FUNCTION_NAME,
              'Editor content diperbarui dengan versi published',
              { pageId }
            )
          }
        } catch (updateError) {
          logger.warn(
            CONTEXT,
            FUNCTION_NAME,
            'Gagal memperbarui konten editor dengan versi published',
            updateError instanceof Error
              ? { message: updateError.message, stack: updateError.stack }
              : { message: 'Unknown error' }
          )
        }
      }

      // Ubah mode ke view setelah membuang draft
      if (editorMode === 'edit') {
        setEditorMode('view')

        // Update editor editable state
        if (editor) {
          editor.setEditable(false)
        }

        logger.debug(CONTEXT, FUNCTION_NAME, 'Mode editor diubah ke view', {
          pageId,
        })
      }

      // Validasi status halaman
      try {
        const updatedPage = await getPageById(pageId)
        if (updatedPage) {
          // Jika status masih DRAFT, coba perbarui lagi
          if (updatedPage.status !== ModulePageStatus.PUBLISHED) {
            try {
              logger.info(
                CONTEXT,
                FUNCTION_NAME,
                'Status masih DRAFT, mencoba update ke PUBLISHED',
                { pageId, status: updatedPage.status }
              )
              await updatePageStatus(pageId, ModulePageStatus.PUBLISHED)
              logger.debug(
                CONTEXT,
                FUNCTION_NAME,
                'Status berhasil diupdate ke PUBLISHED'
              )
            } catch (statusError) {
              logger.error(
                CONTEXT,
                FUNCTION_NAME,
                'Gagal mengupdate status ke PUBLISHED',
                statusError instanceof Error
                  ? { message: statusError.message, stack: statusError.stack }
                  : { message: 'Unknown error' }
              )
            }
          }
        }
      } catch (validationError) {
        logger.error(
          CONTEXT,
          FUNCTION_NAME,
          'Error saat validasi status halaman',
          validationError instanceof Error
            ? {
                message: validationError.message,
                stack: validationError.stack,
              }
            : { message: 'Unknown error' }
        )
      }

      // Trigger refresh aktivePage dengan forceSync=true
      refreshActivePage(true)
    } catch (error) {
      logger.error(
        CONTEXT,
        FUNCTION_NAME,
        'Error saat membuang draft',
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { message: 'Unknown error' }
      )

      showErrorNotification(
        error instanceof Error ? error : new Error('Gagal membuang draft')
      )
    }
  }, [
    pageId,
    editor,
    editorMode,
    refreshActivePage,
    setEditorMode,
    updatePageStatus,
    getPageById,
    refetch,
  ])

  // Gunakan hook useUnsavedChangesPrompt
  const {
    showDialog: showUnsavedChangesDialog,
    handleConfirm: confirmNavigation,
    handleCancel: cancelNavigation,
  } = useUnsavedChangesPrompt({
    hasUnsavedChanges,
    onConfirmNavigation: useCallback(async () => {
      if (pendingNavigation) {
        try {
          // Coba simpan perubahan sebelum navigasi
          if (hasUnsavedChanges && editor) {
            await forceSave()
          }
        } catch (error) {
          showErrorNotification(
            error instanceof Error
              ? error
              : new Error('Gagal menyimpan perubahan sebelum navigasi')
          )
        } finally {
          // Jalankan navigasi yang tertunda
          pendingNavigation()
          setPendingNavigation(null)
        }
      }
    }, [pendingNavigation, hasUnsavedChanges, editor, forceSave]),
  })

  // Fungsi untuk memulihkan draft
  const recoverDraft = useCallback(
    async (pageId: string): Promise<ModulePage | null> => {
      try {
        return await modulePageAdapter.getDraft(pageId)
      } catch (error) {
        showErrorNotification(
          error instanceof Error ? error : new Error('Gagal mengambil draft')
        )
        return null
      }
    },
    []
  )

  // Format metadata draft
  const draftMetadata = useMemo(
    () => ({
      lastEditBy,
      draftSavedAt: draftData?.draftSavedAt || null,
      formattedDraftTime: formattedDraftTime || '',
    }),
    [lastEditBy, draftData, formattedDraftTime]
  )

  // Effect untuk memperbarui state ketika activePage berubah
  useEffect(() => {
    refreshActivePage()
  }, [activePage, refreshActivePage])

  // Integrasi dengan DraftFeedbackService
  useEffect(() => {
    // Inisialisasi DraftFeedbackService
    draftFeedbackService.setStatusChangeCallback((status) => {
      // Update status di UI
      if (status) {
      }
    })

    return () => {
      draftFeedbackService.destroy()
    }
  }, [])

  // Integrasi dengan ConcurrentEditingService
  useEffect(() => {
    if (!pageId || !userId) return

    // Register activity saat halaman dibuka
    concurrentEditingService.registerActivity(
      pageId,
      userId,
      userName,
      user?.imageUrl
    )

    // Setup callback untuk perubahan aktivitas
    concurrentEditingService.setActivityChangeCallback(
      (updatedPageId, editors) => {
        if (updatedPageId === pageId) {
          // Filter out current user
          const otherEditors = editors.filter((e) => e.userId !== userId)
          setActiveEditors(otherEditors)
        }
      }
    )

    // Polling untuk mendapatkan active editors
    const interval = setInterval(() => {
      if (pageId) {
        const editors = concurrentEditingService.getActiveEditors(pageId)
        const otherEditors = editors.filter((e) => e.userId !== userId)
        setActiveEditors(otherEditors)
      }
    }, 30000)

    return () => {
      // Unregister activity saat komponen unmount
      if (pageId && userId) {
        concurrentEditingService.unregisterActivity(pageId, userId)
      }
      clearInterval(interval)
      concurrentEditingService.destroy()
    }
  }, [pageId, userId, userName, user?.imageUrl])

  // Deteksi konflik editing
  useEffect(() => {
    if (!pageId || !activePage) return

    // Cek konflik versi
    const checkConflict = async () => {
      try {
        // Ambil versi terbaru dari server
        const latestPage = await modulePageAdapter.getPage(pageId, true)

        // Cek konflik versi dengan concurrentEditingService
        const hasConflict = concurrentEditingService.hasVersionConflict(
          activePage,
          latestPage
        )

        setHasEditingConflict(hasConflict)
      } catch {}
    }

    // Cek konflik setiap 2 menit
    checkConflict()
    const conflictInterval = setInterval(checkConflict, 2 * 60 * 1000)

    return () => {
      clearInterval(conflictInterval)
    }
  }, [pageId, activePage])

  // Fungsi untuk menyelesaikan konflik editing
  const resolveConflict = useCallback(async () => {
    if (!pageId) return

    try {
      // Ambil versi terbaru dari server
      const latestPage = await modulePageAdapter.getPage(pageId, true)

      if (!latestPage) {
        showErrorNotification(new Error('Halaman tidak ditemukan'))
        return
      }

      // Tampilkan dialog untuk memilih versi (bisa diimplementasikan lebih lanjut)
      // Untuk sementara, kita gunakan versi terbaru
      if (editor && latestPage.content) {
        editor.commands.setContent(latestPage.content)
        setHasEditingConflict(false)
      }
    } catch (error) {
      showErrorNotification(
        error instanceof Error
          ? error
          : new Error('Gagal menyelesaikan konflik')
      )
    }
  }, [pageId, editor])

  // Implementasi publishDraft dengan pendekatan sederhana
  const publishDraftWithLogging = useCallback(
    async (pageId: string): Promise<ModulePage | null> => {
      if (!pageId) {
        return null
      }

      try {
        // Verifikasi ketersediaan draft
        const hasDraftResult = await modulePageAdapter.hasDraft(pageId)

        if (!hasDraftResult) {
          return null
        }

        // Simpan perubahan yang belum tersimpan jika ada
        if (hasUnsavedChanges && editor && editorMode === 'edit') {
          try {
            await forceSave()
          } catch {
            // Lanjutkan meskipun gagal menyimpan
          }
        }

        // Publikasi draft ke server
        const result = await modulePageAdapter.publishDraft(pageId)

        if (!result) {
          throw new Error('Gagal mempublikasikan draft')
        }

        // Pastikan status halaman sudah PUBLISHED
        if (result.status !== ModulePageStatus.PUBLISHED) {
          await updatePageStatus(pageId, ModulePageStatus.PUBLISHED)
        }

        // Perubahan mode editor jika perlu
        if (editorMode === 'edit') {
          // Langsung ubah mode editor tanpa event
          setEditorMode('view')

          // Update konten editor jika tersedia
          if (editor) {
            editor.setEditable(false)
            editor.commands.setContent(result.content)
          }
        }

        return result
      } catch (error) {
        // Re-throw error untuk ditangani oleh caller
        throw error
      }
    },
    [
      editor,
      editorMode,
      updatePageStatus,
      hasUnsavedChanges,
      forceSave,
      setEditorMode,
    ]
  )

  // Nilai yang disediakan oleh context
  const contextValue = useMemo(
    () => ({
      // Draft save status
      draftSaveStatus,
      lastSavedAt,
      formattedLastSaved,
      hasUnsavedChanges,
      isDraftSaving,
      forceSave,
      draftError,

      // Editor reference
      setEditor,

      // Draft recovery
      hasDraft,
      isDraftLoading,
      showRecoveryDialog,
      draftMetadata,
      checkForDraft,
      recoverDraft,
      handleRecoverDraft,
      publishDraft: publishDraftWithLogging,
      discardDraft: modulePageAdapter.discardDraft,
      handleDiscardDraft,
      closeRecoveryDialog,

      // Unsaved changes prompt
      showUnsavedChangesDialog,
      confirmNavigation,
      cancelNavigation,

      // Concurrent editing
      activeEditors,
      hasEditingConflict,
      resolveConflict,

      // Mode View dan Edit
      editorMode,
      setEditorMode,
      toggleEditorMode,
      refreshActivePage,

      // Fungsi untuk mendapatkan konten yang sesuai dengan mode
      getDraftOrPublishedContent,

      // Fungsi untuk update status halaman
      updatePageStatus,
    }),
    [
      draftSaveStatus,
      lastSavedAt,
      formattedLastSaved,
      hasUnsavedChanges,
      isDraftSaving,
      forceSave,
      draftError,
      setEditor,
      hasDraft,
      isDraftLoading,
      showRecoveryDialog,
      draftMetadata,
      checkForDraft,
      recoverDraft,
      handleRecoverDraft,
      publishDraftWithLogging,
      handleDiscardDraft,
      closeRecoveryDialog,
      showUnsavedChangesDialog,
      confirmNavigation,
      cancelNavigation,
      activeEditors,
      hasEditingConflict,
      resolveConflict,
      editorMode,
      setEditorMode,
      toggleEditorMode,
      refreshActivePage,
      getDraftOrPublishedContent,
      updatePageStatus,
    ]
  )

  return (
    <ModuleDraftPageContext.Provider value={contextValue}>
      {children}
    </ModuleDraftPageContext.Provider>
  )
}

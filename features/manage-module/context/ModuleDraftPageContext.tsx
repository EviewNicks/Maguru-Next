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

// Nama komponen untuk logging
// const CONTEXT = 'ModuleDraftPageContext'

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
  discardDraft: (pageId: string) => Promise<boolean>
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
  const { getPageById } = useModulePageCRUDContext()

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
              } catch {
              }
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

    // Log informasi awal untuk debugging


    try {
      // Simpan mode target untuk digunakan nanti
      const targetMode = editorMode === 'view' ? 'edit' : 'view'


      // Tambahkan flag di sessionStorage untuk koordinasi dengan refreshActivePage
      window.sessionStorage.setItem('isTogglingMode', 'true')

      // Step 1: Perbarui status halaman di database SEBELUM mengubah UI
      // Ini mencegah race condition dan memastikan data konsisten
      if (targetMode === 'edit') {
        // Ubah ke mode edit: Perbarui status ke DRAFT jika saat ini PUBLISHED
        if (activePage.status === ModulePageStatus.PUBLISHED) {


          try {
            // Perbarui status halaman di database
            const updatedPage = await updatePageStatus(
              pageId,
              ModulePageStatus.DRAFT
            )

            if (!updatedPage) {

              // Batalkan operasi toggle jika update database gagal
              window.sessionStorage.removeItem('isTogglingMode')
              throw new Error('Gagal mengubah status halaman ke DRAFT')
            } else {

            }
          } catch {

            // Batalkan operasi toggle jika update database gagal
            window.sessionStorage.removeItem('isTogglingMode')
            return false
          }
        } else {

        }
      } else {
        // Ubah ke mode view: Cek apakah perlu publish atau tetap draft

        // Step 1a: Simpan perubahan jika ada
        if (hasUnsavedChanges && editor) {
          try {
            await forceSave()
          } catch  {
            // Lanjutkan eksekusi meskipun ada error pada save
            // Karena ini hanya untuk memastikan konten tersimpan sebelum mode berubah
          }
        }

        // Step 1b: Cek perubahan yang belum dipublikasikan
        if (activePage.status === ModulePageStatus.DRAFT) {


          if (activePage.hasUnpublishedChanges) {
            // Untuk sekarang, kita tetap ubah ke view mode tanpa mengubah status

          } else {

            try {
              // Jika tidak ada perubahan draft, aman untuk mengubah status ke PUBLISHED
              const publishedPage = await updatePageStatus(
                pageId,
                ModulePageStatus.PUBLISHED
              )

              if (!publishedPage) {

                // Batalkan operasi toggle jika update database gagal
                window.sessionStorage.removeItem('isTogglingMode')
                throw new Error('Gagal mengubah status halaman ke PUBLISHED')
              }



              // Log detail halaman yang dipublish
              if (publishedPage) {

              }
            } catch {

              // Batalkan operasi toggle jika update database gagal
              window.sessionStorage.removeItem('isTogglingMode')
              return false
            }
          }
        } else {

        }
      }

      // Step 2: Setelah database diupdate, sekarang perbarui state React

      setEditorMode(targetMode)

      // Step 3: Perbarui editor editable
      if (editor) {
        const editable = targetMode === 'edit'
        try {
          editor.setEditable(editable)
        } catch  {
          // Lanjutkan eksekusi meskipun ada error pada editor
          // Karena state React sudah diupdate
        }
        } else {

      }

      // Step 4: Refresh data halaman
      try {
        // Ambil data halaman terbaru dari server untuk memastikan UI konsisten
        const refreshedPage = await getPageById(pageId)

        // Log detail halaman yang direfresh
        if (refreshedPage) {

        }
      } catch {

        // Lanjutkan eksekusi meskipun ada error pada refresh data
      }

      // Hapus flag toggle mode dari sessionStorage
      window.sessionStorage.removeItem('isTogglingMode')

      // Step 5: Verifikasi hasil akhir

      // Log state akhir untuk debugging


      // Tambahkan validasi akhir untuk memastikan konsistensi status halaman dengan mode editor
      try {
        // Ambil data halaman terbaru untuk validasi final
        const finalPageState = await getPageById(pageId)

        if (finalPageState) {
          // Periksa konsistensi antara mode editor dan status halaman
          const expectedStatus =
            targetMode === 'edit'
              ? ModulePageStatus.DRAFT
              : !finalPageState.hasUnpublishedChanges
                ? ModulePageStatus.PUBLISHED
                : ModulePageStatus.DRAFT

          if (finalPageState.status !== expectedStatus) {

          } else {

          }
        }
      } catch {
        // Hanya log error validasi tanpa mengganggu alur utama

      }

      return true // Indikator bahwa toggle berhasil
    } catch (error) {

      showErrorNotification(
        error instanceof Error ? error : new Error('Gagal mengubah mode editor')
      )

      // Kembalikan mode ke nilai sebelumnya jika terjadi error

      setEditorMode(editorMode)
      if (editor) {
        try {
          editor.setEditable(editorMode === 'edit')
        } catch {

        }
      }

      return false // Indikator bahwa toggle gagal
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

  // Fungsi untuk membuang draft - dioptimalkan dengan useCallback
  const handleDiscardDraft = useCallback(async (): Promise<void> => {
    if (!pageId) {
      return
    }

    try {
      const result = await modulePageAdapter.discardDraft(pageId)

      if (result) {
        // Ubah mode ke view setelah membuang draft
        setEditorMode('view')

        // Ubah status halaman ke PUBLISHED
        await updatePageStatus(pageId, ModulePageStatus.PUBLISHED)

        closeRecoveryDialog()
      } else {
        showErrorNotification(new Error('Gagal membuang draft'))
      }
    } catch (error) {
      showErrorNotification(
        error instanceof Error ? error : new Error('Gagal membuang draft')
      )
    }
  }, [pageId, closeRecoveryDialog, updatePageStatus])

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
      discardDraft: modulePageAdapter.discardDraft,
      handleDiscardDraft,
      publishDraft: modulePageAdapter.publishDraft,
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

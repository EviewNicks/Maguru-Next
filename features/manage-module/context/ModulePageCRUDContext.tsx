import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from 'react'
import {
  ModulePage,
  CreateModulePageInput,
  UpdateModulePageInput,
  ContentBlock,
} from '../types/modulePageSchema'
import { useModulePageData } from '../hooks/useModulePageMutation'
import { showErrorNotification } from '../components/ErrorNotifier'
import { logger } from '../services/logger'
import { useRouter } from 'next/navigation'
import debounce from 'lodash/debounce'
import { debugDataFlow } from '../utils/debugUtils'
import { toast } from 'sonner'
import { StandardEditorContent } from '../lib/dataFormats'

// Konstanta untuk context name (logging)
const CONTEXT = 'ModulePageCRUDContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPromise = Promise<any>

// Tipe untuk status penyimpanan
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface ModulePageCRUDContextProps {
  // Data
  moduleId: string
  pages: ModulePage[]
  activePage: ModulePage | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<unknown>

  // Mutation functions dengan tipe yang lebih fleksibel untuk menghindari type conflicts
  createPage: (page: CreateModulePageInput) => AnyPromise
  updatePage: (pageId: string, data: UpdateModulePageInput) => AnyPromise
  deletePage: (pageId: string) => AnyPromise
  reorderPages: (pageIds: string[]) => AnyPromise

  // Tambahkan fungsi updatePageStatus
  updatePageStatus: (params: {
    pageId: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  }) => AnyPromise

  // State management
  setActivePage: (page: ModulePage | null) => void

  // Editor state
  saveStatus: SaveStatus
  setSaveStatus: (status: SaveStatus) => void
  isNavigating: boolean
  setIsNavigating: (isNavigating: boolean) => void

  // Navigation helpers
  getNextPage: (currentPageId?: string) => ModulePage | null
  getPreviousPage: (currentPageId?: string) => ModulePage | null
  getFirstPage: () => ModulePage | null
  getLastPage: () => ModulePage | null

  // Helpers
  getPageById: (pageId: string) => Promise<ModulePage | null>

  savePage: (params: {
    pageId: string
    title?: string
    blocks?: ContentBlock[]
  }) => AnyPromise

  // Tambahkan savePageWrapper ke interface
  savePageWrapper: (
    pageId: string,
    data: { title?: string; blocks?: ContentBlock[] }
  ) => Promise<ModulePage | null>

  // Handler functions
  handlePageChange: (newPageId: string) => void
  handleSelectPage: (page: ModulePage) => void
  handleEditorChange: (content: StandardEditorContent, pageId: string) => void
  handleNavigateToPrevPage: () => void
  handleNavigateToNextPage: () => void
}

const ModulePageCRUDContext = createContext<ModulePageCRUDContextProps | null>(
  null
)

export function useModulePageCRUDContext() {
  const context = useContext(ModulePageCRUDContext)
  if (!context) {
    throw new Error(
      'useModulePageCRUDContext must be used within a ModulePageCRUDProvider'
    )
  }
  return context
}

interface ModulePageCRUDProviderProps {
  children: ReactNode
  moduleId: string
  mockValues?: Partial<ModulePageCRUDContextProps> // Tambahkan prop untuk testing
}

export function ModulePageCRUDProvider({
  children,
  moduleId,
  mockValues = {}, // Default ke object kosong
}: ModulePageCRUDProviderProps) {
  const router = useRouter()

  // State untuk halaman aktif
  const [activePage, setActivePage] = useState<ModulePage | null>(
    mockValues.activePage || null
  )

  // State untuk editor
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    mockValues.saveStatus || 'saved'
  )
  const [isNavigating, setIsNavigating] = useState<boolean>(
    mockValues.isNavigating || false
  )

  // State untuk menyimpan konten terakhir yang dikirim
  const [lastSavedContent, setLastSavedContent] = useState<
    Record<string, string>
  >({})

  // Gunakan useModulePageData untuk akses data
  const {
    pages,
    isPagesLoading: isLoading,
    pagesError: error,
    refetchPages: refetch,
    createPage: createPageOperation,
    updatePage: updatePageOperation,
    deletePage: deletePageOperation,
    reorderPages: reorderPagesOperation,
    saveEditorContent: saveEditorContentMutation,
    getPage,
  } = useModulePageData(moduleId)

  // Debug data flow ketika pages berubah
  useEffect(() => {
    if (pages.length > 0) {
      debugDataFlow('ModulePageCRUDContext', pages)
      logger.debug(
        CONTEXT,
        `Received ${pages.length} pages`,
        pages.map((p: ModulePage) => ({
          id: p.id,
          title: p.title,
          status: p.status,
        }))
      )
    } else if (isLoading) {
      logger.debug(CONTEXT, 'Loading pages...')
    } else if (error) {
      logger.error(CONTEXT, 'Error loading pages', error)
    } else {
      logger.debug(CONTEXT, 'No pages available')
    }
  }, [pages, isLoading, error])

  // Set active page otomatis ke halaman pertama jika belum diset
  React.useEffect(() => {
    if (!activePage && pages.length > 0) {
      logger.info(
        CONTEXT,
        `Auto-setting active page to first page: ${pages[0].title}`
      )
      setActivePage(pages[0])
    }
  }, [activePage, pages, setActivePage])

  // Wrapper functions untuk mutations dengan error handling
  const createPage = useCallback(
    async (page: CreateModulePageInput) => {
      try {
        const result = await createPageOperation(page)
        return result
      } catch (error) {
        logger.error(CONTEXT, 'Error creating page', error)
        showErrorNotification(error)
        throw error
      }
    },
    [createPageOperation]
  )

  const updatePage = useCallback(
    async (pageId: string, data: UpdateModulePageInput) => {
      try {
        const result = await updatePageOperation(pageId, data)
        return result
      } catch (error) {
        logger.error(CONTEXT, 'Error updating page', error)
        showErrorNotification(error)
        throw error
      }
    },
    [updatePageOperation]
  )

  const deletePage = useCallback(
    async (pageId: string) => {
      try {
        const result = await deletePageOperation(pageId)

        // Jika halaman yang dihapus adalah active page, reset ke null
        if (activePage && activePage.id === pageId) {
          setActivePage(null)
        }

        return result
      } catch (error) {
        logger.error(CONTEXT, 'Error deleting page', error)
        showErrorNotification(error)
        throw error
      }
    },
    [deletePageOperation, activePage]
  )

  const reorderPages = useCallback(
    async (pageIds: string[]) => {
      try {
        const result = await reorderPagesOperation(pageIds)
        return result
      } catch (error) {
        logger.error(CONTEXT, 'Error reordering pages', error)
        showErrorNotification(error)
        throw error
      }
    },
    [reorderPagesOperation]
  )

  // Tambahkan implementasi updatePageStatus
  const updatePageStatus = useCallback(
    async (params: {
      pageId: string
      status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    }) => {
      try {
        const { pageId, status } = params

        // Gunakan updatePage yang sudah ada untuk mengubah status
        const result = await updatePage(pageId, {
          status,
        } as UpdateModulePageInput)

        // Jika berhasil, tampilkan notifikasi sukses berdasarkan status
        if (result) {
          const statusMessages = {
            DRAFT: 'Halaman berhasil dikembalikan ke draft',
            PUBLISHED: 'Halaman berhasil dipublikasikan',
            ARCHIVED: 'Halaman berhasil diarsipkan',
          }

          toast.success(
            statusMessages[status] || 'Status halaman berhasil diperbarui'
          )
        }

        return result
      } catch (error) {
        logger.error(CONTEXT, 'Error updating page status', error)
        showErrorNotification(error)
        throw error
      }
    },
    [updatePage]
  )

  // Navigation helpers
  const getNextPage = useCallback(
    (currentPageId?: string) => {
      if (!pages.length) return null

      const pageId = currentPageId || activePage?.id || ''
      if (!pageId) return null

      const currentIndex = pages.findIndex((p: ModulePage) => p.id === pageId)
      if (currentIndex === -1 || currentIndex >= pages.length - 1) return null

      return pages[currentIndex + 1]
    },
    [pages, activePage]
  )

  const getPreviousPage = useCallback(
    (currentPageId?: string) => {
      if (!pages.length) return null

      const pageId = currentPageId || activePage?.id || ''
      if (!pageId) return null

      const currentIndex = pages.findIndex((p: ModulePage) => p.id === pageId)
      if (currentIndex <= 0) return null

      return pages[currentIndex - 1]
    },
    [pages, activePage]
  )

  const getFirstPage = useCallback(() => {
    return pages.length > 0 ? pages[0] : null
  }, [pages])

  const getLastPage = useCallback(() => {
    return pages.length > 0 ? pages[pages.length - 1] : null
  }, [pages])

  // Helper untuk mendapatkan halaman berdasarkan ID
  const getPageById = useCallback(
    async (pageId: string): Promise<ModulePage | null> => {
      try {
        return await getPage(pageId)
      } catch (error) {
        logger.error(CONTEXT, 'Error fetching page by ID', error)
        return null
      }
    },
    [getPage]
  )

  // Handler untuk navigasi halaman
  const handlePageChange = useCallback(
    (newPageId: string) => {
      if (!newPageId) return

      // Tandai bahwa ini adalah navigasi halaman
      setIsNavigating(true)
      window.sessionStorage.setItem('isNavigating', 'true')

      // Navigasi ke halaman baru
      router.push(`/manage-module/pages/${moduleId}?pageId=${newPageId}`)

      // Hapus flag navigasi setelah navigasi selesai
      setTimeout(() => {
        setIsNavigating(false)
        window.sessionStorage.removeItem('isNavigating')
      }, 500)
    },
    [moduleId, router]
  )

  // Handler untuk memilih halaman dari sidebar
  const handleSelectPage = useCallback(
    (page: ModulePage) => {
      if (!page) return

      // Log page selection untuk debugging
      logger.debug(CONTEXT, `Selected page: ${page.id} - ${page.title}`)

      // Buat deep clone page object untuk mencegah referensi yang tidak diinginkan
      const pageClone = JSON.parse(JSON.stringify(page)) as ModulePage

      // Set halaman aktif
      setActivePage(pageClone)

      // Navigasi ke halaman yang dipilih
      handlePageChange(page.id)
    },
    [handlePageChange, setActivePage]
  )

  // Handler untuk perubahan konten editor dengan debounce dan optimasi
  const saveEditorContent = useCallback(
    (content: StandardEditorContent, pageId: string) => {
      if (!pageId) return

      // Jika sedang navigasi, jangan update konten
      if (isNavigating) {
        logger.debug(CONTEXT, 'Navigation in progress, skipping content update')
        return
      }

      // Konversi konten ke string untuk perbandingan
      const contentString = JSON.stringify(content)

      // Periksa apakah konten benar-benar berubah dengan membandingkan dengan yang terakhir disimpan
      if (lastSavedContent[pageId] === contentString) {
        logger.debug(CONTEXT, 'Content unchanged, skipping save')
        return
      }

      // Update status UI
      setSaveStatus('saving')
      logger.debug(CONTEXT, 'Saving page content...')

      // Gunakan hook untuk menyimpan konten editor
      saveEditorContentMutation(pageId, content)
        .then(() => {
          setSaveStatus('saved')
          // Simpan referensi ke konten yang baru disimpan
          setLastSavedContent((prev) => ({ ...prev, [pageId]: contentString }))
          logger.debug(CONTEXT, 'Content saved successfully')
        })
        .catch((error: Error) => {
          logger.error(CONTEXT, 'Error saving content', error)
          setSaveStatus('error')
        })
    },
    [isNavigating, lastSavedContent, setSaveStatus, saveEditorContentMutation]
  )

  // Debounce saveEditorContent untuk mengurangi jumlah API calls
  const handleEditorChange = useMemo(
    () =>
      debounce((content: StandardEditorContent, pageId: string) => {
        saveEditorContent(content, pageId)
      }, 2000), // 2 detik debounce, meningkat dari 500ms
    [saveEditorContent]
  )

  // Handler untuk navigasi ke halaman sebelumnya
  const handleNavigateToPrevPage = useCallback(() => {
    if (!activePage || isNavigating) return

    const prevPage = getPreviousPage(activePage.id)
    if (prevPage) {
      handleSelectPage(prevPage)
    }
  }, [activePage, getPreviousPage, handleSelectPage, isNavigating])

  // Handler untuk navigasi ke halaman berikutnya
  const handleNavigateToNextPage = useCallback(() => {
    if (!activePage || isNavigating) return

    const nextPage = getNextPage(activePage.id)
    if (nextPage) {
      handleSelectPage(nextPage)
    }
  }, [activePage, getNextPage, handleSelectPage, isNavigating])

  // Wrapper untuk savePage agar sesuai dengan tipe yang diharapkan di interface
  const savePage = useCallback(
    (params: {
      pageId: string
      title?: string
      blocks?: ContentBlock[]
    }): AnyPromise => {
      return updatePage(params.pageId, {
        title: params.title,
        blocks: params.blocks,
      })
    },
    [updatePage]
  )

  // Implementasi savePageWrapper yang menggunakan hooks
  const savePageWrapper = useCallback(
    async (
      pageId: string,
      data: { title?: string; blocks?: ContentBlock[] }
    ): Promise<ModulePage | null> => {
      try {
        return await updatePageOperation(pageId, data as UpdateModulePageInput)
      } catch (error) {
        logger.error(CONTEXT, 'Error in savePageWrapper', error)
        throw error
      }
    },
    [updatePageOperation]
  )

  // Memoize context value untuk mencegah re-render yang tidak perlu
  const contextValue = useMemo(
    () => ({
      moduleId,
      pages,
      activePage,
      isLoading,
      error,
      refetch,
      createPage: mockValues.createPage || createPage,
      updatePage: mockValues.updatePage || updatePage,
      deletePage: mockValues.deletePage || deletePage,
      reorderPages: mockValues.reorderPages || reorderPages,
      updatePageStatus: mockValues.updatePageStatus || updatePageStatus,
      setActivePage: mockValues.setActivePage || setActivePage,
      getPageById: mockValues.getPageById || getPageById,
      savePage: mockValues.savePage || savePage,
      savePageWrapper: mockValues.savePageWrapper || savePageWrapper,
      // Navigation helpers
      getNextPage: mockValues.getNextPage || getNextPage,
      getPreviousPage: mockValues.getPreviousPage || getPreviousPage,
      getFirstPage: mockValues.getFirstPage || getFirstPage,
      getLastPage: mockValues.getLastPage || getLastPage,
      // Editor state
      saveStatus,
      setSaveStatus: mockValues.setSaveStatus || setSaveStatus,
      isNavigating,
      setIsNavigating: mockValues.setIsNavigating || setIsNavigating,
      // Handler functions
      handlePageChange: mockValues.handlePageChange || handlePageChange,
      handleSelectPage: mockValues.handleSelectPage || handleSelectPage,
      handleEditorChange: mockValues.handleEditorChange || handleEditorChange,
      handleNavigateToPrevPage:
        mockValues.handleNavigateToPrevPage || handleNavigateToPrevPage,
      handleNavigateToNextPage:
        mockValues.handleNavigateToNextPage || handleNavigateToNextPage,
    }),
    [
      moduleId,
      pages,
      activePage,
      isLoading,
      error,
      refetch,
      createPage,
      updatePage,
      deletePage,
      reorderPages,
      updatePageStatus,
      getPageById,
      savePage,
      savePageWrapper,
      getNextPage,
      getPreviousPage,
      getFirstPage,
      getLastPage,
      saveStatus,
      setSaveStatus,
      isNavigating,
      setIsNavigating,
      handlePageChange,
      handleSelectPage,
      handleEditorChange,
      handleNavigateToPrevPage,
      handleNavigateToNextPage,
      mockValues, // Tambahkan mockValues ke dependencies array
    ]
  )

  return (
    <ModulePageCRUDContext.Provider value={contextValue}>
      {children}
    </ModulePageCRUDContext.Provider>
  )
}

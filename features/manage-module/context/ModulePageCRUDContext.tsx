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
  ContentBlockType,
  ContentBlock,
} from '../types'
import { useModulePageCRUD } from '../hooks/useModulePageCRUD'
import { showErrorNotification } from '../components/ErrorNotifier'
import { useRouter } from 'next/navigation'
import debounce from 'lodash/debounce'
import { debugDataFlow } from '../utils/debugUtils'
import { toast } from 'sonner'

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks?: any[]
  }) => AnyPromise

  // Tambahkan savePageWrapper ke interface
  savePageWrapper: (
    pageId: string,
    data: { title?: string; blocks?: ContentBlock[] }
  ) => Promise<ModulePage | null>

  // Handler functions
  handlePageChange: (newPageId: string) => void
  handleSelectPage: (page: ModulePage) => void
  handleEditorChange: (content: object, pageId: string) => void
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

  // Gunakan hook untuk operasi CRUD
  const {
    pages: hookPages,
    isLoading,
    error,
    refetch,
    createPage: createPageMutation,
    updatePage: updatePageMutation,
    deletePage: deletePageMutation,
    reorderPages: reorderPagesMutation,
    getPageById,
    savePage: savePageMutation,
    savePageWrapper,
  } = useModulePageCRUD(moduleId)

  // Gunakan mock pages jika disediakan, atau pages dari hook
  const pages = mockValues.pages || hookPages

  // Debug data flow ketika pages berubah
  useEffect(() => {
    if (pages.length > 0) {
      debugDataFlow('ModulePageCRUDContext', pages)
      console.log(
        `[ModulePageCRUDContext] Received ${pages.length} pages:`,
        pages.map((p) => ({ id: p.id, title: p.title, status: p.status }))
      )
    } else if (isLoading) {
      console.log('[ModulePageCRUDContext] Loading pages...')
    } else if (error) {
      console.error('[ModulePageCRUDContext] Error loading pages:', error)
    } else {
      console.log('[ModulePageCRUDContext] No pages available')
    }
  }, [pages, isLoading, error])

  // Set active page otomatis ke halaman pertama jika belum diset
  React.useEffect(() => {
    if (!activePage && pages.length > 0) {
      console.log(
        '[ModulePageCRUDContext] Auto-setting active page to first page:',
        pages[0].title
      )
      setActivePage(pages[0])
    }
  }, [activePage, pages])

  // Wrapper functions untuk mutations dengan error handling
  const createPage = useCallback(
    async (page: CreateModulePageInput) => {
      try {
        // Tambahkan null check
        if (!createPageMutation?.mutateAsync) {
          console.warn(
            'createPageMutation not available in testing environment'
          )
          return null
        }
        const result = await createPageMutation.mutateAsync(page)
        return result
      } catch (error) {
        console.error('Error in createPage:', error)
        showErrorNotification(error)
        throw error
      }
    },
    [createPageMutation]
  )

  const updatePage = useCallback(
    async (pageId: string, data: UpdateModulePageInput) => {
      try {
        // Tambahkan null check
        if (!updatePageMutation?.mutateAsync) {
          console.warn(
            'updatePageMutation not available in testing environment'
          )
          return null
        }
        const result = await updatePageMutation.mutateAsync({
          pageId,
          updateData: data,
        })
        return result
      } catch (error) {
        console.error('Error in updatePage:', error)
        showErrorNotification(error)
        throw error
      }
    },
    [updatePageMutation]
  )

  const deletePage = useCallback(
    async (pageId: string) => {
      try {
        // Tambahkan null check
        if (!deletePageMutation?.mutateAsync) {
          console.warn(
            'deletePageMutation not available in testing environment'
          )
          return null
        }
        const result = await deletePageMutation.mutateAsync(pageId)

        // Jika halaman yang dihapus adalah active page, reset ke null
        if (activePage && activePage.id === pageId) {
          setActivePage(null)
        }

        return result
      } catch (error) {
        console.error('Error in deletePage:', error)
        showErrorNotification(error)
        throw error
      }
    },
    [deletePageMutation, activePage]
  )

  const reorderPages = useCallback(
    async (pageIds: string[]) => {
      try {
        // Tambahkan null check
        if (!reorderPagesMutation?.mutateAsync) {
          console.warn(
            'reorderPagesMutation not available in testing environment'
          )
          return null
        }
        const result = await reorderPagesMutation.mutateAsync(pageIds)
        return result
      } catch (error) {
        console.error('Error in reorderPages:', error)
        showErrorNotification(error)
        throw error
      }
    },
    [reorderPagesMutation]
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
        const result = await updatePage(pageId, { status })

        // Jika berhasil, tampilkan notifikasi sukses berdasarkan status
        if (result?.data) {
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
        console.error('Error updating page status:', error)
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

      const currentIndex = pages.findIndex((p) => p.id === pageId)
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

      const currentIndex = pages.findIndex((p) => p.id === pageId)
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
      console.log(`[Context] Selected page: ${page.id} - ${page.title}`)

      // Buat deep clone page object untuk mencegah referensi yang tidak diinginkan
      const pageClone = JSON.parse(JSON.stringify(page)) as ModulePage

      // Set halaman aktif
      setActivePage(pageClone)

      // Navigasi ke halaman yang dipilih
      handlePageChange(page.id)
    },
    [handlePageChange]
  )

  // Handler untuk perubahan konten editor dengan debounce dan optimasi
  const saveEditorContent = useCallback(
    (content: object, pageId: string) => {
      if (!pageId) return

      // Jika sedang navigasi, jangan update konten
      if (isNavigating) {
        console.log('[Context] Navigation in progress, skipping content update')
        return
      }

      // Konversi konten ke string untuk perbandingan
      const contentString = JSON.stringify(content)

      // Periksa apakah konten benar-benar berubah dengan membandingkan dengan yang terakhir disimpan
      if (lastSavedContent[pageId] === contentString) {
        console.log('[Context] Content unchanged, skipping save')
        return
      }

      // Update status UI
      setSaveStatus('saving')
      console.log('[Context] Saving page content...')

      // Konversi konten ke format yang diharapkan API
      const updatedBlocks: ContentBlock[] = [
        {
          type: ContentBlockType.TEXT,
          content: contentString,
        },
      ]

      // Simpan perubahan menggunakan savePageWrapper
      savePageWrapper(pageId, { blocks: updatedBlocks })
        .then(() => {
          setSaveStatus('saved')
          // Simpan referensi ke konten yang baru disimpan
          setLastSavedContent((prev) => ({ ...prev, [pageId]: contentString }))
          console.log('[Context] Content saved successfully')
        })
        .catch((error: Error) => {
          console.error('[Context] Error saving content:', error)
          setSaveStatus('error')
        })
    },
    [isNavigating, savePageWrapper, lastSavedContent]
  )

  // Debounce saveEditorContent untuk mengurangi jumlah API calls
  const handleEditorChange = useMemo(
    () =>
      debounce((content: object, pageId: string) => {
        saveEditorContent(content, pageId)
      }, 2000), // 2 detik debounce, meningkat dari 500ms
    [saveEditorContent]
  )

  // Handler untuk navigasi ke halaman sebelumnya
  const handleNavigateToPrevPage = useCallback(() => {
    if (!activePage || isNavigating) return

    const currentIndex = pages.findIndex((p) => p.id === activePage.id)
    if (currentIndex > 0) {
      const prevPage = pages[currentIndex - 1]
      handleSelectPage(prevPage)
    }
  }, [activePage, pages, handleSelectPage, isNavigating])

  // Handler untuk navigasi ke halaman berikutnya
  const handleNavigateToNextPage = useCallback(() => {
    if (!activePage || isNavigating) return

    const currentIndex = pages.findIndex((p) => p.id === activePage.id)
    if (currentIndex < pages.length - 1) {
      const nextPage = pages[currentIndex + 1]
      handleSelectPage(nextPage)
    }
  }, [activePage, pages, handleSelectPage, isNavigating])

  // Wrapper untuk savePage agar sesuai dengan tipe yang diharapkan di interface
  const savePage = useCallback(
    (params: {
      pageId: string
      title?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks?: any[]
    }): AnyPromise => {
      // Tambahkan null check untuk savePageMutation
      if (!savePageMutation?.mutateAsync) {
        console.warn('savePageMutation not available in testing environment')
        return Promise.resolve(null)
      }
      return savePageMutation.mutateAsync(params)
    },
    [savePageMutation]
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

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
  StandardEditorContent,
  ModulePageStatus,
} from '../types'
import { useModulePageData } from '../hooks/useModulePageData'
import { showErrorNotification } from '../components/ErrorNotifier'
import { logger } from '../services/logger'
import { useRouter } from 'next/navigation'
import debounce from 'lodash/debounce'
import { debugDataFlow } from '../utils/debugUtils'
import { useQueryClient } from '@tanstack/react-query'
import { modulePageAdapter } from '../adapters/modulePageAdapter'

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

  // Perbarui tipe parameter status menggunakan enum ModulePageStatus
  updatePageStatus: (params: {
    pageId: string
    status: ModulePageStatus
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

  // Tambahkan fungsi getParsedEditorContent
  getParsedEditorContent: (page: ModulePage | null) => StandardEditorContent

  savePage: (params: {
    pageId: string
    title?: string
    content?: StandardEditorContent
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
  handleCreateNewPage: () => Promise<ModulePage | null>

  // UI state dari ModulePagesContext
  expandedItems: Record<string, boolean>
  isSidebarOpen: boolean
  toggleExpand: (item: string) => void
  toggleSidebar: () => void
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
  const queryClient = useQueryClient()

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

  // UI state dari ModulePagesContext
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    ModuleContent: true,
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

  // Initialize sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Restore sidebar open state
      const savedSidebarState = localStorage.getItem('moduleSidebarOpen')
      if (savedSidebarState) {
        setIsSidebarOpen(savedSidebarState === 'true')
      }

      // Restore expanded items state
      const savedExpandedItems = localStorage.getItem('moduleExpandedItems')
      if (savedExpandedItems) {
        try {
          const parsedItems = JSON.parse(savedExpandedItems)
          setExpandedItems(parsedItems)
        } catch (error) {
          console.error('Failed to parse saved expanded items:', error)
        }
      }
    }
  }, [])

  // Toggle expand state for sidebar items
  const toggleExpand = useCallback((item: string) => {
    setExpandedItems((prev) => {
      const newState = {
        ...prev,
        [item]: !prev[item],
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('moduleExpandedItems', JSON.stringify(newState))
      }

      return newState
    })
  }, [])

  // Toggle sidebar open/close
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const newState = !prev
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('moduleSidebarOpen', newState.toString())
      }
      return newState
    })
  }, [])

  // Gunakan useModulePageData untuk akses data
  const {
    pagesQuery,
    getPage,
    getParsedEditorContent: getParsedEditorContentOperation,
    createPage: createPageOperation,
    updatePage: updatePageOperation,
    deletePage: deletePageOperation,
    reorderPages: reorderPagesOperation,
    saveEditorContent: saveEditorContentMutation,
    updatePageStatus: updatePageStatusOperation,
  } = useModulePageData(moduleId)

  // Ekstrak data dari pagesQuery
  const pages = Array.isArray(pagesQuery.data) ? pagesQuery.data : []
  const isLoading = pagesQuery.isLoading
  const error = pagesQuery.error
  const refetch = pagesQuery.refetch

  // Debug data flow ketika pagesQuery berubah
  useEffect(() => {
    if (pagesQuery.data !== undefined) {
      logger.debug(
        CONTEXT,
        `pagesQuery.data is type: ${typeof pagesQuery.data}, isArray: ${Array.isArray(pagesQuery.data)}`
      )
    }
  }, [pagesQuery.data])

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
    // Hanya set active page jika:
    // 1. Belum ada active page
    // 2. Ada halaman tersedia
    // 3. Tidak sedang loading
    if (!activePage && pages.length > 0 && !isLoading) {
      const firstPage = pages[0]
      logger.info(
        CONTEXT,
        `Auto-setting active page to first page: ${firstPage.title}`
      )

      // Set active page tanpa memanggil API
      setActivePage(firstPage)

      // Update URL tanpa memanggil handleSelectPage yang mungkin memicu API calls
      if (
        typeof window !== 'undefined' &&
        !window.location.href.includes(`/${firstPage.id}`)
      ) {
        router.replace(`/manage-module/${moduleId}?pageId=${firstPage.id}`, {
          scroll: false,
        })
        // /manage-module/pages/${moduleId}?pageId=${firstPage.id}`
      }
    }
  }, [activePage, pages, isLoading, moduleId, router, setActivePage])

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
        const result = await updatePageOperation({ pageId, data })
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

  // Perbarui implementasi updatePageStatus untuk menggunakan enum ModulePageStatus
  const updatePageStatus = useCallback(
    async (params: { pageId: string; status: ModulePageStatus }) => {
      try {
        const { pageId, status } = params

        // Gunakan hook updatePageStatus
        const result = await updatePageStatusOperation({ pageId, status })

        return result
      } catch (error) {
        logger.error(CONTEXT, 'Error updating page status', error)
        showErrorNotification(error)
        throw error
      }
    },
    [updatePageStatusOperation]
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

      // Navigasi ke halaman baru dengan format path parameter sesuai App Router
      router.push(`/manage-module/${moduleId}?pageId=${newPageId}`)

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

      // Throttling: implementasi throttling sederhana menggunakan timestamp
      const now = Date.now()
      const lastSaveTime = window.sessionStorage.getItem(
        `lastSaveTime_${pageId}`
      )
      const minTimeBetweenSaves = 5000 // 5 detik minimum antara save operations

      if (lastSaveTime && now - parseInt(lastSaveTime) < minTimeBetweenSaves) {
        logger.debug(
          CONTEXT,
          'Save throttled, too recent. Skipping save operation.'
        )
        return
      }

      // Update status UI
      setSaveStatus('saving')
      logger.debug(CONTEXT, 'Saving page content...')

      // Simpan timestamp save terakhir
      window.sessionStorage.setItem(`lastSaveTime_${pageId}`, now.toString())

      // Gunakan hook untuk menyimpan konten editor
      try {
        saveEditorContentMutation({ pageId, content })
        // Simpan referensi ke konten yang baru disimpan
        setLastSavedContent((prev) => ({ ...prev, [pageId]: contentString }))
        setSaveStatus('saved')
        logger.debug(CONTEXT, 'Content saved successfully')
      } catch (error) {
        logger.error(CONTEXT, 'Error saving content', error)
        setSaveStatus('error')
      }
    },
    [isNavigating, lastSavedContent, setSaveStatus, saveEditorContentMutation]
  )

  // Debounce saveEditorContent untuk mengurangi jumlah API calls
  const handleEditorChange = useMemo(
    () =>
      debounce((content: StandardEditorContent, pageId: string) => {
        // Pastikan pageId valid
        if (!pageId) {
          logger.debug(CONTEXT, 'Invalid pageId, skipping editor content save')
          return
        }

        // Cek apakah halaman ada di cache
        const currentPage = pages.find((p) => p.id === pageId)
        if (!currentPage) {
          logger.debug(
            CONTEXT,
            `Page ${pageId} not found in cache, proceeding with save`
          )
          saveEditorContent(content, pageId)
          return
        }

        // Konversi konten ke string untuk perbandingan
        const contentString = JSON.stringify(content)
        const currentContentString = JSON.stringify(currentPage.content)

        // Hanya simpan jika konten benar-benar berubah
        if (contentString !== currentContentString) {
          logger.debug(CONTEXT, `Content changed for page ${pageId}, saving...`)
          saveEditorContent(content, pageId)
        } else {
          logger.debug(
            CONTEXT,
            `Content unchanged for page ${pageId}, skipping save`
          )
        }
      }, 10000), // 10 detik debounce, meningkat dari 5 detik untuk lebih mengurangi API calls
    [saveEditorContent, pages]
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

  // Handle membuat halaman baru dengan format konten yang benar
  const handleCreateNewPage = useCallback(async () => {
    try {
      if (!moduleId) {
        throw new Error('ID Modul tidak ditemukan')
      }

      // Generate default page number
      const pageNumber = pages.length + 1

      // Generate default title
      const defaultTitle = `Halaman Baru ${pageNumber}`

      // Determine order untuk halaman baru (di akhir)
      const newOrder =
        pages.length > 0
          ? Math.max(...pages.map((page: ModulePage) => page.order || 0)) + 1
          : 1

      // Prepare new page data dengan format content yang benar
      const newPageData = {
        title: defaultTitle,
        moduleId,
        type: 'content',
        order: newOrder,
        content: {
          type: 'doc' as const,
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [
                {
                  type: 'text',
                  text: defaultTitle,
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Halaman baru Anda telah dibuat. Mulai edit konten disini.',
                },
              ],
            },
          ],
        },
      }

      logger.info(CONTEXT, `Creating new page for moduleId: ${moduleId}`)

      // Create the page manually with the adapter to bypass the void type issue
      let createdPage: ModulePage | null = null

      try {
        // Call modulePageAdapter.createPage directly to get properly typed result
        createdPage = await modulePageAdapter.createPage(newPageData)
        logger.info(
          CONTEXT,
          `Successfully created page with id: ${createdPage.id}`
        )
      } catch (error) {
        logger.error(CONTEXT, `Error creating page: ${error}`)
        throw error
      }

      // Ensure the query cache is updated
      if (queryClient) {
        // Invalidate the query to trigger a refetch
        await queryClient.invalidateQueries({
          queryKey: ['modulePages', moduleId],
        })
      }

      // Wait for refetch to complete
      await refetch()

      // If somehow we didn't get a valid page, try to find it in the cache
      if (!createdPage) {
        const latestPagesData =
          queryClient.getQueryData<ModulePage[]>(['modulePages', moduleId]) ||
          []

        // Find the newly created page (should be the last one or match the title)
        createdPage =
          latestPagesData.find((p) => p.title === defaultTitle) ||
          latestPagesData[latestPagesData.length - 1] ||
          null

        if (!createdPage) {
          logger.error(CONTEXT, 'Failed to find newly created page in cache')
          throw new Error('Halaman baru tidak ditemukan setelah dibuat')
        }

        logger.info(CONTEXT, `Found page in cache with id: ${createdPage.id}`)
      }

      // Set the newly created page as active
      setActivePage(createdPage)

      // Navigate to the new page
      router.push(`/manage-module/${moduleId}?pageId=${createdPage.id}`)

      return createdPage
    } catch (error) {
      logger.error(CONTEXT, 'Error creating new page', error)
      showErrorNotification(error)
      throw error
    }
  }, [moduleId, pages, refetch, setActivePage, router, queryClient])

  // Wrapper untuk savePage agar sesuai dengan tipe yang diharapkan di interface
  const savePage = useCallback(
    (params: {
      pageId: string
      title?: string
      content?: StandardEditorContent
    }): AnyPromise => {
      // Cek apakah halaman ada di cache
      const currentPage = pages.find((p) => p.id === params.pageId)

      // Jika tidak ada perubahan yang signifikan, skip update
      if (currentPage) {
        let hasChanges = false

        // Cek perubahan title
        if (params.title !== undefined && params.title !== currentPage.title) {
          hasChanges = true
          logger.debug(
            CONTEXT,
            `Title changed from "${currentPage.title}" to "${params.title}"`
          )
        }

        // Cek perubahan content (jika ada)
        if (params.content !== undefined) {
          // Konversi konten ke string untuk perbandingan
          const contentString = JSON.stringify(params.content)
          const currentContentString = JSON.stringify(currentPage.content)

          if (contentString !== currentContentString) {
            hasChanges = true
            logger.debug(CONTEXT, `Content changed for page ${params.pageId}`)
          }
        }

        if (!hasChanges) {
          logger.debug(
            CONTEXT,
            `No significant changes detected for page ${params.pageId}, skipping update`
          )
          return Promise.resolve(currentPage)
        }
      }

      logger.debug(CONTEXT, `Saving page ${params.pageId} with data:`, params)

      return updatePage(params.pageId, {
        title: params.title,
        content: params.content as UpdateModulePageInput['content'],
      })
    },
    [updatePage, pages]
  )

  // Implementasi savePageWrapper yang menggunakan hooks
  const savePageWrapper = useCallback(
    async (
      pageId: string,
      data: { title?: string; blocks?: ContentBlock[] }
    ): Promise<ModulePage | null> => {
      try {
        // Cek apakah halaman ada di cache
        const currentPage = pages.find((p) => p.id === pageId)

        // Jika tidak ada perubahan yang signifikan, skip update
        if (currentPage) {
          let hasChanges = false

          // Cek perubahan title
          if (data.title !== undefined && data.title !== currentPage.title) {
            hasChanges = true
            logger.debug(
              CONTEXT,
              `Title changed from "${currentPage.title}" to "${data.title}"`
            )
          }

          // Cek perubahan blocks (jika ada)
          if (data.blocks !== undefined) {
            hasChanges = true
            logger.debug(CONTEXT, `Content blocks changed for page ${pageId}`)
          }

          if (!hasChanges) {
            logger.debug(
              CONTEXT,
              `No significant changes detected for page ${pageId}, skipping update`
            )
            return currentPage
          }
        }

        logger.debug(CONTEXT, `Updating page ${pageId} with data:`, data)

        // Panggil updatePageOperation jika ada perubahan
        updatePageOperation({
          pageId,
          data: data as UpdateModulePageInput,
        })

        // Tunggu hingga query diperbarui
        await refetch()

        // Ambil halaman yang diperbarui
        const updatedPage = await getPage(pageId)
        return updatedPage
      } catch (error) {
        logger.error(CONTEXT, 'Error in savePageWrapper', error)
        throw error
      }
    },
    [updatePageOperation, refetch, getPage, pages]
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
      handleCreateNewPage:
        mockValues.handleCreateNewPage || handleCreateNewPage,
      // Tambahkan fungsi getParsedEditorContent
      getParsedEditorContent:
        mockValues.getParsedEditorContent ||
        ((page: ModulePage | null) => {
          logger.debug(
            CONTEXT,
            `Getting parsed editor content for page ${page?.id || 'null'}`
          )
          return getParsedEditorContentOperation(page)
        }),
      // UI state dari ModulePagesContext
      expandedItems,
      isSidebarOpen,
      toggleExpand,
      toggleSidebar,
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
      handleCreateNewPage,
      mockValues,
      getParsedEditorContentOperation,
      expandedItems,
      isSidebarOpen,
      toggleExpand,
      toggleSidebar,
    ]
  )

  return (
    <ModulePageCRUDContext.Provider value={contextValue}>
      {children}
    </ModulePageCRUDContext.Provider>
  )
}

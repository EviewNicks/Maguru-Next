import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'
import {
  ModulePage,
  CreateModulePageInput,
  UpdateModulePageInput,
} from '../types'
import { useModulePageCRUD } from '../hooks/useModulePageCRUD'
import { showErrorNotification } from '../components/ErrorNotifier'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPromise = Promise<any>

interface ModulePageCRUDContextProps {
  // Data
  moduleId: string
  pages: ModulePage[]
  activePage: ModulePage | null
  isLoading: boolean
  error: Error | null

  // Mutation functions dengan tipe yang lebih fleksibel untuk menghindari type conflicts

  createPage: (page: CreateModulePageInput) => AnyPromise

  updatePage: (pageId: string, data: UpdateModulePageInput) => AnyPromise

  deletePage: (pageId: string) => AnyPromise

  reorderPages: (pageIds: string[]) => AnyPromise

  // State management
  setActivePage: (page: ModulePage | null) => void

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
    blocks?: any[] // Perlu menggunakan any karena tipe yang kompleks
  }) => AnyPromise
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
}

export function ModulePageCRUDProvider({
  children,
  moduleId,
}: ModulePageCRUDProviderProps) {
  // State untuk halaman aktif
  const [activePage, setActivePage] = useState<ModulePage | null>(null)

  // Gunakan hook untuk operasi CRUD
  const {
    pages,
    isLoading,
    error,
    createPage: createPageMutation,
    updatePage: updatePageMutation,
    deletePage: deletePageMutation,
    reorderPages: reorderPagesMutation,
    getPageById,
    savePage,
  } = useModulePageCRUD(moduleId)

  // Set active page otomatis ke halaman pertama jika belum diset
  React.useEffect(() => {
    if (!activePage && pages.length > 0) {
      setActivePage(pages[0])
    }
  }, [activePage, pages])

  // Wrapper functions untuk mutations dengan error handling
  const createPage = useCallback(
    async (page: CreateModulePageInput) => {
      try {
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

  // Memoize context value untuk mencegah re-render yang tidak perlu
  const contextValue = useMemo(
    () => ({
      moduleId,
      pages,
      activePage,
      isLoading,
      error,
      createPage,
      updatePage,
      deletePage,
      reorderPages,
      setActivePage,
      getPageById,
      savePage,
      // Navigation helpers
      getNextPage,
      getPreviousPage,
      getFirstPage,
      getLastPage,
    }),
    [
      moduleId,
      pages,
      activePage,
      isLoading,
      error,
      createPage,
      updatePage,
      deletePage,
      reorderPages,
      getPageById,
      savePage,
      getNextPage,
      getPreviousPage,
      getFirstPage,
      getLastPage,
    ]
  )

  return (
    <ModulePageCRUDContext.Provider value={contextValue}>
      {children}
    </ModulePageCRUDContext.Provider>
  )
}

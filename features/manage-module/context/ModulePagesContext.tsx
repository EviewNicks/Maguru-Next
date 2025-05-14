'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { ModulePage } from '../types/modulePageSchema'

interface ModulePagesContextProps {
  pages: ModulePage[]
  activePage: ModulePage | null
  expandedItems: Record<string, boolean>
  isSidebarOpen: boolean
  handleSelectPage: (page: ModulePage) => void
  toggleExpand: (item: string) => void
  toggleSidebar: () => void
  setPages: (pages: ModulePage[]) => void
  setActivePage: (page: ModulePage | null) => void
}

const defaultContext: ModulePagesContextProps = {
  pages: [],
  activePage: null,
  expandedItems: { SPRINT: true, ModulePages: true },
  isSidebarOpen: true,
  handleSelectPage: () => {},
  toggleExpand: () => {},
  toggleSidebar: () => {},
  setPages: () => {},
  setActivePage: () => {},
}

const ModulePagesContext =
  createContext<ModulePagesContextProps>(defaultContext)

export function useModulePagesContext() {
  return useContext(ModulePagesContext)
}

interface ModulePagesProviderProps {
  children: ReactNode
}

export function ModulePagesProvider({ children }: ModulePagesProviderProps) {
  const [pages, setPages] = useState<ModulePage[]>([])
  const [activePage, setActivePage] = useState<ModulePage | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    SPRINT: true,
    ModulePages: true,
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

  // Initialize sidebar state from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('moduleSidebarOpen')
      if (savedState) {
        setIsSidebarOpen(savedState === 'true')
      }
    }
  }, [])

  const handleSelectPage = useCallback((page: ModulePage) => {
    setActivePage(page)
  }, [])

  const toggleExpand = useCallback((item: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }, [])

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

  return (
    <ModulePagesContext.Provider
      value={{
        pages,
        activePage,
        expandedItems,
        isSidebarOpen,
        handleSelectPage,
        toggleExpand,
        toggleSidebar,
        setPages,
        setActivePage,
      }}
    >
      {children}
    </ModulePagesContext.Provider>
  )
}

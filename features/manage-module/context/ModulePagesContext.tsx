'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react'
import { useModulePageCRUDContext } from './ModulePageCRUDContext'
import { ModulePage } from '../types/modulePageSchema'

interface ModulePagesContextProps {
  // UI state only
  expandedItems: Record<string, boolean>
  isSidebarOpen: boolean
  // UI actions
  handleSelectPage: (page: ModulePage) => void
  toggleExpand: (item: string) => void
  toggleSidebar: () => void
}

const defaultContext: ModulePagesContextProps = {
  expandedItems: { SPRINT: true, ModulePages: true },
  isSidebarOpen: true,
  handleSelectPage: () => {},
  toggleExpand: () => {},
  toggleSidebar: () => {},
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
  // Remove page state, will be accessed from ModulePageCRUDContext
  // UI state only
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    SPRINT: true,
    ModulePages: true,
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

  // Safe access to the CRUD context
  // We need a consistent reference to this context
  const crudContext = useModulePagesContextSafely()

  // Initialize sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('moduleSidebarOpen')
      if (savedState) {
        setIsSidebarOpen(savedState === 'true')
      }
    }
  }, [])

  // This now safely accesses the CRUD context reference
  const handleSelectPage = useCallback(
    (page: ModulePage) => {
      if (crudContext?.setActivePage) {
        crudContext.setActivePage(page)
      } else {
        console.warn('ModulePageCRUDContext.setActivePage not available')
      }
    },
    [crudContext]
  )

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
        expandedItems,
        isSidebarOpen,
        handleSelectPage,
        toggleExpand,
        toggleSidebar,
      }}
    >
      {children}
    </ModulePagesContext.Provider>
  )
}

// Helper hook to safely access ModulePageCRUDContext
function useModulePagesContextSafely() {
  // Use this pattern to avoid conditional hook calls
  try {
    return useModulePageCRUDContext()
  } catch {
    // Silently return null if context is not available
    return null
  }
}

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react'

// Definisikan tipe untuk context
interface ModulePagesContextProps {
  // UI state only
  expandedItems: Record<string, boolean>
  isSidebarOpen: boolean
  // UI actions
  toggleExpand: (item: string) => void
  toggleSidebar: () => void
}

// Nilai default untuk context
const defaultContext: ModulePagesContextProps = {
  expandedItems: { ModuleContent: true },
  isSidebarOpen: true,
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
  // UI state
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
        toggleExpand,
        toggleSidebar,
      }}
    >
      {children}
    </ModulePagesContext.Provider>
  )
}

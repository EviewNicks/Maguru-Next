'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ModulePage } from '../types/modulePageSchema'

interface ModulePagesContextProps {
  pages: ModulePage[]
  activePage: ModulePage | null
  expandedItems: Record<string, boolean>
  handleSelectPage: (page: ModulePage) => void
  toggleExpand: (item: string) => void
  setPages: (pages: ModulePage[]) => void
  setActivePage: (page: ModulePage | null) => void
}

const defaultContext: ModulePagesContextProps = {
  pages: [],
  activePage: null,
  expandedItems: { SPRINT: true, ModulePages: true },
  handleSelectPage: () => {},
  toggleExpand: () => {},
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

  const handleSelectPage = (page: ModulePage) => {
    setActivePage(page)
  }

  const toggleExpand = (item: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

  return (
    <ModulePagesContext.Provider
      value={{
        pages,
        activePage,
        expandedItems,
        handleSelectPage,
        toggleExpand,
        setPages,
        setActivePage,
      }}
    >
      {children}
    </ModulePagesContext.Provider>
  )
}

'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useModuleData } from '../hooks/useModuleData'
import {
  Module,
  CreateModuleInput,
  UpdateModuleInput,
  ModuleStatus,
} from '../types'
import { toast } from 'sonner'

// Interface untuk context
interface ModuleCRUDContextType {
  // State
  modules: Module[]
  isLoading: boolean
  error: Error | null

  // Fungsi CRUD
  createModule: (data: CreateModuleInput) => Promise<Module | null>
  updateModule: (id: string, data: UpdateModuleInput) => Promise<Module | null>
  deleteModule: (id: string) => Promise<boolean>
  updateModuleStatus: (
    id: string,
    status: ModuleStatus
  ) => Promise<Module | null>

  // Fungsi filter & pagination
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSearchQuery: (query: string) => void
  setStatusFilter: (status: ModuleStatus | undefined) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void

  // State filter & pagination
  page: number
  pageSize: number
  searchQuery: string
  statusFilter: ModuleStatus | undefined
  sortBy: string
  sortOrder: 'asc' | 'desc'
  totalPages: number
  totalItems: number
}

// Default values untuk context
const defaultContextValue: ModuleCRUDContextType = {
  modules: [],
  isLoading: false,
  error: null,

  createModule: async () => null,
  updateModule: async () => null,
  deleteModule: async () => false,
  updateModuleStatus: async () => null,

  setPage: () => {},
  setPageSize: () => {},
  setSearchQuery: () => {},
  setStatusFilter: () => {},
  setSortBy: () => {},
  setSortOrder: () => {},

  page: 1,
  pageSize: 10,
  searchQuery: '',
  statusFilter: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  totalPages: 0,
  totalItems: 0,
}

// Membuat context
const ModuleCRUDContext =
  createContext<ModuleCRUDContextType>(defaultContextValue)

// Hook untuk menggunakan context
export const useModuleCRUD = () => useContext(ModuleCRUDContext)

// Provider untuk context
export const ModuleCRUDProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State untuk filter dan pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ModuleStatus | undefined>(
    undefined
  )
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Menggunakan hook useModuleData untuk operasi CRUD
  const {
    modules,
    isLoading,
    error,
    totalPages,
    totalItems,
    createModule: createModuleAction,
    updateModule: updateModuleAction,
    deleteModule: deleteModuleAction,
    updateModuleStatus: updateModuleStatusAction,
  } = useModuleData({
    page,
    pageSize,
    search: searchQuery,
    status: statusFilter,
    sortBy,
    sortOrder,
  })

  // Handler untuk membuat modul baru
  const createModule = useCallback(
    async (data: CreateModuleInput) => {
      try {
        const result = await createModuleAction(data)
        if (result) {
          toast.success('Modul berhasil dibuat')
          return result
        }
        return null
      } catch {
        toast.error('Gagal membuat modul')
        return null
      }
    },
    [createModuleAction]
  )

  // Handler untuk memperbarui modul
  const updateModule = useCallback(
    async (id: string, data: UpdateModuleInput) => {
      try {
        const result = await updateModuleAction(id, data)
        if (result) {
          toast.success('Modul berhasil diperbarui')
          return result
        }
        return null
      } catch {
        toast.error('Gagal memperbarui modul')
        return null
      }
    },
    [updateModuleAction]
  )

  // Handler untuk menghapus modul
  const deleteModule = useCallback(
    async (id: string) => {
      try {
        const result = await deleteModuleAction(id)
        if (result) {
          toast.success('Modul berhasil dihapus')
          return true
        }
        return false
      } catch {
        toast.error('Gagal menghapus modul')
        return false
      }
    },
    [deleteModuleAction]
  )

  // Handler untuk memperbarui status modul
  const updateModuleStatus = useCallback(
    async (id: string, status: ModuleStatus) => {
      try {
        const result = await updateModuleStatusAction(id, status)
        if (result) {
          toast.success('Status modul berhasil diperbarui')
          return result
        }
        return null
      } catch {
        toast.error('Gagal memperbarui status modul')
        return null
      }
    },
    [updateModuleStatusAction]
  )

  // Nilai untuk context
  const contextValue: ModuleCRUDContextType = {
    modules,
    isLoading,
    error,

    createModule,
    updateModule,
    deleteModule,
    updateModuleStatus,

    setPage,
    setPageSize,
    setSearchQuery,
    setStatusFilter,
    setSortBy,
    setSortOrder,

    page,
    pageSize,
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    totalPages,
    totalItems,
  }

  return (
    <ModuleCRUDContext.Provider value={contextValue}>
      {children}
    </ModuleCRUDContext.Provider>
  )
}

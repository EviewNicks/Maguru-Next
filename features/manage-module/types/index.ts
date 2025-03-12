// features/manage-module/types/index.ts

import { ModuleStatus } from '@prisma/client'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'

export { ModuleStatus, ModulePageType, ProgrammingLanguage }

export interface ModuleCreateInput {
  title: string
  description?: string
  status?: ModuleStatus
  createdBy: string
}

export interface ModuleTableProps {
  modules: Module[]
  isLoading: boolean
  isError: boolean
  pagination?: Pagination
  onLoadMore: () => void
}

export interface ModuleUpdateInput {
  title?: string
  description?: string
  status?: ModuleStatus
  updatedBy: string
}

export interface Module {
  id: string
  title: string
  description: string | null
  status: ModuleStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

export interface GetModulesOptions {
  status?: ModuleStatus
  limit?: number
  cursor?: string
  search?: string
}

export interface FilterType {
  status?: ModuleStatus | 'ALL' 
  search: string
  limit: number
  cursor?: string 
}

export interface ModulesResponse {
  modules: Module[]
  pagination: Pagination
}

export interface Pagination {
  count: number
  hasMore: boolean
  nextCursor?: string
}

export interface ModuleData {
  modules: Module[]
}

// Tipe untuk ModulePage
export interface ModulePage {
  id: string
  moduleId: string
  order: number
  type: ModulePageType
  content: string
  language?: string
  createdAt: Date
  updatedAt: Date
  version: number
}

// Tipe untuk respons daftar halaman modul
export interface ModulePagesResponse {
  pages: ModulePage[]
}

// Tipe untuk input pembuatan halaman modul
export interface ModulePageCreateInput {
  moduleId: string
  order: number
  type: ModulePageType
  content: string
  language?: string
}

// Tipe untuk input pembaruan halaman modul
export interface ModulePageUpdateInput {
  order?: number
  type?: ModulePageType
  content?: string
  language?: string
}

// Tipe untuk input pengurutan ulang halaman
export interface ModulePageReorderInput {
  updates: {
    pageId: string
    order: number
  }[]
}

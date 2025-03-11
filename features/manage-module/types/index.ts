// features/manage-module/types/index.ts

import { ModuleStatus } from '@prisma/client'

export { ModuleStatus }

export interface ModuleCreateInput {
  title: string
  description?: string
  status?: ModuleStatus
  createdBy: string
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
  status?: ModuleStatus // Mengubah menjadi opsional
  search: string
  limit: number
  cursor?: string // Mengubah menjadi opsional
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
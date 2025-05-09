import {
  ContentBlock,
  ContentBlockType,
  CreateModulePageInput,
  UpdateModulePageInput,
} from './modulePageSchema'

export enum ModuleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Module {
  id: string
  title: string
  description?: string
  status: ModuleStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

export interface CreateModuleInput {
  title: string
  description?: string
  status?: ModuleStatus
}

export interface UpdateModuleInput {
  title?: string
  description?: string
  status?: ModuleStatus
}

export interface ModuleQueryParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: string
  }
}

// Re-export types dari modulePageSchema
export { ContentBlockType }
export type { ContentBlock, CreateModulePageInput, UpdateModulePageInput }

export interface ModulePage {
  id: string
  moduleId: string
  title: string
  order: number
  blocks: ContentBlock[] // Menggunakan array blok konten
  createdAt: Date
  updatedAt: Date
}

// Tipe untuk metainfo pagination
export interface PaginationMeta {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}

// Tipe untuk response terhadapi API list
export interface ApiListResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Tipe untuk single entity response
export interface ApiEntityResponse<T> {
  data: T
}

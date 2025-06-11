import {
  ContentBlock,
  ContentBlockType,
  CreateModulePageInput,
  UpdateModulePageInput,
  ModulePageStatus,
} from './modulePageSchema'

export enum ModuleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

// Mengimpor ModulePageStatus dari modulePageSchema
export { ModulePageStatus }

// Type untuk status penyimpanan draft
export type DraftSaveStatus =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'unsaved'
  | 'error'
  | 'offline'
  | 'retrying'

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

// Tipe untuk metainfo pagination
export interface PaginationMeta {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}

// API Response Types
export interface ApiResponse {
  success: boolean
  message?: string
  error?: string
}

export interface ApiEntityResponse<T> extends ApiResponse {
  data: T
}

export interface ApiListResponse<T> extends ApiResponse {
  data: T[]
  meta: PaginationMeta
}

// Interface untuk StandardEditorContent
// Interface ini seharusnya selaras dengan yang ada di dataFormats.ts
export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: Array<{
    type: string
    attrs?: Record<string, unknown>
  }>
}

/**
 * Tipe untuk format standar konten editor
 */
export interface StandardEditorContent {
  type: 'doc'
  content: TiptapNode[]
}

/**
 * Interface untuk data draft
 */
export interface DraftData {
  content: StandardEditorContent
  title?: string
  lastModified: number // timestamp
  version?: number
  authorId: string
}

// Definisi ulang ModulePage agar selaras dengan schema Prisma
export interface ModulePage {
  id: string
  title: string
  moduleId: string
  order: number
  type: string
  content: StandardEditorContent
  version: number
  status: ModulePageStatus
  createdAt: Date
  updatedAt: Date

  // Field baru untuk fitur draft
  authorId?: string
  lastEditBy?: string
  draftData?: StandardEditorContent
  draftSavedAt?: Date
  isDraft: boolean
  hasUnpublishedChanges: boolean
}

// Interface untuk ModulePageService
export interface IModulePageService {
  getModuleIdFromStorage(moduleId?: string): string | null
  createModulePage(
    data: CreateModulePageInput & { language?: string }
  ): Promise<ApiEntityResponse<ModulePage>>
  getModulePages(
    moduleId: string,
    options?: { page?: number; limit?: number; includeContent?: boolean }
  ): Promise<ApiListResponse<ModulePage>>
  getModulePage(pageId: string): Promise<ApiEntityResponse<ModulePage> | null>
  updateModulePage(
    pageId: string,
    data: UpdateModulePageInput
  ): Promise<ApiEntityResponse<ModulePage> | null>
  deleteModulePage(pageId: string): Promise<boolean>
  reorderModulePages(moduleId: string, pageIds: string[]): Promise<boolean>
  parseContent(content: unknown, returnRawJSON?: boolean): StandardEditorContent

  // Fungsi baru untuk fitur draft
  saveDraft(
    pageId: string,
    draftData: StandardEditorContent,
    authorId: string
  ): Promise<ApiEntityResponse<ModulePage> | null>
  getDraft(pageId: string): Promise<ApiEntityResponse<ModulePage> | null>
  publishDraft(pageId: string): Promise<ApiEntityResponse<ModulePage> | null>
  discardDraft(pageId: string): Promise<ApiEntityResponse<ModulePage> | null>
}

// Interface untuk ModulePageAdapter
export interface IModulePageAdapter {
  _cache: {
    pages: {
      [moduleId: string]: {
        data: ModulePage[]
        timestamp: number
      }
    }
    page: {
      [pageId: string]: {
        data: ModulePage
        timestamp: number
      }
    }
    drafts: {
      [pageId: string]: {
        data: ModulePage
        timestamp: number
      }
    }
  }
  invalidateModuleCache(moduleId: string): void
  invalidatePageCache(pageId: string): void
  invalidateDraftCache(pageId: string): void
  validateModuleId(
    moduleId: string | null | undefined
  ): asserts moduleId is string
  validatePageId(pageId: string | null | undefined): asserts pageId is string
  getPages(moduleId: string, skipCache?: boolean): Promise<ModulePage[]>
  getPage(pageId: string, skipCache?: boolean): Promise<ModulePage | null>
  createPage(data: CreateModulePageInput): Promise<ModulePage>
  updatePage(
    pageId: string,
    data: UpdateModulePageInput
  ): Promise<ModulePage | null>
  deletePage(pageId: string): Promise<boolean>
  reorderPages(moduleId: string, pageIds: string[]): Promise<boolean>
  saveEditorContent(
    pageId: string,
    editorContent: unknown
  ): Promise<ModulePage | null>
  getParsedEditorContent(page: ModulePage | null): StandardEditorContent
  updatePageStatus(
    pageId: string,
    status: ModulePageStatus,
    options?: { isDraft?: boolean; hasUnpublishedChanges?: boolean }
  ): Promise<ModulePage | null>

  // Fungsi baru untuk fitur draft
  saveDraft(
    pageId: string,
    editorContent: StandardEditorContent,
    authorId: string
  ): Promise<ModulePage | null>
  getDraft(pageId: string, skipCache?: boolean): Promise<ModulePage | null>
  publishDraft(pageId: string): Promise<ModulePage | null>
  discardDraft(pageId: string): Promise<ApiEntityResponse<ModulePage> | null>
  hasDraft(pageId: string): Promise<boolean>
}

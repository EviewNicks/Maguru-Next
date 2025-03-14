import { Module as PrismaModule, ModulePage as PrismaModulePage } from '@prisma/client'
import { z } from 'zod'
import { ModulePageCreateSchema, ModulePageUpdateSchema, ModulePageReorderSchema, ModulePageType } from './schemas/modulePageSchema'

// Enum untuk status modul
export enum ModuleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

// Enum untuk tipe konten halaman modul
export enum ContentType {
  THEORY = 'teori',
  CODE = 'kode',
}

// Tipe untuk modul
export type Module = PrismaModule

// Tipe untuk halaman modul
export interface ModulePage extends Omit<PrismaModulePage, 'type'> {
  type: ModulePageType;
}

// Tipe untuk input pembuatan halaman modul
export type ModulePageCreateInput = z.infer<typeof ModulePageCreateSchema>

// Tipe untuk input pembaruan halaman modul
export type ModulePageUpdateInput = z.infer<typeof ModulePageUpdateSchema>

// Tipe untuk input pengurutan halaman modul
export type ModulePageReorderInput = z.infer<typeof ModulePageReorderSchema>

// Tipe untuk filter
export interface FilterType {
  status?: ModuleStatus
  search?: string
  limit?: number
  cursor?: string
}

// Tipe untuk pagination
export interface Pagination {
  hasMore: boolean
  nextCursor?: string
}

// Props untuk ModuleTable
export interface ModuleTableProps {
  modules: Module[]
  isLoading: boolean
  isError: boolean
}

// Props untuk ModulePageList
export interface ModulePageListProps {
  moduleId: string
  pages: ModulePage[]
  isLoading: boolean
}

// Props untuk ModulePageFormModal
export interface ModulePageFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleId: string
  contentType: ContentType
  onSubmit?: (data: ModulePageCreateInput | ModulePageUpdateInput) => void
  isLoading?: boolean
  initialData?: ModulePage
}

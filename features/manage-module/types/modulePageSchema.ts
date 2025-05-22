import { z } from 'zod'

/**
 * Enum untuk tipe blok konten yang didukung
 */
export enum ContentBlockType {
  TEXT = 'text',
  CODE = 'code',
  IMAGE = 'image',
  VIDEO = 'video',
  HEADING = 'heading',
}

/**
 * Konstanta ukuran file maksimum
 */
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
export const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024 // 20MB

/**
 * Schema untuk blok konten
 */
export const ContentBlockSchema = z.object({
  type: z.nativeEnum(ContentBlockType),
  content: z.string(),
  caption: z.string().optional(),
  language: z.string().optional(), // untuk blok kode
})

/**
 * Type untuk blok konten
 */
export type ContentBlock = z.infer<typeof ContentBlockSchema>

/**
 * Schema untuk create module page
 */
export const CreateModulePageSchema = z.object({
  title: z.string().min(5, 'Judul harus minimal 5 karakter'),
  moduleId: z.string().uuid(),
  order: z.number().int().min(0),
  type: z.string().default('content'),
  language: z.string().optional(),
  blocks: z
    .array(ContentBlockSchema)
    .min(1, 'Halaman harus memiliki minimal 1 blok konten'),
})

/**
 * Type untuk input create module page
 */
export type CreateModulePageInput = z.infer<typeof CreateModulePageSchema>

/**
 * Schema untuk update module page
 */
export const UpdateModulePageSchema = z.object({
  title: z.string().min(5, 'Judul harus minimal 5 karakter').optional(),
  order: z.number().int().min(0).optional(),
  blocks: z
    .array(ContentBlockSchema)
    .min(1, 'Halaman harus memiliki minimal 1 blok konten')
    .optional(),
  content: z.string().optional(), // Untuk update konten editor langsung
})

/**
 * Type untuk input update module page
 */
export type UpdateModulePageInput = z.infer<typeof UpdateModulePageSchema>

/**
 * Alias untuk kompatibilitas dengan kode yang sudah ada
 */
export type CreateModulePageDto = CreateModulePageInput
export type UpdateModulePageDto = UpdateModulePageInput

/**
 * Schema untuk ModulePage (seperti yang ada di database)
 */
export const ModulePageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  moduleId: z.string().uuid(),
  order: z.number().int(),
  content: z.string().optional(), // Untuk editor sederhana
  blocks: z.array(ContentBlockSchema).optional(), // Untuk editor multi-block (future)
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * Type untuk ModulePage
 */
export type ModulePage = {
  id: string
  title: string
  moduleId: string
  order: number
  content?: string
  blocks?: ContentBlock[]
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: Date
  updatedAt: Date
}

/**
 * Schema untuk response API list
 */
export const ModulePageListResponseSchema = z.object({
  pages: z.array(ModulePageSchema),
  total: z.number(),
})

/**
 * Type untuk response API list
 */
export type ModulePageListResponse = z.infer<
  typeof ModulePageListResponseSchema
>

/**
 * Tipe untuk API response generik
 */
export type ApiResponse<T> = {
  data: T
  error?: string
}

export type ApiListResponse<T> = {
  data: T[]
  total: number
  error?: string
}

/**
 * Schema untuk validasi image upload
 */
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'File tidak valid' })
    .refine(
      (file) => file.size <= MAX_IMAGE_SIZE_BYTES,
      `Ukuran maksimal file adalah ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`
    )
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
          file.type
        ),
      'Format file harus JPEG, PNG, WebP, atau GIF'
    ),
  alt: z.string().optional(),
})

/**
 * Schema untuk validasi video upload
 */
export const videoUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'File tidak valid' })
    .refine(
      (file) => file.size <= MAX_VIDEO_SIZE_BYTES,
      `Ukuran maksimal file adalah ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`
    )
    .refine(
      (file) => ['video/mp4', 'video/webm'].includes(file.type),
      'Format file harus MP4 atau WebM'
    ),
  alt: z.string().optional(),
})

/**
 * Schema validasi untuk query parameter
 */
export const modulePageQuerySchema = z.object({
  moduleId: z.string().uuid({
    message: 'ID Modul tidak valid',
  }),
  includeContent: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
})

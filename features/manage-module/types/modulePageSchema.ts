import { z } from 'zod'

/**
 * Enum untuk status halaman modul
 */
export enum ModulePageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

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
 * Mendukung format Tiptap JSON dan format string
 */
export const ContentBlockSchema = z.union([
  // Format lama: type dari ContentBlockType dengan content (string atau objek)
  z.object({
    type: z.nativeEnum(ContentBlockType),
    content: z.union([
      z.string(),
      z.object({}).passthrough(), // Untuk format Tiptap JSON
    ]),
    caption: z.string().optional(),
    language: z.string().optional(), // untuk blok kode
  }),

  // Format baru: Langsung format Tiptap dengan type="doc"
  z.object({
    type: z.literal('doc'),
    content: z.array(z.object({}).passthrough()),
  }),
])

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
  // Hanya mendukung content dalam format JSONB
  content: z
    .lazy(() => StandardEditorContentSchema)
    .optional()
    .default(() => ({
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    })),
  authorId: z.string().optional(), // ID pengguna yang membuat halaman
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
  type: z.string().optional(),
  // Hanya mendukung content dalam format JSONB
  content: z.lazy(() => StandardEditorContentSchema).optional(),
  // Tambahkan status
  status: z.nativeEnum(ModulePageStatus).optional(),
  // Field untuk tracking
  lastEditBy: z.string().optional(),
})

/**
 * Type untuk input update module page
 */
export type UpdateModulePageInput = z.infer<typeof UpdateModulePageSchema>

/**
 * Schema untuk save draft
 */
export const SaveDraftSchema = z.object({
  pageId: z.string().uuid(),
  draftData: z.lazy(() => StandardEditorContentSchema),
  authorId: z.string(),
  title: z.string().min(5, 'Judul harus minimal 5 karakter').optional(),
})

/**
 * Type untuk input save draft
 */
export type SaveDraftInput = z.infer<typeof SaveDraftSchema>

/**
 * Alias untuk kompatibilitas dengan kode yang sudah ada
 */
export type CreateModulePageDto = CreateModulePageInput
export type UpdateModulePageDto = UpdateModulePageInput

/**
 * Schema untuk StandardEditorContent (format Tiptap)
 */
export const StandardEditorContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(z.object({}).passthrough()),
})

/**
 * Schema untuk ModulePage (seperti yang ada di database)
 */
export const ModulePageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  moduleId: z.string().uuid(),
  order: z.number().int(),
  type: z.string(),
  content: StandardEditorContentSchema,
  version: z.number().int().default(1),
  status: z.nativeEnum(ModulePageStatus).default(ModulePageStatus.DRAFT),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Field baru untuk fitur draft
  authorId: z.string().nullable().optional(),
  lastEditBy: z.string().nullable().optional(),
  draftData: StandardEditorContentSchema.nullable().optional(),
  draftSavedAt: z.date().nullable().optional(),
  isDraft: z.boolean().default(false),
  hasUnpublishedChanges: z.boolean().default(false),
})

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
 * Schema untuk response draft status
 */
export const DraftStatusResponseSchema = z.object({
  status: z.enum([
    'idle',
    'saving',
    'saved',
    'unsaved',
    'error',
    'offline',
    'retrying',
  ]),
  timestamp: z.date().optional(),
  message: z.string().optional(),
})

/**
 * Type untuk response draft status
 */
export type DraftStatusResponse = z.infer<typeof DraftStatusResponseSchema>

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

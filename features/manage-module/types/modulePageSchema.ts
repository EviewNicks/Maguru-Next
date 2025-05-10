import { z } from 'zod'

/**
 * Enum untuk tipe blok konten yang didukung
 */
export enum ContentBlockType {
  TEXT = 'text',
  CODE = 'code',
  IMAGE = 'image',
  VIDEO = 'video',
}

/**
 * Konstanta ukuran file maksimum
 */
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
export const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024 // 20MB

/**
 * Schema untuk blok konten
 */
export const contentBlockSchema = z.object({
  type: z.nativeEnum(ContentBlockType, {
    errorMap: () => ({ message: 'Tipe konten tidak valid' }),
  }),
  content: z.string().min(1, 'Konten tidak boleh kosong'),
  language: z.string().optional(), // Untuk blok kode
  caption: z.string().optional(), // Untuk gambar/video
})

/**
 * Type untuk blok konten
 */
export type ContentBlock = z.infer<typeof contentBlockSchema>

/**
 * Schema untuk create module page
 */
export const createModulePageSchema = z.object({
  moduleId: z.string().uuid('ID modul harus berupa UUID valid'),
  title: z
    .string()
    .min(1, 'Judul tidak boleh kosong')
    .max(255, 'Judul terlalu panjang'),
  order: z.number().int().min(1, 'Urutan minimal 1'),
  blocks: z.array(contentBlockSchema).min(1, 'Minimal harus ada 1 blok konten'),
})

/**
 * Type untuk input create module page
 */
export type CreateModulePageInput = z.infer<typeof createModulePageSchema>

/**
 * Schema untuk update module page
 */
export const updateModulePageSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul tidak boleh kosong')
    .max(255, 'Judul terlalu panjang')
    .optional(),
  order: z.number().int().min(1, 'Urutan minimal 1').optional(),
  blocks: z
    .array(contentBlockSchema)
    .min(1, 'Minimal harus ada 1 blok konten')
    .optional(),
})

/**
 * Type untuk input update module page
 */
export type UpdateModulePageInput = z.infer<typeof updateModulePageSchema>

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

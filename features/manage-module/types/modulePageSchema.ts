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
 * Schema validasi untuk pembuatan halaman modul
 */
export const createModulePageSchema = z.object({
  moduleId: z.string().uuid({
    message: 'ID Modul tidak valid',
  }),
  title: z
    .string()
    .min(5, 'Judul halaman minimal 5 karakter')
    .max(100, 'Judul halaman maksimal 100 karakter'),
  order: z.number().int().positive().optional(),
  blocks: z
    .array(contentBlockSchema)
    .min(1, 'Halaman harus memiliki minimal satu blok konten'),
})

/**
 * Schema validasi untuk pembaruan halaman modul
 */
export const updateModulePageSchema = createModulePageSchema
  .partial()
  .extend({
    id: z.string().uuid({
      message: 'ID halaman tidak valid',
    }),
  })
  .refine(
    (data) => {
      // Setidaknya satu field yang akan diupdate
      return (
        data.title !== undefined ||
        data.order !== undefined ||
        data.blocks !== undefined
      )
    },
    {
      message: 'Tidak ada data yang diubah',
      path: ['_errors'],
    }
  )

/**
 * Type untuk create module page
 */
export type CreateModulePageInput = z.infer<typeof createModulePageSchema>

/**
 * Type untuk update module page
 */
export type UpdateModulePageInput = z.infer<typeof updateModulePageSchema>

/**
 * Schema validasi untuk file upload
 */
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, {
      message: `Ukuran gambar maksimal 2MB`,
    })
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          file.type
        ),
      {
        message: 'Format file harus jpeg, png, gif, atau webp',
      }
    ),
})

export const videoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_VIDEO_SIZE_BYTES, {
      message: `Ukuran video maksimal 20MB`,
    })
    .refine(
      (file) => ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type),
      {
        message: 'Format file harus mp4, webm, atau ogg',
      }
    ),
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

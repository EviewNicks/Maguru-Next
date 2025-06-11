import { z } from 'zod'
import { logger } from '../services/logger'
import { StandardEditorContent, TiptapNode } from '../types'
import { defaultContentJSON } from './content'

// Konstanta untuk context logging
const CONTEXT = 'DataFormats'

/**
 * Standardisasi Format Data untuk Konten Editor
 *
 * File ini menentukan format standar untuk pertukaran data antara komponen-komponen
 * terkait konten editor dalam format JSONB (Tiptap). Semua implementasi blocks lama
 * telah dihapus karena sudah tidak digunakan lagi.
 *
 * Alur penggunaan:
 * 1. Konten dari database/API -> ensureValidEditorContent -> StandardEditorContent untuk editor
 * 2. Konten dari editor -> ensureValidEditorContent -> Simpan ke database
 */

/**
 * Schema validasi untuk format standar editor (Tiptap JSONB)
 * Digunakan untuk memvalidasi struktur konten editor
 */
export const EditorContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(
    z.object({
      type: z.string(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      content: z.lazy(() => z.array(z.any())).optional(),
      text: z.string().optional(),
      marks: z
        .array(
          z.object({
            type: z.string(),
            attrs: z.record(z.string(), z.unknown()).optional(),
          })
        )
        .optional(),
    })
  ),
})

/**
 * Validasi konten editor menggunakan Zod schema
 * @param content - Konten yang akan divalidasi
 * @returns Boolean yang menunjukkan apakah konten valid
 */
export function validateEditorContent(content: unknown): boolean {
  try {
    EditorContentSchema.parse(content)
    return true
  } catch (error) {
    logger.error(CONTEXT, 'Editor content validation failed', error)
    return false
  }
}

/**
 * Cek apakah JSON string valid dan memiliki format Tiptap
 * @param content - String JSON yang akan dicek
 * @returns Object Tiptap jika valid, null jika tidak
 */
export function isValidTiptapJSON(
  content?: string
): StandardEditorContent | null {
  if (!content) return null

  try {
    const parsedContent = JSON.parse(content)

    // Verifikasi menggunakan Zod schema
    if (validateEditorContent(parsedContent)) {
      logger.debug(CONTEXT, 'Valid Tiptap JSON detected')
      return parsedContent as StandardEditorContent
    }

    return null
  } catch (error) {
    logger.debug(CONTEXT, 'Content is not valid JSON', error)
    return null
  }
}

/**
 * Memastikan konten editor valid dan dalam format StandardEditorContent
 * Fungsi ini adalah fungsi utama yang harus digunakan di semua layer
 * untuk memastikan konsistensi format data
 *
 * @param content - Konten yang akan divalidasi (bisa berupa object, string, atau null)
 * @returns Konten yang sudah divalidasi dalam format StandardEditorContent
 */
export function ensureValidEditorContent(
  content: unknown
): StandardEditorContent {
  // Jika content kosong, kembalikan default
  if (!content) {
    logger.debug(CONTEXT, 'No content provided, returning default content')
    return defaultContentJSON
  }

  // Validasi content jika berbentuk objek
  if (
    typeof content === 'object' &&
    content !== null &&
    'type' in content &&
    content.type === 'doc' &&
    'content' in content &&
    Array.isArray((content as Record<string, unknown>).content)
  ) {
    if (validateEditorContent(content)) {
      return content as StandardEditorContent
    }
  }

  // Jika string, coba parse sebagai JSON
  if (typeof content === 'string') {
    const parsedContent = isValidTiptapJSON(content)
    if (parsedContent) {
      return parsedContent
    }
  }

  // Fallback ke default
  logger.warn(CONTEXT, 'Invalid content format, returning default content')
  return defaultContentJSON
}

/**
 * Membuat dokumen kosong dengan format Tiptap
 * @returns Format standar dokumen kosong Tiptap
 */
export function createEmptyDocument(): StandardEditorContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      } as TiptapNode,
    ],
  }
}

/**
 * Mengekstrak teks dari konten Tiptap untuk preview atau pencarian
 * @param content - Konten editor dalam format StandardEditorContent
 * @param maxLength - Panjang maksimal teks yang diambil (default: 100)
 * @returns Teks yang diekstrak dari konten
 */
export function extractTextFromContent(
  content: StandardEditorContent | null,
  maxLength: number = 100
): string {
  if (!content || !content.content || !Array.isArray(content.content)) {
    return ''
  }

  const extractFromNode = (node: TiptapNode): string => {
    if (node.text) {
      return node.text
    }

    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join(' ')
    }

    return ''
  }

  const fullText = content.content.map(extractFromNode).join(' ')
  return fullText.length > maxLength
    ? `${fullText.substring(0, maxLength)}...`
    : fullText
}

/**
 * Konversi konten dari format apapun ke StandardEditorContent
 * Fungsi ini digunakan sebagai alias untuk ensureValidEditorContent
 * untuk memperjelas tujuan penggunaannya
 *
 * @param content - Konten yang akan dikonversi
 * @returns Konten dalam format StandardEditorContent
 */
export function convertToStandardFormat(
  content: unknown
): StandardEditorContent {
  return ensureValidEditorContent(content)
}

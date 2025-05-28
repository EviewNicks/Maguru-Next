import { ContentBlock, ContentBlockType } from '../types/modulePageSchema'
import { z } from 'zod'
import { logger } from '../services/logger'
import { defaultContentJSON } from './content'
import { ModulePage, TiptapNode, StandardEditorContent } from '../types'

// Konstanta untuk context logging
const CONTEXT = 'DataFormats'

/**
 * Standardisasi Format Data untuk Konten Editor
 *
 * File ini menentukan format standar untuk pertukaran data antara komponen-komponen
 * terkait konten editor. Penggunaan format standar akan mengurangi kebutuhan parsing
 * berulang dan memperbaiki konsistensi data.
 */

/**
 * Schema validasi untuk format standar editor
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
 * Parse blok pertama dari data halaman untuk mendapatkan konten Tiptap
 * @param blocks - Array ContentBlock dari halaman
 * @returns Object Tiptap jika valid, null jika tidak
 */
export function parseFirstBlock(
  blocks?: ContentBlock[]
): StandardEditorContent | null {
  if (!blocks || blocks.length === 0) return null

  const firstBlock = blocks[0]

  // Case 1: Blok langsung berformat Tiptap (type: "doc")
  if (firstBlock.type === 'doc' && Array.isArray(firstBlock.content)) {
    logger.debug(CONTEXT, 'Found direct Tiptap JSON structure')
    const content = {
      type: 'doc' as const,
      content: Array.isArray(firstBlock.content)
        ? firstBlock.content.map((item) => item as unknown as TiptapNode)
        : [],
    }

    if (validateEditorContent(content)) {
      return content
    }
  }

  // Case 2: Blok TEXT dengan content berupa objek Tiptap
  if (
    firstBlock.type === ContentBlockType.TEXT &&
    typeof firstBlock.content === 'object' &&
    firstBlock.content !== null &&
    'type' in firstBlock.content &&
    firstBlock.content.type === 'doc'
  ) {
    logger.debug(CONTEXT, 'Found Tiptap JSON object in block content')
    if (validateEditorContent(firstBlock.content)) {
      return firstBlock.content as unknown as StandardEditorContent
    }
  }

  // Case 3: Blok TEXT dengan content berupa string JSON Tiptap
  if (
    firstBlock.type === ContentBlockType.TEXT &&
    typeof firstBlock.content === 'string' &&
    firstBlock.content.startsWith('{') &&
    firstBlock.content.includes('"type":"doc"')
  ) {
    try {
      const parsedContent = JSON.parse(firstBlock.content)
      if (validateEditorContent(parsedContent)) {
        logger.debug(CONTEXT, 'Successfully parsed Tiptap JSON from block')
        return parsedContent as StandardEditorContent
      }
    } catch (error) {
      logger.error(CONTEXT, 'Failed to parse Tiptap JSON from block', error)
    }
  }

  return null
}

/**
 * Konversi blocks ke format Tiptap
 * @param blocks - Array ContentBlock yang akan dikonversi
 * @returns Object dengan format Tiptap doc
 */
export function convertBlocksToTiptap(
  blocks: ContentBlock[]
): StandardEditorContent {
  logger.debug(CONTEXT, 'Converting blocks to Tiptap format', {
    blockCount: blocks.length,
  })

  const content: StandardEditorContent = {
    type: 'doc',
    content: blocks.flatMap((block) => {
      // Case 1: Blok dengan type 'doc' dan content array
      if (block.type === 'doc' && Array.isArray(block.content)) {
        return (block.content as unknown[]).map(
          (item) => item as unknown as TiptapNode
        )
      }

      // Case 2: Blok dengan content berupa objek Tiptap
      if (
        typeof block.content === 'object' &&
        block.content !== null &&
        'type' in block.content &&
        block.content.type === 'doc' &&
        Array.isArray(block.content.content)
      ) {
        return (block.content.content as unknown[]).map(
          (item) => item as unknown as TiptapNode
        )
      }

      // Case 3: Blok TEXT dengan content string
      if (
        block.type === ContentBlockType.TEXT &&
        typeof block.content === 'string'
      ) {
        try {
          // Coba parse sebagai JSON
          const parsed = JSON.parse(block.content)
          if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
            return (parsed.content as unknown[]).map(
              (item) => item as unknown as TiptapNode
            )
          }
        } catch (e) {
          // Jika bukan JSON, buat paragraf baru dengan teks
          return [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: block.content }],
            } as TiptapNode,
          ]
        }
      }

      // Default fallback
      return [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Konten tidak valid' }],
        } as TiptapNode,
      ]
    }),
  }

  // Validasi format sebelum mengembalikan
  if (validateEditorContent(content)) {
    return content
  }

  // Jika tidak valid, kembalikan dokumen kosong
  logger.warn(
    CONTEXT,
    'Generated content failed validation, returning default content'
  )
  return defaultContentJSON as StandardEditorContent
}

/**
 * Konversi blocks dari ModulePage ke format standar untuk editor
 * @param blocks - Blocks dari ModulePage
 * @returns Format standar untuk editor
 */
export function blocksToStandardContent(
  blocks?: ContentBlock[]
): StandardEditorContent {
  if (!blocks || blocks.length === 0) {
    logger.debug(CONTEXT, 'No blocks provided, returning empty document')
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    }
  }

  logger.debug(
    CONTEXT,
    `Converting ${blocks.length} blocks to standard content`
  )

  // Coba parse dari block pertama dulu
  const parsedBlock = parseFirstBlock(blocks)
  if (parsedBlock) {
    return parsedBlock
  }

  // Jika tidak berhasil, konversi semua block
  return convertBlocksToTiptap(blocks)
}

/**
 * Konversi format standar editor ke blocks untuk disimpan di database
 * @param content - Konten editor dalam format standar
 * @returns Blocks untuk disimpan di database
 */
export function standardContentToBlocks(
  content: StandardEditorContent
): ContentBlock[] {
  logger.debug(CONTEXT, 'Converting standard content to blocks')

  // Validasi content
  if (!validateEditorContent(content)) {
    logger.warn(CONTEXT, 'Content validation failed, using fallback content')
    return [
      {
        type: ContentBlockType.TEXT,
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Invalid content format' }],
            },
          ],
        }),
      },
    ]
  }

  return [
    {
      type: ContentBlockType.TEXT,
      content: JSON.stringify(content),
    },
  ]
}

/**
 * Fungsi utama untuk parsing konten
 * @param content - String JSON konten
 * @param pageData - Data halaman (opsional)
 * @param returnRawJSON - Flag untuk mengembalikan JSON mentah
 * @returns Hasil parsing sebagai StandardEditorContent atau ContentBlock[]
 */
export function parseContent(
  content?: string,
  pageData?: ModulePage,
  returnRawJSON: boolean = false
): StandardEditorContent | ContentBlock[] {
  logger.debug(CONTEXT, 'Parsing content', {
    contentLength: content ? content.length : 0,
    hasPageData: !!pageData,
    returnRawJSON,
  })

  try {
    // Step 1: Cek jika content adalah JSON Tiptap valid
    let tiptapContent = isValidTiptapJSON(content)

    // Step 2: Jika tidak valid, coba parse dari pageData blocks
    if (!tiptapContent && pageData?.blocks) {
      tiptapContent = parseFirstBlock(pageData.blocks)

      // Step 3: Jika masih tidak valid, konversi blocks ke format Tiptap
      if (!tiptapContent) {
        tiptapContent = convertBlocksToTiptap(pageData.blocks)
      }
    }

    // Step 4: Fallback ke default jika masih tidak ada konten
    if (!tiptapContent) {
      logger.debug(CONTEXT, 'Using default content JSON')
      tiptapContent = defaultContentJSON as StandardEditorContent
    }

    // Step 5: Return sesuai format yang diminta
    if (returnRawJSON) {
      return tiptapContent
    }

    return standardContentToBlocks(tiptapContent)
  } catch (error) {
    logger.error(CONTEXT, 'Error in parseContent', error)

    // Default fallback
    if (returnRawJSON) {
      return defaultContentJSON as StandardEditorContent
    }

    return standardContentToBlocks(defaultContentJSON as StandardEditorContent)
  }
}

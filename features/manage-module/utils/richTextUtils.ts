'use client'

import { Editor } from '@tiptap/react'
import { ContentBlock, ContentBlockType } from '../types/modulePageSchema'

/**
 * Mengkonversi HTML content menjadi format JSON Tiptap
 * @param htmlContent - String HTML
 * @param editor - Instance editor Tiptap
 * @returns Object JSON Tiptap
 */
export function htmlToTiptapJson(
  htmlContent: string,
  editor: Editor
): Record<string, unknown> {
  // Gunakan fungsi setContent dan getJSON dari editor
  editor.commands.setContent(htmlContent)
  return editor.getJSON()
}

/**
 * Mengkonversi JSON Tiptap menjadi HTML
 * @param jsonContent - JSON Tiptap object
 * @param editor - Instance editor Tiptap
 * @returns String HTML
 */
export function tiptapJsonToHtml(
  jsonContent: Record<string, unknown>,
  editor: Editor
): string {
  // Gunakan fungsi setContent dan getHTML dari editor
  editor.commands.setContent(jsonContent)
  return editor.getHTML()
}

/**
 * Mengkonversi JSON Tiptap menjadi format ContentBlock untuk API
 * @param jsonContent - JSON Tiptap object atau string JSON
 * @returns ContentBlock array
 */
export function tiptapJsonToContentBlocks(
  jsonContent: Record<string, unknown> | string
): ContentBlock[] {
  const jsonString = typeof jsonContent === 'string'
    ? jsonContent
    : JSON.stringify(jsonContent)
  
  // Buat block dengan format yang benar untuk API
  return [
    {
      type: ContentBlockType.TEXT,
      content: jsonString,
    },
  ]
}

/**
 * Periksa apakah konten dalam format JSON Tiptap
 * @param content - String yang akan diperiksa
 * @returns Boolean
 */
export function isTiptapJson(content: string): boolean {
  try {
    if (!content.startsWith('{')) return false
    
    const json = JSON.parse(content)
    return json && 
           typeof json === 'object' && 
           json.type === 'doc' && 
           Array.isArray(json.content)
  } catch (e) {
    return false
  }
}

/**
 * Mengekstrak JSON Tiptap dari ContentBlock
 * @param blocks - Array ContentBlock
 * @returns JSON Tiptap object atau null jika tidak ditemukan
 */
export function extractTiptapJsonFromBlocks(
  blocks: ContentBlock[]
): Record<string, unknown> | null {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null
  }

  // Cek apakah blocks mengandung JSON Tiptap
  if (
    blocks.length === 1 &&
    blocks[0].type === ContentBlockType.TEXT &&
    typeof blocks[0].content === 'string'
  ) {
    const content = blocks[0].content
    
    // Cek apakah content adalah JSON Tiptap
    if (isTiptapJson(content)) {
      try {
        return JSON.parse(content)
      } catch (e) {
        console.error('Error parsing Tiptap JSON:', e)
      }
    }
  }

  return null
} 
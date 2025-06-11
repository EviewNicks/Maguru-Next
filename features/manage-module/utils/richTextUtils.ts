'use client'

import { Editor } from '@tiptap/react'

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
 * Periksa apakah konten dalam format JSON Tiptap
 * @param content - String yang akan diperiksa
 * @returns Boolean
 */
export function isTiptapJson(content: string): boolean {
  try {
    if (!content.startsWith('{')) return false

    const json = JSON.parse(content)
    return (
      json &&
      typeof json === 'object' &&
      json.type === 'doc' &&
      Array.isArray(json.content)
    )
  } catch {
    return false
  }
}

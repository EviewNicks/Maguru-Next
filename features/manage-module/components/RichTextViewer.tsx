'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { StandardEditorContent } from '../types'
import { Loader2 } from 'lucide-react'
import { ErrorBoundary } from './ErrorBoundary'
import '@/styles/tiptap.css'

export interface RichTextViewerProps {
  className?: string
  content?: StandardEditorContent
  isLoading?: boolean
}

// Definisikan tipe untuk node Tiptap
interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

// Definisikan tipe untuk mark Tiptap
interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

/**
 * RichTextViewer - Komponen ringan untuk menampilkan konten rich text
 *
 * Komponen ini khusus dioptimalkan untuk mode view, tanpa instance editor aktif
 * untuk menghindari overhead performa yang tidak perlu.
 */
export function RichTextViewer({
  className,
  content,
  isLoading = false,
}: RichTextViewerProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    )
  }

  // Jika tidak ada konten, tampilkan placeholder
  if (!content) {
    return (
      <div className="prose prose-slate max-w-full p-4">
        <p className="text-gray-400 italic">Tidak ada konten</p>
      </div>
    )
  }

  /**
   * Fungsi untuk merender konten Tiptap secara statis
   *
   * Catatan: Implementasi ini adalah versi sederhana. Untuk implementasi lengkap,
   * kita mungkin perlu menggunakan library seperti tiptap-markdown atau membuat
   * renderer custom yang lebih canggih.
   */
  const renderContent = () => {
    try {
      // Contoh implementasi sederhana untuk merender konten
      // Di implementasi nyata, kita perlu parser yang lebih canggih
      return (
        <div
          className="tiptap-content-static"
          dangerouslySetInnerHTML={{
            __html: renderTiptapContent(content),
          }}
        />
      )
    } catch (error) {
      console.error('Error rendering content:', error)
      return <p className="text-red-500">Error rendering content</p>
    }
  }

  return (
    <ErrorBoundary name="RichTextViewer">
      <div
        className={cn(
          'rich-text-view-mode prose prose-slate max-w-full',
          'p-4 overflow-auto min-h-[50vh]',
          className
        )}
      >
        {renderContent()}
      </div>
    </ErrorBoundary>
  )
}

/**
 * Fungsi helper untuk merender konten Tiptap ke HTML
 *
 * Catatan: Implementasi ini adalah versi sangat sederhana.
 * Untuk implementasi lengkap, kita perlu parser yang lebih canggih
 * yang mendukung semua node dan mark Tiptap.
 */
export function renderTiptapContent(content: StandardEditorContent): string {
  let html = ''

  // Implementasi basic untuk rendering
  // Ini hanya contoh sederhana, implementasi nyata memerlukan lebih banyak logika
  if (content.content) {
    content.content.forEach((node) => {
      switch (node.type) {
        case 'paragraph':
          html += `<p>${renderInlineContent(node)}</p>`
          break
        case 'heading':
          const level = node.attrs?.level || 1
          html += `<h${level}>${renderInlineContent(node)}</h${level}>`
          break
        case 'bulletList':
          html += `<ul>${renderListItems(node)}</ul>`
          break
        case 'orderedList':
          html += `<ol>${renderListItems(node)}</ol>`
          break
        case 'image':
          if (node.attrs?.src) {
            html += `<figure class="image-container">
              <img src="${node.attrs.src}" alt="${node.attrs?.alt || ''}" />
              ${node.attrs?.caption ? `<figcaption>${node.attrs.caption}</figcaption>` : ''}
            </figure>`
          }
          break
        default:
          if (node.content) {
            node.content.forEach((childNode) => {
              html += renderTiptapContent({ type: 'doc', content: [childNode] })
            })
          }
      }
    })
  }

  return html
}

/**
 * Fungsi helper untuk merender konten inline (teks dengan mark)
 */
function renderInlineContent(node: TiptapNode): string {
  if (!node.content) return ''

  let text = ''

  node.content.forEach((item: TiptapNode) => {
    if (item.type === 'text') {
      let content = item.text || ''

      // Terapkan mark jika ada
      if (item.marks && item.marks.length > 0) {
        item.marks.forEach((mark: TiptapMark) => {
          switch (mark.type) {
            case 'bold':
              content = `<strong>${content}</strong>`
              break
            case 'italic':
              content = `<em>${content}</em>`
              break
            case 'underline':
              content = `<u>${content}</u>`
              break
            case 'strike':
              content = `<s>${content}</s>`
              break
            case 'link':
              content = `<a href="${mark.attrs?.href || '#'}" ${mark.attrs?.target ? `target="${mark.attrs.target}"` : ''}>${content}</a>`
              break
            case 'highlight':
              content = `<mark>${content}</mark>`
              break
          }
        })
      }

      text += content
    } else if (item.content) {
      text += renderInlineContent(item)
    }
  })

  return text
}

/**
 * Fungsi helper untuk merender list items
 */
function renderListItems(node: TiptapNode): string {
  if (!node.content) return ''

  let html = ''

  node.content.forEach((item: TiptapNode) => {
    if (item.type === 'listItem') {
      html += `<li>${renderInlineContent(item)}</li>`
    }
  })

  return html
}

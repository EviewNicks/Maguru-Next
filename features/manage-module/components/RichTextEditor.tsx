'use client'
import '@/styles/tiptap.css'
import { cn } from '@/lib/utils'
import { ImageExtension } from '@/features/manage-module/components/ModulePageEditor/extension/Image'
import { ImagePlaceholder } from '@/features/manage-module/components/ModulePageEditor/extension/ImagePlaceholder'
import SearchAndReplace from '@/features/manage-module/components/ModulePageEditor/extension/SearchAndReplace'

import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import { EditorContent, type Extension, useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { TipTapFloatingMenu } from '@/features/manage-module/components/ModulePageEditor/extension/FloatingMenu'
import { FloatingToolbar } from '@/features/manage-module/components/ModulePageEditor/extension/FloatingToolbar'
import { EditorToolbar } from '@/features/manage-module/components/ModulePageEditor/toolbars/EditorToolbar'
import Placeholder from '@tiptap/extension-placeholder'

import { content as defaultContent } from '@/features/manage-module/lib/content'
import { useRichTextAutosave } from '@/features/manage-module/hooks/useRichTextAutosave'
import { useCallback, useEffect, useState } from 'react'
import { SaveIcon, AlertTriangle, RefreshCw } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ErrorBoundary } from './ErrorBoundary'
import { Button } from '@/components/ui/button'

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal',
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc',
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: 'is-editor-empty',
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading':
          return `Heading ${node.attrs.level}`
        case 'detailsSummary':
          return 'Section title'
        case 'codeBlock':
          // never show the placeholder when editing code
          return ''
        default:
          return "Write, type '/' for commands"
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  Typography,
]

interface RichTextEditorProps {
  className?: string
  onChange?: (content: string) => void
  initialContent?: string
  pageId?: string
  autosave?: boolean
}

// Perbaiki fungsi parseContent untuk menangani blocks dengan lebih baik
function parseContent(content: string | undefined): string {
  if (!content) return defaultContent

  try {
    // Cek apakah content adalah JSON string (dari blocks)
    if (content.startsWith('[') && content.includes('"type"')) {
      console.log('Parsing JSON content:', content.substring(0, 100))
      const blocks = JSON.parse(content)

      // Jika blocks valid, gabungkan content dari setiap block
      if (Array.isArray(blocks)) {
        console.log('Valid blocks array with', blocks.length, 'blocks')

        // Konversi blocks menjadi HTML sederhana
        const htmlContent = blocks
          .map((block) => {
            if (!block || !block.content) return ''

            if (block.type === 'text' || block.type === 'paragraph') {
              return block.content // Sudah dalam format HTML
            } else if (block.type === 'heading') {
              return `<h2>${block.content}</h2>`
            } else if (block.type === 'code') {
              return `<pre><code>${block.content}</code></pre>`
            }
            return block.content || ''
          })
          .join('')

        console.log('Converted to HTML:', htmlContent.substring(0, 100))
        return htmlContent || defaultContent
      }
    }

    // Jika bukan JSON atau parsing gagal, gunakan content sebagai HTML
    return content
  } catch (error) {
    console.error('Error parsing content:', error)
    return content || defaultContent
  }
}

// Komponen khusus untuk autosave
function RichTextEditorWithAutosave({
  pageId,
  className,
  initialContent,
  onChange,
}: Omit<RichTextEditorProps, 'autosave'> & { pageId: string }) {
  // State untuk menyimpan content yang sudah di-parse
  const [parsedContent, setParsedContent] = useState<string>(defaultContent)

  // Parse initialContent saat komponen dimount
  useEffect(() => {
    try {
      console.log(
        'Initial content received:',
        initialContent?.substring(0, 100)
      )

      // Cek apakah initialContent adalah string JSON
      if (initialContent && initialContent.startsWith('[')) {
        const parsedBlocks = JSON.parse(initialContent)
        console.log('Parsed blocks:', parsedBlocks)

        // Jika blocks valid, set parsed content
        if (Array.isArray(parsedBlocks)) {
          setParsedContent(parseContent(initialContent))
        }
      } else {
        // Jika bukan JSON, gunakan sebagai HTML
        setParsedContent(initialContent || defaultContent)
      }
    } catch (error) {
      console.error('Error processing initial content:', error)
      setParsedContent(defaultContent)
    }
  }, [initialContent])

  // Gunakan hook autosave secara langsung di komponen
  const {
    content: autoSavedContent,
    saveStatus,
    handleContentChange,
    forceSave,
  } = useRichTextAutosave(pageId, parsedContent)

  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML()
      handleContentChange(html)
      if (onChange) onChange(html)
    },
    [onChange, handleContentChange]
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content: autoSavedContent || parsedContent,
    editorProps: {
      attributes: {
        class: 'max-w-full focus:outline-none',
      },
    },
    onUpdate: handleUpdate,
  })

  // Jika editor tidak berhasil dimuat, tampilkan pesan error
  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-red-400">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span>Gagal memuat editor. Silakan muat ulang halaman.</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-auto border bg-card pb-[60px] sm:pb-0',
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />
      <EditorContent
        editor={editor}
        className="h-full w-full min-w-full cursor-text sm:p-6"
      />

      {/* Save Status Indicator (Enhanced) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 p-2 rounded-md bg-[#242528] text-xs">
        <TooltipProvider>
          {saveStatus === 'saved' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-green-400 transition-opacity">
                  <SaveIcon className="w-3 h-3" />
                  <span>Tersimpan</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Perubahan tersimpan otomatis</TooltipContent>
            </Tooltip>
          )}

          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1 text-yellow-400 animate-pulse transition-all">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Menyimpan...</span>
            </div>
          )}

          {saveStatus === 'unsaved' && (
            <div className="flex items-center gap-1 text-yellow-400 transition-all">
              <RefreshCw className="w-3 h-3" />
              <span>Menunggu menyimpan...</span>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-400 transition-all">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Gagal menyimpan</span>
              </div>

              <div className="flex gap-2 ml-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-1 rounded hover:bg-zinc-700 transition-colors"
                      onClick={forceSave}
                      aria-label="Coba lagi"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Coba menyimpan lagi</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </TooltipProvider>
      </div>
    </div>
  )
}

// Komponen standar tanpa autosave
function RichTextEditorStandard({
  className,
  onChange,
  initialContent,
}: Omit<RichTextEditorProps, 'autosave' | 'pageId'>) {
  // Parse initialContent
  const [parsedContent, setParsedContent] = useState<string>(defaultContent)

  useEffect(() => {
    setParsedContent(parseContent(initialContent))
  }, [initialContent])

  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      if (onChange) {
        const html = editor.getHTML()
        onChange(html)
      }
    },
    [onChange]
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content: parsedContent,
    editorProps: {
      attributes: {
        class: 'max-w-full focus:outline-none',
      },
    },
    onUpdate: handleUpdate,
  })

  if (!editor) return null

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-auto border bg-card pb-[60px] sm:pb-0',
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />
      <EditorContent
        editor={editor}
        className="h-full w-full min-w-full cursor-text sm:p-6"
      />
    </div>
  )
}

// Tambahkan editor error fallback di bagian atas file, sebelum extensions
const EditorErrorFallback = () => (
  <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-[#171717] text-gray-300">
    <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
    <h3 className="text-lg font-medium mb-2">Terjadi kesalahan pada editor</h3>
    <p className="text-sm text-gray-400 text-center mb-4 max-w-md">
      Editor tidak dapat dimuat dengan benar. Ini mungkin disebabkan karena
      masalah koneksi atau error internal.
    </p>
    <Button
      variant="outline"
      onClick={() => window.location.reload()}
      size="sm"
    >
      Muat Ulang Editor
    </Button>
  </div>
)

// Perbarui komponennya dengan ErrorBoundary dan TooltipProvider
export function RichTextEditor(props: RichTextEditorProps) {
  // Ubah default autosave menjadi false untuk menonaktifkan sementara
  const { autosave = false, pageId } = props

  // Render komponen dengan autosave jika syarat terpenuhi
  return (
    <ErrorBoundary fallback={<EditorErrorFallback />}>
      <TooltipProvider>
        {autosave && pageId ? (
          <RichTextEditorWithAutosave {...props} pageId={pageId} />
        ) : (
          <RichTextEditorStandard {...props} />
        )}
      </TooltipProvider>
    </ErrorBoundary>
  )
}

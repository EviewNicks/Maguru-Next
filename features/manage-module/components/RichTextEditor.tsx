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
import {
  useRichTextAutosave,
  SaveStatus,
} from '@/features/manage-module/hooks/useRichTextAutosave'
import { useCallback } from 'react'
import { SaveIcon, AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
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

// Komponen khusus untuk autosave
function RichTextEditorWithAutosave({
  pageId,
  className,
  initialContent,
  onChange,
}: Omit<RichTextEditorProps, 'autosave'> & { pageId: string }) {
  // Gunakan hook autosave secara langsung di komponen
  const {
    content: autoSavedContent,
    saveStatus,
    handleContentChange,
    saveContent,
    rollbackContent,
  } = useRichTextAutosave(pageId, initialContent || defaultContent)

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
    content: autoSavedContent || initialContent || defaultContent,
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

      {/* Save Status Indicator (Enhanced) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 p-2 rounded-md bg-[#242528] text-xs">
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
                    onClick={saveContent}
                    aria-label="Coba lagi"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Coba menyimpan lagi</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1 rounded hover:bg-zinc-700 transition-colors"
                    onClick={rollbackContent}
                    aria-label="Kembalikan ke versi sebelumnya"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Kembalikan ke versi sebelumnya</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
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
    content: initialContent || defaultContent,
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

// Perbarui komponennya dengan ErrorBoundary
export function RichTextEditor(props: RichTextEditorProps) {
  const { autosave = true, pageId } = props

  // Render komponen dengan autosave jika syarat terpenuhi
  return (
    <ErrorBoundary fallback={<EditorErrorFallback />}>
      {autosave && pageId ? (
        <RichTextEditorWithAutosave {...props} pageId={pageId} />
      ) : (
        <RichTextEditorStandard {...props} />
      )}
    </ErrorBoundary>
  )
}

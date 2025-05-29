'use client'
import '@/styles/tiptap.css'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { StandardEditorContent } from '../types'

//components implementasion
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
import { EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TipTapFloatingMenu } from '@/features/manage-module/components/ModulePageEditor/extension/FloatingMenu'
import { FloatingToolbar } from '@/features/manage-module/components/ModulePageEditor/extension/FloatingToolbar'
import { EditorToolbar } from '@/features/manage-module/components/ModulePageEditor/toolbars/EditorToolbar'
import Placeholder from '@tiptap/extension-placeholder'
import { defaultContentJSON } from '@/features/manage-module/lib/content'
import { useRichTextAutosave } from '@/features/manage-module/hooks/useRichTextAutosave'
import { useCallback, useEffect, useState } from 'react'
import { SaveIcon, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ErrorBoundary } from './ErrorBoundary'
import { Button } from '@/components/ui/button'

// Import RichTextEditorWithAutosave dari file terpisah
import { RichTextEditorWithAutosave } from './RichTextEditorWithAutosave'

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

export interface RichTextEditorProps {
  className?: string
  initialContent?: string
  onChange?: (content: object) => void
  pageId?: string
  autosave?: boolean
  onEditorReady?: (editor: Editor | null) => void
}

// Komponen utama RichTextEditor
export function RichTextEditor({
  className,
  initialContent,
  onChange,
  pageId: propPageId,
  autosave = false,
  onEditorReady,
}: RichTextEditorProps) {
  // Gunakan context untuk mengakses data dan handler
  const { activePage, handleEditorChange, getParsedEditorContent } =
    useModulePageCRUDContext()

  // Dapatkan pageId dari activePage atau dari props
  const pageId = propPageId || activePage?.id

  // State untuk menyimpan instance editor
  const [editor, setEditor] = useState<Editor | null>(null)

  // Dapatkan konten yang sudah diparse dari context atau props
  const parsedContent = initialContent
    ? typeof initialContent === 'string'
      ? JSON.parse(initialContent)
      : initialContent
    : activePage
      ? getParsedEditorContent(activePage)
      : defaultContentJSON

  // Gunakan JSON.parse untuk mendapatkan konten yang sudah diparse oleh komponen parent
  const getParsedContent = useCallback(() => {
    try {
      if (typeof parsedContent === 'string') {
        return JSON.parse(parsedContent)
      }
      return parsedContent
    } catch (error) {
      console.error('RichTextEditor: error in getParsedContent:', error)
      return defaultContentJSON
    }
  }, [parsedContent])

  // Handle onChange events dari editor - wrapped in useCallback
  const handleChange = useCallback(
    (editorContent: object) => {
      // Pastikan konten sesuai format StandardEditorContent dengan type assertion
      const typedContent = {
        type: 'doc',
        content: (editorContent as Record<string, unknown>)?.content || [],
      } as StandardEditorContent

      // Panggil onChange prop jika disediakan
      if (onChange) {
        onChange(editorContent)
      }

      // Gunakan handleEditorChange dari context untuk autosave HANYA jika autosave=true
      if (pageId && autosave) {
        handleEditorChange(typedContent, pageId)
      }
    },
    [onChange, handleEditorChange, pageId, autosave]
  )

  // Initialize editor when component mounts
  useEffect(() => {
    // Cleanup untuk mencegah memory leak
    return () => {
      if (editor) {
        console.log('RichTextEditor: destroying editor')
        editor.destroy()
      }
    }
  }, [editor])

  // Perbarui editor content saat initialContent berubah
  useEffect(() => {
    if (editor && parsedContent) {
      try {
        const content = getParsedContent()
        if (content) {
          editor.commands.setContent(content)
        }
      } catch (error) {
        console.error(
          'RichTextEditor: error memperbarui content editor:',
          error
        )
      }
    }
  }, [editor, parsedContent, getParsedContent])

  // Buat editor instance
  const createEditor = useCallback(() => {
    if (editor) return
    console.log('RichTextEditor: creating editor instance')

    try {
      const parsedContent = getParsedContent()
      console.log('RichTextEditor: parsedContent for editor:', parsedContent)

      // Gunakan type assertion untuk mengatasi masalah tipe dengan extensions
      const newEditor = new Editor({
        // @ts-expect-error - Masalah tipe antara library yang berbeda versi
        extensions,
        content: parsedContent,
        autofocus: false,
        editable: true,
        onUpdate: ({ editor }) => {
          handleChange(editor.getJSON())
        },
      })

      // Set editor instance ke state
      setEditor(newEditor)

      // Panggil callback onEditorReady jika disediakan
      if (onEditorReady) {
        onEditorReady(newEditor)
      }
    } catch (error) {
      console.error('RichTextEditor: error creating editor:', error)
    }
  }, [editor, getParsedContent, handleChange, onEditorReady])

  // Create editor on mount
  useEffect(() => {
    createEditor()
  }, [createEditor])

  // Integrasi dengan autosave hook
  const { isSaving, lastSaved, triggerSave } = useRichTextAutosave({
    editor,
    enabled: autosave && !!pageId,
    pageId: pageId || '',
  })

  // Jika pageId disediakan dan autosave diaktifkan, gunakan RichTextEditorWithAutosave sebagai pengganti
  if (pageId && autosave) {
    return (
      <RichTextEditorWithAutosave
        className={className}
        initialContent={
          typeof parsedContent === 'string'
            ? parsedContent
            : JSON.stringify(parsedContent)
        }
        onChange={onChange}
        pageId={pageId}
      />
    )
  }

  // Render editor normal jika tidak menggunakan autosave + pageId
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Terjadi kesalahan pada editor
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Editor tidak dapat dimuat dengan benar.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Muat Ulang
          </Button>
        </div>
      }
    >
      <div className={cn('flex flex-col h-full', className)}>
        {editor && <EditorToolbar editor={editor} />}

        <div className="flex-1 overflow-auto prose prose-slate max-w-full">
          {editor ? (
            <EditorContent
              editor={editor}
              className="min-h-[50vh] p-4 focus:outline-none"
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          )}
        </div>

        {/* Toolbar bawah dengan status autosave */}
        {autosave && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 flex justify-between items-center text-sm">
            <div className="flex items-center">
              {isSaving ? (
                <span className="flex items-center text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Menyimpan...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center text-green-600">
                  <SaveIcon className="h-3 w-3 mr-2" />
                  Disimpan {lastSaved}
                </span>
              ) : null}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={triggerSave}
                    disabled={isSaving}
                  >
                    <SaveIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Simpan konten</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {editor && (
          <>
            <TipTapFloatingMenu editor={editor} />
            <FloatingToolbar editor={editor} />
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}

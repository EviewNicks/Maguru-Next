'use client'
import '@/styles/tiptap.css'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { useModuleDraftPageContext } from '../context/ModuleDraftPageContext'
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

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
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

export interface RichTextEditorProps {
  className?: string
  initialContent?: string | object
  onChange?: (content: object) => void
  pageId?: string
  onEditorReady?: (editor: Editor | null) => void
}

// Komponen utama RichTextEditor
export function RichTextEditor({
  className,
  initialContent,
  onChange,
  pageId: propPageId,
  onEditorReady,
}: RichTextEditorProps) {
  // Gunakan context untuk mengakses data dan handler
  const { activePage, handleEditorChange } = useModulePageCRUDContext()

  // Gunakan ModuleDraftPageContext untuk mengakses mode editor
  const {
    editorMode,
    setEditor: setContextEditor,
    getDraftOrPublishedContent,
  } = useModuleDraftPageContext()

  // Derive readOnly dari editorMode
  const readOnly = editorMode === 'view'

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
      ? getDraftOrPublishedContent(activePage)
      : defaultContentJSON

  // Gunakan JSON.parse untuk mendapatkan konten yang sudah diparse oleh komponen parent
  const getParsedContent = useCallback(() => {
    try {
      if (typeof parsedContent === 'string') {
        return JSON.parse(parsedContent)
      }
      return parsedContent
    } catch {
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

      // Gunakan handleEditorChange dari context untuk autosave HANYA jika dalam mode edit
      if (pageId && editorMode === 'edit') {
        handleEditorChange(typedContent, pageId)
      }
    },
    [onChange, handleEditorChange, pageId, editorMode]
  )

  // Initialize editor when component mounts
  useEffect(() => {
    // Cleanup untuk mencegah memory leak
    return () => {
      if (editor) {
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
      } catch {
        // ignore
      }
    }
  }, [editor, parsedContent, getParsedContent])

  // Buat editor instance
  const createEditor = useCallback(() => {
    if (editor) return

    try {
      const parsedContent = getParsedContent()

      // Gunakan type assertion untuk mengatasi masalah tipe dengan extensions
      const newEditor = new Editor({
        // @ts-expect-error - Masalah tipe antara library yang berbeda versi
        extensions,
        content: parsedContent,
        autofocus: false,
        editable: !readOnly, // Set editable berdasarkan mode
        onUpdate: ({ editor }) => {
          try {
            if (editor) {
              handleChange(editor.getJSON())
            }
          } catch {
            // ignore
          }
        },
      })

      // Set editor instance ke state
      setEditor(newEditor)

      // Set editor ke context untuk digunakan oleh komponen lain
      setContextEditor(newEditor)

      // Panggil callback onEditorReady jika disediakan
      if (onEditorReady) {
        onEditorReady(newEditor)
      }
      } catch {
      // ignore
    }
  }, [
    editor,
    getParsedContent,
    handleChange,
    onEditorReady,
    readOnly,
    setContextEditor,
  ])

  // Create editor on mount
  useEffect(() => {
    createEditor()
  }, [createEditor])

  // Perbarui editor editable state saat editorMode berubah dengan penanganan error yang lebih baik
  useEffect(() => {
    // Gunakan setTimeout untuk memastikan DOM sudah siap
    const updateEditorMode = setTimeout(() => {
      try {
        if (editor) {
          // Set editable state dengan aman
          try {
            editor.setEditable(!readOnly)
          } catch {
            // ignore
          }

          // Force refresh editor content saat mode berubah
          try {
            const content = getParsedContent()

            // Set ulang konten dengan aman
            if (editor && editor.commands && editor.commands.setContent) {
              try {
                editor.commands.setContent(content)
              } catch {
                // ignore
              }
            }

            // Manipulasi DOM dengan lebih aman
            setTimeout(() => {
              try {
                // Gunakan querySelector hanya jika elemen ada di DOM
                const editorElement = document.querySelector('.ProseMirror')
                if (editorElement) {
                  if (readOnly) {
                    editorElement.classList.add('view-mode')
                    editorElement.classList.remove('edit-mode')
                  } else {
                    editorElement.classList.add('edit-mode')
                    editorElement.classList.remove('view-mode')
                  }
                }

                // Fokus editor hanya jika dalam mode edit dan editor masih ada
                if (
                  editorMode === 'edit' &&
                  editor &&
                  editor.commands &&
                  editor.commands.focus
                ) {
                  try {
                    editor.commands.focus()
                  } catch {
                    // ignore
                  }
                }
              } catch {
                // ignore
              }
            }, 200) // Increase timeout to ensure DOM is ready
            } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    }, 50) // Small delay to ensure component is mounted

    return () => {
      clearTimeout(updateEditorMode)
    }
  }, [editor, readOnly, editorMode, getParsedContent])

  // Render editor
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
      <div
        className={cn(
          'flex flex-col h-full',
          className,
          readOnly ? 'rich-text-view-mode' : 'rich-text-edit-mode'
        )}
      >
        {/* Tampilkan toolbar hanya jika dalam mode edit */}
        {editor && !readOnly && <EditorToolbar editor={editor} />}

        <div
          className={cn(
            'flex-1 overflow-auto prose prose-slate max-w-full',
            readOnly ? 'view-content' : 'edit-content'
          )}
        >
          {editor ? (
            <EditorContent
              editor={editor}
              className={cn(
                'min-h-[50vh] p-4 focus:outline-none',
                readOnly ? 'cursor-default' : ''
              )}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          )}
        </div>

        {/* Tampilkan floating menu dan toolbar hanya jika dalam mode edit */}
        {editor && !readOnly && (
          <>
            <TipTapFloatingMenu editor={editor} />
            <FloatingToolbar editor={editor} />
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}

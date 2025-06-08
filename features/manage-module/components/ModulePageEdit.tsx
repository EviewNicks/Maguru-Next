'use client'

import React, { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EditHeader } from './ModulePageEditor/document/EditHeader'
import { RichTextEditor } from './RichTextEditor'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { StandardEditorContent } from '../types'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { Editor } from '@tiptap/react'
import { showErrorNotification } from '../components/ErrorNotifier'
import { toast } from 'sonner'

interface ModulePageEditProps {
  moduleId: string
  pageId: string
}

/**
 * ModulePageEdit - Komponen untuk mengedit halaman modul dalam mode edit
 *
 * Komponen ini digunakan untuk mengedit konten halaman modul dalam mode edit.
 * Ini adalah implementasi dari pendekatan Confluence untuk memisahkan mode view dan edit
 * menjadi komponen terpisah dengan URL berbeda.
 */
export function ModulePageEdit({ moduleId, pageId }: ModulePageEditProps) {
  const router = useRouter()
  const { savePage } = useModulePageCRUDContext()

  // Ref untuk editor instance
  const editorRef = useRef<Editor | null>(null)

  // Handler untuk beralih ke mode view
  const handleSwitchToView = async () => {
    // Simpan perubahan sebelum beralih mode
    if (editorRef.current) {
      try {
        // Ambil konten editor saat ini
        const content = editorRef.current.getJSON() as StandardEditorContent

        // Simpan ke server
        await savePage({
          pageId,
          content,
        })

        // Navigasi ke mode view
        router.push(`/manage-module/${moduleId}?pageId=${pageId}&mode=view`)

        toast.success('Perubahan disimpan')
      } catch (error) {
        showErrorNotification(error)
      }
    } else {
      // Jika tidak ada editor, langsung navigasi
      router.push(`/manage-module/${moduleId}?pageId=${pageId}&mode=view`)
    }
  }

  // Simpan referensi ke editor saat diinisialisasi
  const handleEditorReady = (editor: Editor | null) => {
    editorRef.current = editor
  }

  // Pastikan editor dalam mode edit
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setEditable(true)
    }
  }, [editorRef.current])

  return (
    <div className="flex flex-col h-full">
      {/* Header khusus untuk mode edit */}
      <EditHeader
        pageId={pageId}
        moduleId={moduleId}
        onSwitchToView={handleSwitchToView}
      />

      {/* Editor konten */}
      <div className="flex-1 overflow-auto">
        <RichTextEditor pageId={pageId} onEditorReady={handleEditorReady} />
      </div>

      {/* Floating save button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleSwitchToView}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-green-600 hover:bg-green-700"
        >
          <Check className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

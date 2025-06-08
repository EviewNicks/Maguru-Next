'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ViewHeader } from './ModulePageEditor/document/ViewHeader'
import { RichTextViewer } from './RichTextViewer'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { StandardEditorContent } from '../types'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface ModulePageViewProps {
  moduleId: string
  pageId: string
}

/**
 * ModulePageView - Komponen untuk menampilkan halaman modul dalam mode view
 *
 * Komponen ini digunakan untuk menampilkan konten halaman modul dalam mode view.
 * Ini adalah implementasi dari pendekatan Confluence untuk memisahkan mode view dan edit
 * menjadi komponen terpisah dengan URL berbeda.
 *
 * Komponen ini sama sekali tidak menggunakan RichTextEditor yang berat,
 * melainkan menggunakan RichTextViewer yang ringan untuk rendering statis.
 */
export function ModulePageView({ moduleId, pageId }: ModulePageViewProps) {
  const router = useRouter()

  // Handler untuk beralih ke mode edit
  const handleSwitchToEdit = () => {
    router.push(`/manage-module/${moduleId}?pageId=${pageId}&mode=edit`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header khusus untuk mode view */}
      <ViewHeader
        pageId={pageId}
        moduleId={moduleId}
        onSwitchToEdit={handleSwitchToEdit}
      />

      {/* Konten halaman menggunakan RichTextViewer */}
      <ViewContent />

      {/* Floating edit button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleSwitchToEdit}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <Edit className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

/**
 * ViewContent - Komponen untuk menampilkan konten dalam mode view
 * Menggunakan context untuk mendapatkan data halaman
 */
function ViewContent() {
  const { activePage, getParsedEditorContent } = useModulePageCRUDContext()

  // Dapatkan konten yang sudah diparse dari context
  const content = activePage
    ? getParsedEditorContent(activePage)
    : ({ type: 'doc', content: [] } as StandardEditorContent)

  // Apakah konten sedang loading
  const isLoading = !activePage

  return (
    <div className="flex-1 overflow-auto">
      <RichTextViewer content={content} isLoading={isLoading} />
    </div>
  )
}

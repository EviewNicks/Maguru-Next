'use client'

import { useState, useEffect } from 'react'
// import TopNavigation from './ModulePageEditor/navigation/TopNavigation'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import ModulePageFooterNav from './ModulePageFooterNav'
import { useModulePageQuery } from '../hooks/useModulePageQuery'
import { useModulePageEditor } from '../hooks/useModulePageEditor'
import { RichTextEditor } from './RichTextEditor'
import { useDebounce } from '../hooks/useDebounce'
import { useModulePagesContext } from '../context/ModulePagesContext'

interface ModulePageEditorProps {
  moduleId: string
  initialPageId?: string
}

export default function ModulePageEditor({
  moduleId,
  initialPageId,
}: ModulePageEditorProps) {
  // Get context
  const {
    setPages,
    setActivePage,
    pages: contextPages,
    activePage: contextActivePage,
    expandedItems,
    toggleExpand,
  } = useModulePagesContext()

  // State untuk halaman aktif
  const [activePageId, setActivePageId] = useState<string | undefined>(
    initialPageId
  )

  // Fetch data module pages
  const { getAllPages, getPageById, getAdjacentPages } =
    useModulePageQuery(moduleId)
  const { data: pagesData, isLoading: pagesLoading } = getAllPages

  // Ekstrak data halaman dari response API
  const pages = pagesData?.data || []

  // Jika initialPageId tidak ditemukan, gunakan halaman pertama sebagai default
  const firstPage = pages && pages.length > 0 ? pages[0] : null
  const activePageIdToUse = activePageId || firstPage?.id

  // Fetch data halaman aktif
  const { data: activePageData } = activePageIdToUse
    ? getPageById(activePageIdToUse)
    : { data: null }

  const activePage = activePageData?.data

  // Editor state untuk halaman aktif
  const { title, saveStatus, handleContentChange, handleTitleChange } =
    useModulePageEditor(moduleId, activePage)

  // Handle navigasi ke halaman sebelum/berikutnya
  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!pages || !activePageIdToUse) return

    // Menggunakan adjacent pages dari query hook
    const adjacentPages = getAdjacentPages(activePageIdToUse)

    if (direction === 'prev' && adjacentPages.previousPage) {
      setActivePageId(adjacentPages.previousPage.id)
    } else if (direction === 'next' && adjacentPages.nextPage) {
      setActivePageId(adjacentPages.nextPage.id)
    }
  }

  // Function untuk memilih halaman dari sidebar
  const handleSelectPage = (page: any) => {
    setActivePageId(page.id)
  }

  // Update context whenever data changes
  useEffect(() => {
    if (pages.length > 0) {
      setPages(pages)
    }
    if (activePage) {
      setActivePage(activePage)
    }
  }, [pages, activePage, setPages, setActivePage])

  // Debounce title untuk mengurangi request update
  useDebounce(title, 500)

  // Status loading
  if (pagesLoading) {
    return <div className="p-4">Memuat halaman...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-[#e3e4f2]">
      <DocumentHeader
        title={title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1">
          <div className="h-full w-full">
            <RichTextEditor
              className="bg-[#1e1e1e] border-[#3b3b3b] h-full"
              onChange={handleContentChange}
              initialContent={
                activePage?.blocks ? JSON.stringify(activePage.blocks) : ''
              }
            />
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      {pages && activePageIdToUse && (
        <ModulePageFooterNav
          currentPage={
            pages.findIndex((page) => page.id === activePageIdToUse) + 1
          }
          totalPages={pages.length}
          onPrevious={() => handleNavigation('prev')}
          onNext={() => handleNavigation('next')}
        />
      )}
    </div>
  )
}

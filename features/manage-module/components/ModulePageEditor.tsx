'use client'

import { useState } from 'react'
// import TopNavigation from './ModulePageEditor/navigation/TopNavigation'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import Sidebar from './ModulePageEditor/sidebar/Sidebar'
import ModulePageFooterNav from './ModulePageFooterNav'
import { useModulePageQuery } from '../hooks/useModulePageQuery'
import { useModulePageEditor } from '../hooks/useModulePageEditor'
import { ModulePage } from '../types'
import { RichTextEditor } from './RichTextEditor'
import { useDebounce } from '../hooks/useDebounce'

interface ModulePageEditorProps {
  moduleId: string
  initialPageId?: string
}

export default function ModulePageEditor({
  moduleId,
  initialPageId,
}: ModulePageEditorProps) {
  // State untuk expanded items di sidebar
  const [expandedItems, setExpandedItems] = useState({
    SPRINT: true,
    ModulePages: true,
  })

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

  // Function untuk toggle expand item di sidebar
  const toggleExpand = (item: keyof typeof expandedItems) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

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
  const handleSelectPage = (page: ModulePage) => {
    setActivePageId(page.id)
  }

  // Debounce title untuk mengurangi request update
  useDebounce(title, 500)

  // Status loading
  if (pagesLoading) {
    return <div className="p-4">Memuat halaman...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-[#e3e4f2]">
      {/* <TopNavigation /> */}
      <DocumentHeader
        title={title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Area - Menghapus overflow-auto di sini untuk menghindari double scrollbar */}
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
        {/* <Sidebar
          expandedItems={expandedItems}
          toggleExpand={toggleExpand}
          pages={pages}
          activePage={activePage}
          onSelectPage={handleSelectPage}
        /> */}
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

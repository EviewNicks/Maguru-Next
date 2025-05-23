'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
// import TopNavigation from './ModulePageEditor/navigation/TopNavigation'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import ModulePageFooterNav from './ModulePageFooterNav'
import { useModulePageQuery } from '../hooks/useModulePageQuery'
import { useModulePageEditor } from '../hooks/useModulePageEditor'
import { RichTextEditor } from './RichTextEditor'
import { useDebounce } from '../hooks/useDebounce'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { ModulePage, ContentBlock, ContentBlockType } from '../types'
import { useQuery } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import { NAVIGATION_SHORTCUTS, SYSTEM_SHORTCUTS } from '../constants/shortcuts'
import ShortcutHelp from './ShortcutHelp'
// import { FocusTrap } from './a11y/FocusTrap' - Tidak digunakan
import SkipLink from './a11y/SkipLink'
import A11yAnnouncer from './a11y/A11yAnnouncer'
import { getStatusAnnouncement } from '../utils/a11yUtils'
import useFocusManagement from '../hooks/useFocusManagement'
import { ErrorBoundary } from './ErrorBoundary'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModulePageEditorProps {
  moduleId: string
  initialPageId?: string
  onPageChange?: (pageId: string) => void
}

export default function ModulePageEditor({
  moduleId,
  initialPageId,
  onPageChange,
}: ModulePageEditorProps) {
  // State for shortcut help dialog
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false)

  // Ref for editor container to manage focus
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Focus management hook
  const editorFocusRef = useFocusManagement({
    shouldFocus: true,
    focusDelay: 100,
  })

  // State untuk status announcement untuk screen readers
  const [statusAnnouncement, setStatusAnnouncement] = useState('')

  // Get CRUD context
  const {
    pages,
    activePage: crudActivePage,
    setActivePage: setCrudActivePage,
    savePage,
    isLoading: crudLoading,
    getNextPage,
    getPreviousPage,
    getFirstPage,
    getLastPage,
  } = useModulePageCRUDContext()

  // State untuk halaman aktif
  const [activePageId, setActivePageId] = useState<string | undefined>(
    initialPageId
  )

  // Fetch data module pages
  const { getAllPages } = useModulePageQuery(moduleId)
  const { isLoading: pagesLoading } = getAllPages

  // Jika initialPageId tidak ditemukan, gunakan halaman pertama sebagai default
  const firstPage = pages && pages.length > 0 ? pages[0] : null
  const activePageIdToUse =
    activePageId || (firstPage?.id as string | undefined)

  // Fetch data halaman aktif
  const { data: activePageData } = useQuery({
    queryKey: ['modulePage', moduleId, activePageIdToUse],
    queryFn: async () => {
      if (!activePageIdToUse) return { data: null, success: true }
      return modulePageService.getModulePage(activePageIdToUse)
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!activePageIdToUse,
  })

  // Gunakan activePage dari CRUD context jika tersedia
  const activePage = crudActivePage || activePageData?.data || null

  // Editor state untuk halaman aktif
  const { title, saveStatus, handleTitleChange } = useModulePageEditor(
    moduleId,
    activePage
  )

  // Use savePage from CRUD context for enhanced saving with optimistic updates
  const handleSave = useCallback(async () => {
    if (!activePage?.id) return

    try {
      setStatusAnnouncement('Menyimpan halaman...')
      await savePage({
        pageId: activePage.id,
        title: title,
        blocks: activePage.blocks,
      })
      setStatusAnnouncement('Halaman berhasil disimpan')
    } catch (error) {
      console.error('Error saving page:', error)
      setStatusAnnouncement('Gagal menyimpan halaman. Silakan coba lagi.')
    }
  }, [activePage, title, savePage])

  // Tambahkan state loading
  const [isNavigating, setIsNavigating] = useState(false)

  // Update handleNavigation untuk menggunakan helper functions dari context
  const handleNavigation = useCallback(
    (direction: 'prev' | 'next' | 'first' | 'last') => {
      if (!pages || !activePageIdToUse || isNavigating) return

      setIsNavigating(true)

      let nextPage: ModulePage | null = null

      if (direction === 'first') {
        nextPage = getFirstPage()
      } else if (direction === 'last') {
        nextPage = getLastPage()
      } else if (direction === 'prev') {
        nextPage = getPreviousPage(activePageIdToUse)
      } else if (direction === 'next') {
        nextPage = getNextPage(activePageIdToUse)
      }

      if (nextPage?.id) {
        setActivePageId(nextPage.id)
        if (onPageChange) onPageChange(nextPage.id)

        // Update activePage in CRUD context
        setCrudActivePage(nextPage)

        // Reset loading state after a short delay
        setTimeout(() => {
          setIsNavigating(false)
        }, 500)
      } else {
        setIsNavigating(false)
      }
    },
    [
      activePageIdToUse,
      onPageChange,
      pages,
      isNavigating,
      getFirstPage,
      getLastPage,
      getPreviousPage,
      getNextPage,
      setCrudActivePage,
    ]
  )

  // Update context whenever activePage changes
  useEffect(() => {
    if (activePage) {
      setCrudActivePage(activePage as ModulePage)
    }
  }, [activePage, setCrudActivePage])

  // Update announcement saat saveStatus berubah
  useEffect(() => {
    if (saveStatus) {
      setStatusAnnouncement(getStatusAnnouncement(saveStatus))
    }
  }, [saveStatus])

  // Debounce title untuk mengurangi request update
  useDebounce(title, 500)

  // Toggle sidebar - We don't actually have this in context, so we'll create a dummy function
  const toggleSidebar = useCallback(() => {
    // Get sidebar state from DOM or localStorage
    const sidebarElement = document.querySelector('[data-sidebar]')
    if (sidebarElement) {
      // Trigger a click on the sidebar toggle button
      const toggleButton = sidebarElement.querySelector('button')
      if (toggleButton) {
        toggleButton.click()
      }
    }
  }, [])

  // Setup keyboard shortcuts
  const shortcutHandlers = {
    'navigate-prev': () => handleNavigation('prev'),
    'navigate-next': () => handleNavigation('next'),
    'navigate-first': () => handleNavigation('first'),
    'navigate-last': () => handleNavigation('last'),
    'toggle-sidebar': toggleSidebar,
    'show-shortcut-help': () => setIsShortcutHelpOpen(true),
    'save-page': () => handleSave(),
  }

  // Register keyboard shortcuts
  useKeyboardShortcuts(
    [...NAVIGATION_SHORTCUTS, ...SYSTEM_SHORTCUTS],
    shortcutHandlers,
    { scope: 'global' }
  )

  // Get initial content - tidak perlu memformat karena RichTextEditor sudah dapat menangani langsung dari API
  const initialContent = activePage?.blocks
    ? JSON.stringify(activePage.blocks)
    : ''

  // Log untuk debugging nilai initialContent
  console.log(
    '[ModulePageEditor] Sending initialContent to RichTextEditor:',
    initialContent
      ? initialContent.length > 100
        ? initialContent.substring(0, 100) + '...'
        : initialContent
      : 'empty'
  )
  console.log('[ModulePageEditor] activePage blocks:', activePage?.blocks)

  // Callback untuk penanganan perubahan konten dari RichTextEditor
  const handleEditorChange = useCallback(
    (content: object) => {
      // Log untuk debugging
      console.log('[ModulePageEditor] Editor content changed')

      // Konversi JSON ke string
      const contentString = JSON.stringify(content)

      // Simpan perubahan hanya jika ada activePage dan konten berubah
      if (activePage?.id && contentString !== initialContent) {
        // Jika hanya mengisi satu block type TEXT
        const updatedBlocks: ContentBlock[] = [
          {
            type: ContentBlockType.TEXT,
            content: contentString,
          },
        ]

        // Simpan perubahan melalui context
        savePage({
          pageId: activePage.id,
          title: title,
          blocks: updatedBlocks,
        }).catch((error) => {
          console.error('[ModulePageEditor] Error saving page:', error)
        })
      }
    },
    [activePage, initialContent, savePage, title]
  )

  // Status loading
  if (pagesLoading || crudLoading) {
    return <div className="p-4">Memuat halaman...</div>
  }

  // Hitung currentPage dan totalPages untuk navigasi
  const currentPage =
    (pages?.findIndex((page) => page.id === activePageIdToUse) || 0) + 1
  const totalPages = pages?.length || 0

  return (
    <>
      {/* Skip Link untuk aksesibilitas keyboard */}
      <SkipLink targetId="editor-content" label="Lewati ke konten editor" />

      {/* Main container */}
      <div
        ref={editorContainerRef}
        className="h-full flex flex-col bg-[#121212] text-white"
      >
        {/* Header */}
        <DocumentHeader
          title={title}
          onTitleChange={handleTitleChange}
          saveStatus={saveStatus}
          pageId={activePageIdToUse}
        />

        {/* Editor Area */}
        <div
          id="editor-content"
          className="flex flex-1 overflow-hidden"
          ref={editorFocusRef as React.RefObject<HTMLDivElement>}
          tabIndex={-1}
        >
          {/* Main editor */}
          <div className="flex-1 h-full">
            <ErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Terjadi kesalahan saat memuat editor
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Editor tidak dapat dimuat dengan benar. Ini mungkin
                    disebabkan karena masalah koneksi atau format data yang
                    tidak valid.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    size="sm"
                  >
                    Muat Ulang Editor
                  </Button>
                </div>
              }
            >
              <RichTextEditor
                className="h-full"
                onChange={handleEditorChange}
                initialContent={initialContent}
                pageId={activePageIdToUse} // Tambahkan pageId untuk pengambilan data dari API
                autosave={true}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Footer Navigation */}
        <ModulePageFooterNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => handleNavigation('prev')}
          onNext={() => handleNavigation('next')}
          isLoading={isNavigating}
        />

        {/* Shortcut Help */}
        <ShortcutHelp
          isOpen={isShortcutHelpOpen}
          onClose={() => setIsShortcutHelpOpen(false)}
        />

        {/* A11y Live Region Announcer */}
        <A11yAnnouncer message={statusAnnouncement} />
      </div>
    </>
  )
}

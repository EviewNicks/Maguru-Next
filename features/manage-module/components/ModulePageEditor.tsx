'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
// import TopNavigation from './ModulePageEditor/navigation/TopNavigation'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import ModulePageFooterNav from './ModulePageFooterNav'
import { useModulePageQuery } from '../hooks/useModulePageQuery'
import { useModulePageEditor } from '../hooks/useModulePageEditor'
import { RichTextEditor } from './RichTextEditor'
import { useDebounce } from '../hooks/useDebounce'
import { useModulePagesContext } from '../context/ModulePagesContext'
import { ModulePage } from '../types/modulePageSchema'
import { useQuery } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import { NAVIGATION_SHORTCUTS, SYSTEM_SHORTCUTS } from '../constants/shortcuts'
import ShortcutHelp from './ShortcutHelp'
import { FocusTrap } from './a11y/FocusTrap'
import { SkipLink } from './a11y/SkipLink'
import { A11yAnnouncer } from './a11y/A11yAnnouncer'
import { getStatusAnnouncement } from '../utils/a11yUtils'
import useFocusManagement from '../hooks/useFocusManagement'

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

  // Get context
  const {
    setPages,
    setActivePage,
    // Variabel yang tidak digunakan
    // pages: contextPages,
    // activePage: contextActivePage,
    // expandedItems,
    // toggleExpand,
  } = useModulePagesContext()

  // State untuk halaman aktif
  const [activePageId, setActivePageId] = useState<string | undefined>(
    initialPageId
  )

  // Fetch data module pages
  const { getAllPages, getAdjacentPages } = useModulePageQuery(moduleId)
  const { data: pagesData, isLoading: pagesLoading } = getAllPages

  // Ekstrak data halaman dari response API
  const pages = pagesData?.data || []

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

  const activePage = activePageData?.data || null

  // Editor state untuk halaman aktif
  const {
    title,
    saveStatus,
    handleContentChange,
    handleTitleChange,
    saveChanges, // Manual save function
  } = useModulePageEditor(moduleId, activePage)

  // Tambahkan state loading
  const [isNavigating, setIsNavigating] = useState(false)

  // Update handleNavigation untuk menampilkan loading state
  const handleNavigation = useCallback(
    (direction: 'prev' | 'next' | 'first' | 'last') => {
      if (!pages || !activePageIdToUse || isNavigating) return

      setIsNavigating(true)

      let nextPageId: string | undefined

      if (direction === 'first' && pages.length > 0) {
        nextPageId = pages[0].id
      } else if (direction === 'last' && pages.length > 0) {
        nextPageId = pages[pages.length - 1].id
      } else {
        const adjacentPages = getAdjacentPages(activePageIdToUse)

        if (direction === 'prev' && adjacentPages.previousPage) {
          nextPageId = adjacentPages.previousPage.id
        } else if (direction === 'next' && adjacentPages.nextPage) {
          nextPageId = adjacentPages.nextPage.id
        }
      }

      if (nextPageId) {
        setActivePageId(nextPageId)
        if (onPageChange) onPageChange(nextPageId)

        // Reset loading state after a short delay
        setTimeout(() => {
          setIsNavigating(false)
        }, 500)
      } else {
        setIsNavigating(false)
      }
    },
    [activePageIdToUse, getAdjacentPages, onPageChange, pages, isNavigating]
  )

  // Update context whenever data changes
  useEffect(() => {
    if (pages.length > 0) {
      setPages(pages as ModulePage[])
    }
    if (activePage) {
      setActivePage(activePage as ModulePage)
    }
  }, [pages, activePage, setPages, setActivePage])

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
    'save-page': () => saveChanges(),
  }

  // Register keyboard shortcuts
  useKeyboardShortcuts(
    [...NAVIGATION_SHORTCUTS, ...SYSTEM_SHORTCUTS],
    shortcutHandlers,
    { scope: 'global' }
  )

  // Status loading
  if (pagesLoading) {
    return <div className="p-4">Memuat halaman...</div>
  }

  return (
    <div
      className="flex flex-col h-screen bg-[#121212] text-[#e3e4f2]"
      role="application"
      aria-label="Editor halaman modul"
    >
      {/* Skip Link - tersembunyi sampai mendapat fokus */}
      <SkipLink targetId="editor-content" label="Lewati ke editor konten" />

      {/* Status Announcer untuk screen reader */}
      <A11yAnnouncer message={statusAnnouncement} />

      <DocumentHeader
        title={title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
      />

      {/* Main Content Area */}
      <div
        className="flex flex-1 overflow-hidden"
        ref={editorFocusRef as React.RefObject<HTMLDivElement>}
        tabIndex={-1}
      >
        {/* Editor Area */}
        <div
          className="flex-1"
          id="editor-content"
          ref={editorContainerRef}
          tabIndex={-1}
          aria-label="Area editor konten"
        >
          <div className="h-full w-full" role="region" aria-label="Editor teks">
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
          isLoading={isNavigating}
        />
      )}

      {/* Shortcut Help Dialog dengan FocusTrap */}
      <FocusTrap active={isShortcutHelpOpen}>
        <ShortcutHelp
          isOpen={isShortcutHelpOpen}
          onClose={() => setIsShortcutHelpOpen(false)}
        />
      </FocusTrap>
    </div>
  )
}

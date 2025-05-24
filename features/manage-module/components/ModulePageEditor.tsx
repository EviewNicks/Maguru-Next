'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
// import TopNavigation from './ModulePageEditor/navigation/TopNavigation'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import ModulePageFooterNav from './ModulePageFooterNav'
import { useModulePageEditor } from '../hooks/useModulePageEditor'
import { RichTextEditor } from './RichTextEditor'
import { useDebounce } from '../hooks/useDebounce'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
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
  isLoading?: boolean
}

export default function ModulePageEditor({
  isLoading: propIsLoading,
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
    moduleId,
    pages,
    activePage,
    isLoading: crudLoading,
    getNextPage,
    getPreviousPage,
    handlePageChange,
    handleEditorChange,
    saveStatus,
    isNavigating,
    savePage,
  } = useModulePageCRUDContext()

  // Gunakan pages dari context
  const firstPage = pages && pages.length > 0 ? pages[0] : null
  const activePageIdToUse = activePage?.id || firstPage?.id

  // Editor state untuk halaman aktif
  const { title, handleTitleChange } = useModulePageEditor(moduleId, activePage)

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

  // Gabungkan status loading dari props dan context
  const isLoading = propIsLoading || crudLoading

  // Update handleNavigation untuk menggunakan helper functions dari context
  const handleNavigation = useCallback(
    (direction: 'prev' | 'next' | 'first' | 'last') => {
      if (!pages || !activePageIdToUse || isNavigating) return

      let nextPage = null

      if (direction === 'first') {
        nextPage = pages[0]
      } else if (direction === 'last') {
        nextPage = pages[pages.length - 1]
      } else if (direction === 'prev') {
        nextPage = getPreviousPage(activePageIdToUse)
      } else if (direction === 'next') {
        nextPage = getNextPage(activePageIdToUse)
      }

      if (nextPage?.id) {
        handlePageChange(nextPage.id)
      }
    },
    [
      activePageIdToUse,
      pages,
      isNavigating,
      getPreviousPage,
      getNextPage,
      handlePageChange,
    ]
  )

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

  // Status loading
  if (isLoading) {
    return <div className="p-4">Memuat halaman...</div>
  }

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
          title={activePage?.title || 'Untitled Page'}
          saveStatus={saveStatus}
          onTitleChange={handleTitleChange}
          isLoading={isLoading}
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
                onChange={(content) =>
                  handleEditorChange(content, activePageIdToUse || '')
                }
                initialContent={initialContent}
                pageId={activePageIdToUse}
                autosave={true}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Footer Navigation */}
        {activePage && <ModulePageFooterNav />}

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

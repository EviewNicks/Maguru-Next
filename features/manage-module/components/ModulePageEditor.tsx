'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import ModulePageFooterNav from './ModulePageFooterNav'
import { RichTextEditor } from './RichTextEditor'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import { NAVIGATION_SHORTCUTS, SYSTEM_SHORTCUTS } from '../types/shortcuts'
import ShortcutHelp from './ShortcutHelp'
import SkipLink from './a11y/SkipLink'
import A11yAnnouncer from './a11y/A11yAnnouncer'
import { getStatusAnnouncement } from '../utils/a11yUtils'
import useFocusManagement from '../hooks/useFocusManagement'
import { ErrorBoundary } from './ErrorBoundary'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { useModuleDraftPageContext } from '../context/ModuleDraftPageContext'
import { cn } from '@/lib/utils'

interface ModulePageEditorProps {
  isLoading?: boolean
}

export default function ModulePageEditor({
  isLoading: propIsLoading,
}: ModulePageEditorProps) {
  // State for shortcut help dialog
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false)

  // Buat koneksi ke context hanya untuk mendapatkan saveStatus untuk A11yAnnouncer
  const { saveStatus } = useModulePageCRUDContext()

  // Gunakan ModuleDraftPageContext untuk mengakses mode editor dan fungsi toggle
  const { editorMode, toggleEditorMode } = useModuleDraftPageContext()

  // Event handler untuk double-click pada container editor
  const handleContainerDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      // Hanya toggle jika dalam mode view dan target adalah container (bukan elemen lain di dalamnya)
      if (editorMode === 'view' && e.currentTarget === e.target) {
        toggleEditorMode()
      }
    },
    [editorMode, toggleEditorMode]
  )

  // Keyboard shortcut handler untuk toggle mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 'e' untuk edit mode ketika dalam view mode
      if (
        event.key === 'e' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        editorMode === 'view'
      ) {
        toggleEditorMode()
      }
      // Escape untuk view mode ketika dalam edit mode
      else if (event.key === 'Escape' && editorMode === 'edit') {
        toggleEditorMode()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editorMode, toggleEditorMode])

  // State untuk status announcement untuk screen readers
  const [statusAnnouncement, setStatusAnnouncement] = useState('')

  // Update announcement saat saveStatus berubah - gunakan useEffect
  useEffect(() => {
    if (saveStatus) {
      setStatusAnnouncement(getStatusAnnouncement(saveStatus))
    }
  }, [saveStatus])

  // Ref for editor container to manage focus
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Focus management hook
  const editorFocusRef = useFocusManagement({
    shouldFocus: true,
    focusDelay: 100,
  })

  // Toggle sidebar - We don't actually have this in context, so we'll create a dummy function
  const toggleSidebar = () => {
    // Get sidebar state from DOM or localStorage
    const sidebarElement = document.querySelector('[data-sidebar]')
    if (sidebarElement) {
      // Trigger a click on the sidebar toggle button
      const toggleButton = sidebarElement.querySelector('button')
      if (toggleButton) {
        toggleButton.click()
      }
    }
  }

  // Setup keyboard shortcuts
  const shortcutHandlers = {
    'navigate-prev': () => null, // Akan ditangani oleh context
    'navigate-next': () => null, // Akan ditangani oleh context
    'navigate-first': () => null, // Akan ditangani oleh context
    'navigate-last': () => null, // Akan ditangani oleh context
    'toggle-sidebar': toggleSidebar,
    'show-shortcut-help': () => setIsShortcutHelpOpen(true),
    'save-page': () => null, // Akan ditangani oleh context
  }

  // Register keyboard shortcuts
  useKeyboardShortcuts(
    [...NAVIGATION_SHORTCUTS, ...SYSTEM_SHORTCUTS],
    shortcutHandlers,
    { scope: 'global' }
  )

  // Status loading
  if (propIsLoading) {
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
        <DocumentHeader isLoading={propIsLoading} />

        {/* Editor Area */}
        <div
          id="editor-content"
          className={cn(
            'flex flex-1 overflow-hidden',
            editorMode === 'view' ? 'view-mode' : 'edit-mode'
          )}
          ref={editorFocusRef as React.RefObject<HTMLDivElement>}
          tabIndex={-1}
          onDoubleClick={handleContainerDoubleClick}
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
              <RichTextEditor className="h-full" />
            </ErrorBoundary>
          </div>
        </div>

        {/* Footer Navigation - sekarang menggunakan context langsung */}
        <ModulePageFooterNav />

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

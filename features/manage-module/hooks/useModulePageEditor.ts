'use client'

import { useState, useEffect, useCallback } from 'react'
import { ModulePage } from '../types'
// import { debounce } from '@/lib/utils'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'

// Tipe untuk status penyimpanan
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

// Debounce function untuk autosave
const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function useModulePageEditor(
  moduleId: string,
  initialPage?: ModulePage | null
) {
  // States untuk editor
  const [currentPage, setCurrentPage] = useState<ModulePage | null>(
    initialPage || null
  )
  const [content, setContent] = useState<string>(
    initialPage?.blocks?.[0]?.content || ''
  )
  const [title, setTitle] = useState<string>(initialPage?.title || '')
  const [isContentDirty, setIsContentDirty] = useState(false)
  const [isTitleDirty, setIsTitleDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')

  // Load page mutation
  const { updatePage } = useModulePageCRUDContext()

  // Update current page when initialPage changes
  useEffect(() => {
    if (initialPage && initialPage.id !== currentPage?.id) {
      console.log(
        '[useModulePageEditor] Page changed:',
        `Current: ${currentPage?.id} (${currentPage?.title}) -> New: ${initialPage.id} (${initialPage.title})`
      )

      // Update current page reference dengan deep clone untuk mencegah referensi yang tidak diinginkan
      const pageClone = JSON.parse(JSON.stringify(initialPage)) as ModulePage
      setCurrentPage(pageClone)

      // Update content from blocks
      const newContent = initialPage.blocks
        ? JSON.stringify(initialPage.blocks)
        : ''
      console.log(
        '[useModulePageEditor] Setting content from blocks:',
        newContent ? `${newContent.substring(0, 50)}...` : 'empty'
      )
      setContent(newContent)

      // Update title dan reset dirty flag
      console.log('[useModulePageEditor] Setting title:', initialPage.title)
      setTitle(initialPage.title || '')

      // Reset dirty flags
      setIsContentDirty(false)
      setIsTitleDirty(false)
      setSaveStatus('saved')
    }
  }, [initialPage, currentPage?.id])

  // Content change handler
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    setIsContentDirty(true)
    setSaveStatus('unsaved')
  }, [])

  // Title change handler
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    setIsTitleDirty(true)
    setSaveStatus('unsaved')
  }, [])

  // Fungsi untuk menyimpan perubahan
  const saveChanges = useCallback(async () => {
    if (!currentPage) return

    try {
      setSaveStatus('saving')
      await updatePage.mutateAsync({
        pageId: currentPage.id,
        updateData: {
          title,
          blocks: currentPage.blocks,
        },
      })
      setSaveStatus('saved')
      setIsContentDirty(false)
      setIsTitleDirty(false)
    } catch (error) {
      console.error('[useModulePageEditor] Error saving changes:', error)
      setSaveStatus('error')
    }
  }, [
    currentPage,
    title,
    updatePage,
    setSaveStatus,
    setIsContentDirty,
    setIsTitleDirty,
  ])

  // Debounced save untuk mengurangi jumlah request
  const debouncedSave = useCallback(
    debounce(() => {
      // Periksa flag navigasi - jangan save jika sedang navigasi halaman
      const isNavigating =
        window.sessionStorage.getItem('isNavigating') === 'true'
      if (isNavigating) {
        console.log(
          '[useModulePageEditor] Navigation in progress, skipping save'
        )
        return
      }

      saveChanges().catch((error) => {
        console.error('[useModulePageEditor] Error in debouncedSave:', error)
      })
    }, 1000),
    [saveChanges]
  )

  // Trigger autosave when content/title changes
  useEffect(() => {
    // Periksa flag navigasi - jangan autosave jika sedang navigasi halaman
    const isNavigating =
      window.sessionStorage.getItem('isNavigating') === 'true'

    if ((isContentDirty || isTitleDirty) && !isNavigating) {
      console.log(
        '[useModulePageEditor] Triggering autosave due to content/title changes'
      )
      debouncedSave()
    } else if (isNavigating) {
      console.log(
        '[useModulePageEditor] Navigation in progress, skipping autosave'
      )
    }
  }, [content, title, isContentDirty, isTitleDirty, debouncedSave])

  // Check for unsaved changes before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isContentDirty || isTitleDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isContentDirty, isTitleDirty])

  return {
    currentPage,
    content,
    title,
    saveStatus,
    isContentDirty,
    isTitleDirty,
    handleContentChange,
    handleTitleChange,
    saveChanges,
    hasUnsavedChanges: isContentDirty || isTitleDirty,
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useModulePageMutation } from './useModulePageMutation'
import { ModulePage, UpdateModulePageInput } from '../types'

// Debounce function untuk autosave
const debounce = <T extends (...args: any[]) => any>(
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
  const [content, setContent] = useState<string>('')
  const [title, setTitle] = useState<string>(initialPage?.title || '')
  const [isContentDirty, setIsContentDirty] = useState(false)
  const [isTitleDirty, setIsTitleDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved'
  )

  // Load page mutation
  const { updatePage } = useModulePageMutation(moduleId)

  // Update current page when initialPage changes
  useEffect(() => {
    if (initialPage && initialPage.id !== currentPage?.id) {
      setCurrentPage(initialPage)
      setContent(initialPage.blocks ? JSON.stringify(initialPage.blocks) : '')
      setTitle(initialPage.title || '')
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

  // Save function
  const saveChanges = useCallback(async () => {
    if (!currentPage?.id || (!isContentDirty && !isTitleDirty)) {
      return
    }

    try {
      setSaveStatus('saving')

      const updateData: UpdateModulePageInput = {}
      if (isContentDirty) {
        try {
          // Covert content string to JSON object for blocks
          updateData.blocks = JSON.parse(content)
        } catch (error) {
          console.error('Error parsing content JSON:', error)
          // Fallback to using content directly if JSON parsing fails
          updateData.content = content
        }
      }
      if (isTitleDirty) updateData.title = title

      await updatePage.mutateAsync({
        pageId: currentPage.id,
        updateData,
      })

      setIsContentDirty(false)
      setIsTitleDirty(false)
      setSaveStatus('saved')
    } catch (error) {
      console.error('Error saving page:', error)
      setSaveStatus('unsaved')
    }
  }, [
    currentPage?.id,
    isContentDirty,
    isTitleDirty,
    content,
    title,
    updatePage,
  ])

  // Debounced save function untuk autosave
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(() => {
      saveChanges()
    }, 2000),
    [saveChanges]
  )

  // Trigger autosave when content/title changes
  useEffect(() => {
    if (isContentDirty || isTitleDirty) {
      debouncedSave()
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

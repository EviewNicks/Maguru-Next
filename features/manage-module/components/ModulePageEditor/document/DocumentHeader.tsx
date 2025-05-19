import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronDown,
  Link,
  MessageSquare,
  MoreHorizontal,
  Share2,
  CheckCircle,
  Save,
  Clock,
  Plus,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import { useModulePageCRUDContext } from '../../../context/ModulePageCRUDContext'

interface DocumentHeaderProps {
  title?: string
  onTitleChange?: (title: string) => void
  saveStatus?: 'saved' | 'saving' | 'unsaved'
  pageId?: string
}

export default function DocumentHeader({
  title = '',
  onTitleChange,
  saveStatus: propsSaveStatus = 'saved',
  pageId,
}: DocumentHeaderProps) {
  const [localTitle, setLocalTitle] = useState<string>(title)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    propsSaveStatus
  )
  const debouncedTitle = useDebounce<string>(localTitle, 1000)

  // Connect to module page CRUD context
  const { savePage } = useModulePageCRUDContext()

  // Handle title input change
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      setLocalTitle(newTitle)
      setSaveStatus('unsaved')

      if (onTitleChange) {
        onTitleChange(newTitle)
      }
    },
    [onTitleChange]
  )

  // Auto-save title when it changes (debounced)
  useEffect(() => {
    if (
      debouncedTitle !== title &&
      pageId &&
      debouncedTitle.trim().length >= 5
    ) {
      const saveTitle = async () => {
        try {
          setSaveStatus('saving')
          await savePage({
            pageId,
            title: debouncedTitle,
          })
          setSaveStatus('saved')
        } catch (error) {
          console.error('Error saving title:', error)
          setSaveStatus('unsaved')
        }
      }

      saveTitle()
    }
  }, [debouncedTitle, title, pageId, savePage])

  // Sync with props
  useEffect(() => {
    setLocalTitle(title)
  }, [title])

  // Sync save status from props
  useEffect(() => {
    setSaveStatus(propsSaveStatus)
  }, [propsSaveStatus])

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saved':
        return (
          <div
            className="flex items-center text-[#a9abaf] mr-2"
            aria-live="polite"
          >
            <CheckCircle
              className="h-3 w-3 mr-1 text-green-500"
              aria-hidden="true"
            />
            <span>Tersimpan</span>
          </div>
        )
      case 'saving':
        return (
          <div
            className="flex items-center text-[#a9abaf] mr-2"
            aria-live="polite"
          >
            <Save className="h-3 w-3 mr-1 animate-pulse" aria-hidden="true" />
            <span>Menyimpan...</span>
          </div>
        )
      case 'unsaved':
        return (
          <div
            className="flex items-center text-[#a9abaf] mr-2"
            aria-live="polite"
          >
            <Clock className="h-3 w-3 mr-1 text-amber-500" aria-hidden="true" />
            <span>Belum tersimpan</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="flex items-center px-4 h-12 border-b border-[#3b3b3b]"
      role="region"
      aria-label="Header dokumen"
    >
      {' '}
      <Button
        variant="ghost"
        size="icon"
        className="mr-1"
        aria-label="Menu utama"
      >
        {' '}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />{' '}
      </Button>
      {/* Title Input */}
      <div className="w-[280px] mr-3">
        <Input
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Untitled Page"
          className="border-0 bg-transparent h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-[#e3e4f2]"
          aria-label="Judul halaman"
        />
      </div>
      {/* Save Status */}
      {renderSaveStatus()}
      <Avatar className="h-6 w-6 bg-[#669df1] mr-2">
        <AvatarFallback className="bg-[#669df1] text-white text-xs">
          EN
        </AvatarFallback>
      </Avatar>
      <Button
        variant="ghost"
        size="icon"
        className="mr-2"
        aria-label="Komentar"
      >
        {' '}
        <MessageSquare className="h-4 w-4" aria-hidden="true" />{' '}
      </Button>{' '}
      <Button
        className="bg-[#669df1] hover:bg-[#669df1]/90 text-white h-8 mr-2"
        aria-label="Publikasikan halaman"
      >
        {' '}
        Publish...{' '}
      </Button>{' '}
      <Button
        variant="ghost"
        className="text-[#a9abaf] h-8 mr-2"
        aria-label="Tutup draft"
      >
        {' '}
        Close draft{' '}
      </Button>
      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent h-8 mr-2"
      >
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>
      <Button
        variant="outline"
        className="border-[#3b3b3b] bg-transparent h-8 mr-2"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 mr-auto">
        <Button className="bg-[#1868db] hover:bg-[#1868db]/90 text-white">
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Button>
        <Button
          variant="outline"
          className="border-[#669df1] text-[#669df1] bg-transparent hover:bg-[#1c2b42]"
        >
          <span className="text-[#bf63f3] mr-1">⭐</span>
          Upgrade
        </Button>
      </div>
    </div>
  )
}

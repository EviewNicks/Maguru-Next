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

interface DocumentHeaderProps {
  title?: string
  onTitleChange?: (title: string) => void
  saveStatus?: 'saved' | 'saving' | 'unsaved'
}

export default function DocumentHeader({
  title = '',
  onTitleChange,
  saveStatus = 'saved',
}: DocumentHeaderProps) {
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saved':
        return (
          <div className="flex items-center text-[#a9abaf] mr-2">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            <span>Tersimpan</span>
          </div>
        )
      case 'saving':
        return (
          <div className="flex items-center text-[#a9abaf] mr-2">
            <Save className="h-3 w-3 mr-1 animate-pulse" />
            <span>Menyimpan...</span>
          </div>
        )
      case 'unsaved':
        return (
          <div className="flex items-center text-[#a9abaf] mr-2">
            <Clock className="h-3 w-3 mr-1 text-amber-500" />
            <span>Belum tersimpan</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center px-4 h-12 border-b border-[#3b3b3b]">
      <Button variant="ghost" size="icon" className="mr-1">
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Title Input */}
      <div className="w-[280px] mr-3">
        <Input
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Untitled Page"
          className="border-0 bg-transparent h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-[#e3e4f2]"
        />
      </div>

      {/* Save Status */}
      {renderSaveStatus()}

      <Avatar className="h-6 w-6 bg-[#669df1] mr-2">
        <AvatarFallback className="bg-[#669df1] text-white text-xs">
          EN
        </AvatarFallback>
      </Avatar>
      <Button variant="ghost" size="icon" className="mr-2">
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button className="bg-[#669df1] hover:bg-[#669df1]/90 text-white h-8 mr-2">
        Publish...
      </Button>
      <Button variant="ghost" className="text-[#a9abaf] h-8 mr-2">
        Close draft
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

import { Button } from '@/components/ui/button'
import {
  AlignLeft,
  Bold,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Link,
  List,
  MoreHorizontal,
  Plus,
} from 'lucide-react'

export default function FormattingToolbar() {
  return (
    <div className="flex items-center px-4 h-10 border-b border-[#3b3b3b]">
      <Button variant="ghost" size="icon" className="mr-1">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="mr-1">
        <ChevronRight className="h-4 w-4 rotate-180" />
      </Button>

      <div className="flex items-center h-8 px-2 mr-1 hover:bg-[#242528] rounded">
        <span className="font-medium mr-1">T</span>
        <ChevronDown className="h-4 w-4" />
      </div>

      <Button variant="ghost" size="icon" className="mr-1">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="mr-1">
        <span className="italic font-serif">I</span>
      </Button>
      <Button variant="ghost" size="icon" className="mr-1">
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-[#3b3b3b] mx-2"></div>

      <div className="flex items-center h-8 px-2 mr-1 hover:bg-[#242528] rounded">
        <AlignLeft className="h-4 w-4 mr-1" />
        <ChevronDown className="h-4 w-4" />
      </div>

      <div className="flex items-center h-8 px-2 mr-1 hover:bg-[#242528] rounded">
        <List className="h-4 w-4 mr-1" />
        <ChevronDown className="h-4 w-4" />
      </div>

      <Button variant="ghost" size="icon" className="mr-1">
        <span className="font-bold">☑</span>
      </Button>

      <Button variant="ghost" size="icon" className="mr-1">
        <Link className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" className="mr-1">
        <ImageIcon className="h-4 w-4" />
      </Button>

      <div className="flex items-center h-8 px-2 mr-1 hover:bg-[#242528] rounded">
        <Plus className="h-4 w-4 mr-1" />
        <ChevronDown className="h-4 w-4" />
      </div>

      <div className="h-4 w-px bg-[#3b3b3b] mx-2"></div>

      <Button variant="ghost" size="icon" className="mr-1">
        <span className="font-bold">⚛</span>
      </Button>

      <Button variant="ghost" size="icon">
        <span className="font-bold">⊞</span>
      </Button>
    </div>
  )
}

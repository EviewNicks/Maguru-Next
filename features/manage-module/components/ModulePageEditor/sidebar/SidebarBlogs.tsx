import { Button } from '@/components/ui/button'
import { Calendar, MoreHorizontal } from 'lucide-react'

export default function SidebarBlogs() {
  return (
    <div className="p-4 border-b border-[#3b3b3b]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-1">📋</span>
          <span>Blogs</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-[#a9abaf]">No blogs in this space</p>
      <div className="flex items-center mt-2">
        <Calendar className="h-4 w-4 mr-2" />
        <span className="text-sm">Calendars</span>
      </div>
    </div>
  )
}

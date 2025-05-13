import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal } from 'lucide-react'

export default function SidebarHeader() {
  return (
    <div className="p-4 border-b border-[#3b3b3b] flex items-center justify-between">
      <div className="flex items-center">
        <Avatar className="h-6 w-6 bg-[#669df1] mr-2">
          <AvatarFallback className="bg-[#669df1] text-white text-xs">
            S
          </AvatarFallback>
        </Avatar>
        <span>Software development</span>
      </div>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}

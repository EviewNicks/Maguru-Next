'use client'

import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarNestedItemProps {
  label: string
  onClick?: () => void
  className?: string
}

export default function SidebarNestedItem({
  label,
  onClick,
  className,
}: SidebarNestedItemProps) {
  return (
    <div
      className={cn(
        'flex items-center py-1 px-2 hover:bg-[#242528] rounded cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="w-4 mr-2"></div>
      <FileText className="h-4 w-4 mr-2" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

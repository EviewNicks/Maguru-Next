'use client'

import { ReactNode } from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/features/manage-module/components/StatusBadge'

interface SidebarNestedItemProps {
  label: ReactNode | string
  onClick?: () => void
  className?: string
  icon?: ReactNode
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isActive?: boolean
  isArchived?: boolean
}

export default function SidebarNestedItem({
  label,
  onClick,
  className,
  icon = <FileText className="h-4 w-4 mr-2" />,
  status,
  isActive = false,
  isArchived = false,
}: SidebarNestedItemProps) {
  return (
    <div
      className={cn(
        'flex items-center py-1 px-2 hover:bg-[#242528] rounded cursor-pointer relative group',
        isActive && 'text-[#669df1] bg-[#1c2b42]',
        className
      )}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#669df1] rounded"></div>
      )}
      <div className="w-2 mr-2"></div>
      {icon}
      <div className="flex items-center justify-between w-full pr-6">
        <span
          className={cn(
            'text-sm truncate',
            isArchived && 'text-gray-400 line-through'
          )}
        >
          {label}
        </span>
        {status && (
          <StatusBadge
            status={status}
            showText={false}
            className="ml-2 flex-shrink-0"
          />
        )}
      </div>
    </div>
  )
}

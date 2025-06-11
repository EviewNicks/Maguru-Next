'use client'

import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface SidebarItemProps {
  icon: ReactNode
  label: string
  onClick?: () => void
}

export default function SidebarItem({
  icon,
  label,
  onClick,
}: SidebarItemProps) {
  return (
    <div
      className="flex items-center py-1 px-2 hover:bg-[#242528] rounded cursor-pointer"
      onClick={onClick}
    >
      <ChevronRight className="h-4 w-4 mr-2" />
      {icon && <div className="mr-2">{icon}</div>}
      <span className="text-sm">{label}</span>
    </div>
  )
}

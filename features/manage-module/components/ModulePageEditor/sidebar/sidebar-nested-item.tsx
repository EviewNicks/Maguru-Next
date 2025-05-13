'use client'

import { FileText } from 'lucide-react'

interface SidebarNestedItemProps {
  label: string
  onClick?: () => void
}

export default function SidebarNestedItem({
  label,
  onClick,
}: SidebarNestedItemProps) {
  return (
    <div
      className="flex items-center py-1 px-2 hover:bg-[#242528] rounded cursor-pointer"
      onClick={onClick}
    >
      <div className="w-4 mr-2"></div>
      <FileText className="h-4 w-4 mr-2" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

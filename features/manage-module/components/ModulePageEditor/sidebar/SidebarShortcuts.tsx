import { FileText } from 'lucide-react'

export default function SidebarShortcuts() {
  return (
    <div className="p-4 border-b border-[#3b3b3b]">
      <div className="flex items-center mb-2">
        <FileText className="h-4 w-4 mr-2" />
        <span>Shortcuts</span>
      </div>
    </div>
  )
}

import SidebarHeader from './SidebarHeader'
import SidebarShortcuts from './SidebarShortcuts'
import SidebarContent from './SidebarContent'
import SidebarBlogs from './SidebarBlogs'
import { ModulePage } from '@/features/manage-module/types/modulePageSchema'

interface SidebarProps {
  expandedItems: Record<string, boolean>
  toggleExpand: (item: string) => void
  pages?: ModulePage[]
  activePage?: ModulePage | null
  onSelectPage?: (page: ModulePage) => void
}

export default function Sidebar({
  expandedItems,
  toggleExpand,
  pages = [],
  activePage,
  onSelectPage,
}: SidebarProps) {
  return (
    <aside className="w-64 border-l border-[#3b3b3b] overflow-y-auto">
      <SidebarHeader />
      <SidebarShortcuts />
      <SidebarContent
        expandedItems={expandedItems}
        toggleExpand={toggleExpand}
        pages={pages}
        activePage={activePage}
        onSelectPage={onSelectPage}
      />
      <SidebarBlogs />

      <div className="p-4">
        <button className="w-full py-2 px-4 border border-[#3b3b3b] rounded bg-transparent text-[#e3e4f2] hover:bg-[#242528]">
          Invite people
        </button>
      </div>
    </aside>
  )
}

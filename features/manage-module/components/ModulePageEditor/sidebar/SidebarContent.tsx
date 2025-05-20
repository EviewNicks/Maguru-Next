'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  FileEdit,
  Trash,
  MoreVertical,
} from 'lucide-react'
import SidebarItem from './SidebarItem'
import SidebarNestedItem from './SIdebarNestedItem'
import { ModulePage } from '@/features/manage-module/types/modulePageSchema'
import { useState } from 'react'
import { CreatePageDialog } from '../dialogs/CreatePageDialog'
import { DeletePageConfirmation } from '../dialogs/DeletePageConfirmation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarContentProps {
  expandedItems: Record<string, boolean>
  toggleExpand: (item: string) => void
  pages?: ModulePage[]
  activePage?: ModulePage | null
  onSelectPage?: (page: ModulePage) => void
}

export default function SidebarContent({
  expandedItems,
  toggleExpand,
  pages = [],
  activePage,
  onSelectPage,
}: SidebarContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<{
    id: string
    title: string
  } | null>(null)

  // Filter pages based on search term
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (page: ModulePage) => {
    setPageToDelete({
      id: page.id,
      title: page.title || 'Untitled Page',
    })
    setDeleteDialogOpen(true)
  }

  return (
    <div className="p-4 border-b border-[#3b3b3b]">
      <div className="flex items-center justify-between mb-2">
        <span>Content</span>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative mb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#96999e]" />
        <Input
          placeholder="Search by title"
          className="pl-8 bg-[#1f1f21] border-[#3b3b3b] h-9 focus-visible:ring-[#669df1]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-1 mt-4">
      
      </div>

      <div className="mt-4">
        <Button variant="ghost" className="w-full justify-start text-[#a9abaf]">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      {/* Dialogs */}
      <CreatePageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {pageToDelete && (
        <DeletePageConfirmation
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          pageId={pageToDelete.id}
          pageTitle={pageToDelete.title}
        />
      )}
    </div>
  )
}

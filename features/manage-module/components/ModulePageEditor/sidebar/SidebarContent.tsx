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
        <SidebarItem
          icon={<FileText className="h-4 w-4" />}
          label="Product Vision"
        />
        <SidebarItem
          icon={<FileText className="h-4 w-4" />}
          label="Roadmap & Planning"
        />
        <SidebarItem
          icon={<FileText className="h-4 w-4" />}
          label="Development Document"
        />
        <SidebarItem icon={<FileText className="h-4 w-4" />} label="EPIC" />

        <div
          className="flex items-center py-1 px-2 hover:bg-[#242528] rounded cursor-pointer"
          onClick={() => toggleExpand('SPRINT')}
        >
          {expandedItems['SPRINT'] ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          <Folder className="h-4 w-4 mr-2" />
          <span className="text-sm">-- SPRINT --</span>
        </div>

        {expandedItems['SPRINT'] && (
          <div className="ml-4 space-y-1">
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="#1 Sprint Document"
            />
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="#2 Sprint Document"
            />
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="#3 Sprint Document"
            />

            <div
              className="flex items-center py-1 px-2 hover:bg-[#242528] rounded cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand('#4 Sprint Document')
              }}
            >
              {expandedItems['#4 Sprint Document'] ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">#4 Sprint Document</span>
            </div>

            {expandedItems['#4 Sprint Document'] && (
              <div className="ml-4 space-y-1">
                <div className="flex items-center py-1 px-2 bg-[#1c2b42] rounded">
                  <div className="w-1 h-4 bg-[#669df1] rounded mr-2"></div>
                  <FileText className="h-4 w-4 mr-2 text-[#669df1]" />
                  <span className="text-sm text-[#669df1]">aasAaAsasa</span>
                  <Badge className="ml-2 bg-[#242528] text-[#a9abaf] text-xs">
                    DRAFT
                  </Badge>
                </div>

                <SidebarNestedItem label="Task-ops-54 -- Riw" />
              </div>
            )}

            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Retrospective"
            />
          </div>
        )}

        <div
          className="flex items-center py-1 px-2 hover:bg-[#242528] rounded cursor-pointer"
          onClick={() => toggleExpand('ModulePages')}
        >
          {expandedItems['ModulePages'] ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          <Folder className="h-4 w-4 mr-2" />
          <span className="text-sm">Module Pages</span>
        </div>

        {expandedItems['ModulePages'] && (
          <div className="ml-4 space-y-1">
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <div
                  key={page.id}
                  className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer group ${
                    activePage?.id === page.id
                      ? 'bg-[#1c2b42]'
                      : 'hover:bg-[#242528]'
                  }`}
                >
                  <div
                    className="flex items-center flex-grow"
                    onClick={() => onSelectPage?.(page)}
                  >
                    {activePage?.id === page.id && (
                      <div className="w-1 h-4 bg-[#669df1] rounded mr-2"></div>
                    )}
                    <FileEdit
                      className={`h-4 w-4 mr-2 ${
                        activePage?.id === page.id ? 'text-[#669df1]' : ''
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        activePage?.id === page.id ? 'text-[#669df1]' : ''
                      }`}
                    >
                      {page.title || 'Untitled Page'}
                    </span>
                  </div>

                  {/* Action Menu - only visible on hover */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Opsi halaman"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#1f1f21] border-[#3b3b3b] text-[#e3e4f2]"
                    >
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-[#242528]"
                        onClick={() => handleOpenDeleteDialog(page)}
                      >
                        <Trash className="h-4 w-4 mr-2 text-red-400" />
                        <span>Hapus Halaman</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#a9abaf] px-2 py-1">
                {searchTerm ? 'No pages found' : 'No pages available'}
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-[#a9abaf] mt-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Page
            </Button>
          </div>
        )}

        <SidebarItem
          icon={<FileText className="h-4 w-4" />}
          label="Tim Structure"
        />
        <SidebarItem icon={<FileText className="h-4 w-4" />} label="TOOLS" />
        <SidebarItem icon={<FileText className="h-4 w-4" />} label="Another" />
        <SidebarNestedItem label="Prompt engineerr expert" />
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
